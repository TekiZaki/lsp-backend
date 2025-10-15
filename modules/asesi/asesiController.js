// lsp-backend/modules/asesi/asesiController.js
const asesiModel = require("./asesiModel");
const globalModel = require("../../models/globalModel");
const { getClient } = require("../../utils/db");
const { mapToCamelCase, mapToSnakeCase } = require("../../utils/dataMapper");

// Helper untuk mengambil nama skema
async function getSchemeName(schemeId) {
  if (!schemeId) return null;
  const scheme = await asesiModel.getCertificationSchemeById(schemeId);
  return scheme ? scheme.name : null;
}

// ====================================================================
// PUBLIC/UMUM (untuk menampilkan data asesi yang terverifikasi/kompeten)
// ====================================================================

// Mendapatkan daftar provinsi dengan jumlah asesi
async function getProvincesWithAsesiCount(request, reply) {
  try {
    const data = await asesiModel.getProvincesWithAsesiCount();
    reply.send(mapToCamelCase(data));
  } catch (error) {
    console.error("Error getting provinces with asesi count:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

// Mendapatkan daftar kota/kabupaten dengan jumlah asesi untuk provinsi tertentu
async function getCitiesByProvinceId(request, reply) {
  try {
    const { provinsiId } = request.params;
    const data = await asesiModel.getCitiesByProvinceId(provinsiId);
    reply.send(mapToCamelCase(data));
  } catch (error) {
    console.error("Error getting cities by province ID:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

// Mendapatkan daftar asesi untuk kota tertentu
async function getAsesiByCityId(request, reply) {
  try {
    const { kotaId } = request.params;
    const data = await asesiModel.getAsesiByCityId(kotaId);
    reply.send(mapToCamelCase(data));
  } catch (error) {
    console.error("Error getting asesi by city ID:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

// ====================================================================
// ADMIN/PRIVILEGED (untuk manajemen data asesi)
// ====================================================================

// Mendapatkan semua asesi (dengan filter dan status)
async function getAllAsesi(request, reply) {
  try {
    const { status, isBlocked, search } = request.query; // status: 'belum terverifikasi', 'terverifikasi', 'kompeten', 'belum kompeten'
    const data = await asesiModel.findAllAsesi(status, isBlocked, search);

    const asesiWithSchemeNames = await Promise.all(
      data.map(async (asesi) => {
        const schemeName = await getSchemeName(asesi.scheme_id);
        return {
          ...asesi,
          schemeName,
        };
      })
    );

    reply.send(mapToCamelCase(asesiWithSchemeNames));
  } catch (error) {
    console.error("Error getting all asesi:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

// Mendapatkan detail asesi berdasarkan ID
async function getAsesiById(request, reply) {
  try {
    const { id } = request.params;
    const asesi = await asesiModel.findAsesiById(id);

    if (!asesi) {
      return reply.status(404).send({ message: "Asesi not found" });
    }

    const schemeName = await getSchemeName(asesi.scheme_id);

    reply.send(
      mapToCamelCase({
        ...asesi,
        schemeName,
      })
    );
  } catch (error) {
    console.error("Error getting asesi by ID:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

// Membuat asesi baru (manual, bukan via registrasi user publik)
async function createAsesi(request, reply) {
  const client = await getClient();
  try {
    const asesiData = mapToSnakeCase(request.body);
    const {
      username,
      password,
      email,
      full_name,
      ktp_number,
      registration_number,
      scheme_id, // Wajib disertakan saat membuat asesi baru
    } = asesiData;

    if (
      !username ||
      !password ||
      !email ||
      !full_name ||
      !registration_number ||
      !scheme_id
    ) {
      return reply.status(400).send({ message: "Required fields are missing" });
    }

    await client.query("BEGIN");

    // 1. Dapatkan role_id 'Asesi'
    const role = await globalModel.getRoleByName("Asesi");
    if (!role) {
      await client.query("ROLLBACK");
      return reply.status(400).send({ message: "Role 'Asesi' not found" });
    }
    const role_id = role.id;

    // 2. Buat user baru (Tabel users)
    const newUser = await asesiModel.createUserForAsesi(
      client,
      username,
      password, // Asumsi password sudah di-hash di model atau akan di-hash di sini
      email,
      role_id
    );

    // 3. Buat profil Asesi
    const newAsesi = await asesiModel.createAsesiProfileWithUserId(
      client,
      newUser.id,
      {
        ...asesiData,
        user_id: newUser.id, // Pastikan user_id terkait dengan profil
      }
    );

    await client.query("COMMIT");

    reply.status(201).send(
      mapToCamelCase({
        message: "Asesi created successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
        asesi: newAsesi,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating asesi:", error);
    if (error.code === "23505") {
      // Unique violation
      return reply
        .status(409)
        .send({ message: `Duplicate entry for ${error.detail}` });
    }
    reply.status(500).send({ message: "Internal server error" });
  } finally {
    client.release();
  }
}

// Memperbarui data asesi
async function updateAsesi(request, reply) {
  try {
    const { id } = request.params;
    const asesiData = mapToSnakeCase(request.body);

    const updatedAsesi = await asesiModel.updateAsesi(id, asesiData);

    if (!updatedAsesi) {
      return reply.status(404).send({ message: "Asesi not found" });
    }

    const schemeName = await getSchemeName(updatedAsesi.scheme_id);

    reply.send(
      mapToCamelCase({
        message: "Asesi updated successfully",
        asesi: { ...updatedAsesi, schemeName },
      })
    );
  } catch (error) {
    console.error("Error updating asesi:", error);
    if (error.code === "23505") {
      return reply
        .status(409)
        .send({ message: `Duplicate entry for ${error.detail}` });
    }
    reply.status(500).send({ message: "Internal server error" });
  }
}

// Menghapus asesi
async function deleteAsesi(request, reply) {
  const client = await getClient();
  try {
    const { id } = request.params;

    await client.query("BEGIN");

    // Dapatkan user_id dari asesi_profiles
    const asesiProfile = await asesiModel.findAsesiProfileById(id);
    if (!asesiProfile) {
      await client.query("ROLLBACK");
      return reply.status(404).send({ message: "Asesi not found" });
    }
    const userId = asesiProfile.user_id;

    // Hapus asesi dari asesi_profiles
    const deletedAsesi = await asesiModel.deleteAsesi(client, id);

    // Hapus user dari tabel users (akan cascade jika ada relasi yang tepat)
    await asesiModel.deleteUser(client, userId);

    await client.query("COMMIT");

    reply.send(
      mapToCamelCase({
        message: "Asesi and associated user deleted successfully",
        deletedId: deletedAsesi.id,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting asesi:", error);
    reply.status(500).send({ message: "Internal server error" });
  } finally {
    client.release();
  }
}

// Memverifikasi Asesi
async function verifyAsesi(request, reply) {
  try {
    const { id } = request.params;
    const verifiedAsesi = await asesiModel.updateAsesi(id, {
      status: "terverifikasi",
    });

    if (!verifiedAsesi) {
      return reply.status(404).send({ message: "Asesi not found" });
    }

    reply.send(
      mapToCamelCase({ message: "Asesi verified successfully", verifiedAsesi })
    );
  } catch (error) {
    console.error("Error verifying asesi:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

// Memblokir Asesi
async function blockAsesi(request, reply) {
  try {
    const { id } = request.params;
    const blockedAsesi = await asesiModel.updateAsesi(id, {
      is_blocked: true,
    });

    if (!blockedAsesi) {
      return reply.status(404).send({ message: "Asesi not found" });
    }

    reply.send(
      mapToCamelCase({ message: "Asesi blocked successfully", blockedAsesi })
    );
  } catch (error) {
    console.error("Error blocking asesi:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

// Membuka blokir Asesi
async function unblockAsesi(request, reply) {
  try {
    const { id } = request.params;
    const unblockedAsesi = await asesiModel.updateAsesi(id, {
      is_blocked: false,
    });

    if (!unblockedAsesi) {
      return reply.status(404).send({ message: "Asesi not found" });
    }

    reply.send(
      mapToCamelCase({
        message: "Asesi unblocked successfully",
        unblockedAsesi,
      })
    );
  } catch (error) {
    console.error("Error unblocking asesi:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

// Mengimpor data asesi dari file Excel (massal)
async function importAsesi(request, reply) {
  const client = await getClient();
  try {
    const asesiList = request.body; // Array of asesi objects from parsed Excel

    if (!Array.isArray(asesiList) || asesiList.length === 0) {
      return reply.status(400).send({ message: "No data provided for import" });
    }

    await client.query("BEGIN");

    const importedAsesi = [];
    const role = await globalModel.getRoleByName("Asesi");
    if (!role) {
      await client.query("ROLLBACK");
      return reply.status(400).send({ message: "Role 'Asesi' not found" });
    }
    const role_id = role.id;

    for (const data of asesiList) {
      const asesiData = mapToSnakeCase(data);
      const {
        username,
        password, // Asumsi password di file Excel adalah plain text dan perlu di-hash
        email,
        full_name,
        registration_number,
        scheme_code, // Kode skema dari Excel
        ktp_number,
        phone_number,
        address,
        education,
        assessment_date,
        plotting_asesor,
        documents_status,
        certificate_status,
        photo_url,
      } = asesiData;

      // Ambil ID skema berdasarkan kode skema
      let scheme_id = null;
      if (scheme_code) {
        const scheme = await asesiModel.getCertificationSchemeByCode(
          scheme_code
        );
        if (scheme) {
          scheme_id = scheme.id;
        } else {
          console.warn(`Scheme with code '${scheme_code}' not found.`);
        }
      }

      // Pastikan username, email, full_name, registration_number ada untuk setiap entri
      if (!username || !email || !full_name || !registration_number) {
        console.warn(
          `Skipping row due to missing essential fields: ${JSON.stringify(
            data
          )}`
        );
        continue;
      }

      // Cek apakah user/asesi sudah ada
      let user = await asesiModel.findUserByUsername(username);
      let newUserId;

      if (user) {
        // User sudah ada, update profil asesi jika perlu
        newUserId = user.id;
        const existingAsesiProfile = await asesiModel.findAsesiProfileByUserId(
          newUserId
        );
        if (existingAsesiProfile) {
          await asesiModel.updateAsesi(existingAsesiProfile.id, {
            full_name,
            ktp_number,
            phone_number,
            address,
            education,
            registration_number,
            scheme_id,
            assessment_date,
            plotting_asesor,
            documents_status,
            certificate_status,
            photo_url,
            // status dan is_blocked mungkin tidak diupdate otomatis saat impor, kecuali ada kolom eksplisit di Excel
          });
          importedAsesi.push({ ...existingAsesiProfile, ...asesiData });
        } else {
          // User ada tapi profil asesi tidak ada, buat profil asesi baru
          const newAsesiProfile = await asesiModel.createAsesiProfileWithUserId(
            client,
            newUserId,
            {
              full_name,
              ktp_number,
              phone_number,
              address,
              education,
              registration_number,
              scheme_id,
              assessment_date,
              plotting_asesor,
              documents_status,
              certificate_status,
              photo_url,
            }
          );
          importedAsesi.push(newAsesiProfile);
        }
      } else {
        // User belum ada, buat user dan profil asesi baru
        const newUser = await asesiModel.createUserForAsesi(
          client,
          username,
          password || "defaultpassword", // Gunakan password default jika tidak ada di Excel
          email,
          role_id
        );
        newUserId = newUser.id;

        const newAsesiProfile = await asesiModel.createAsesiProfileWithUserId(
          client,
          newUserId,
          {
            full_name,
            ktp_number,
            phone_number,
            address,
            education,
            registration_number,
            scheme_id,
            assessment_date,
            plotting_asesor,
            documents_status,
            certificate_status,
            photo_url,
          }
        );
        importedAsesi.push(newAsesiProfile);
      }
    }

    await client.query("COMMIT");

    reply.status(200).send({
      message: `${importedAsesi.length} Asesi imported/updated successfully`,
      data: mapToCamelCase(importedAsesi),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error during asesi import:", error);
    reply.status(500).send({ message: "Internal server error" });
  } finally {
    client.release();
  }
}

module.exports = {
  getProvincesWithAsesiCount,
  getCitiesByProvinceId,
  getAsesiByCityId,
  getAllAsesi,
  getAsesiById,
  createAsesi,
  updateAsesi,
  deleteAsesi,
  verifyAsesi,
  blockAsesi,
  unblockAsesi,
  importAsesi, // Export baru
};
