// lsp-backend/modules/verifikasi/VerifikasiController.js
const verifikasiModel = require("./VerifikasiModel");
const { mapToCamelCase } = require("../../utils/dataMapper");

async function getVerificationData(request, reply) {
  try {
    const { asesiId } = request.params;
    const asesi = await verifikasiModel.findAsesiForVerification(asesiId);

    if (!asesi) {
      return reply.status(404).send({ message: "Asesi not found" });
    }

    const schemeId = asesi.scheme_id;

    // Fetch all related data in parallel
    const [
      persyaratanSkema,
      persyaratanBiaya,
      dokumenAsesi,
      jadwalAsesmen,
      unitKompetensi,
    ] = await Promise.all([
      verifikasiModel.findSchemeRequirements(schemeId),
      verifikasiModel.findSchemeCosts(schemeId),
      verifikasiModel.findAsesiDocuments(asesiId),
      verifikasiModel.findAvailableSchedules(schemeId),
      verifikasiModel.findUnitKompetensiByScheme(schemeId),
    ]);

    const responseData = {
      asesiUntukVerifikasi: {
        id: asesi.id,
        nama: asesi.full_name,
        noPendaftaran: asesi.registration_number,
        pendidikan: asesi.education,
        skema: {
          id: asesi.scheme_id,
          kode: asesi.scheme_code,
          nama: asesi.scheme_name,
        },
        statusPembayaran: asesi.payment_status || "belum divalidasi", // Assuming payment_status column
      },
      persyaratanSkema,
      persyaratanBiaya,
      dokumenAsesi,
      jadwalAsesmenTersedia: jadwalAsesmen,
      unitKompetensiData: unitKompetensi,
    };

    reply.send(mapToCamelCase(responseData));
  } catch (error) {
    console.error("Error getting verification data:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

module.exports = {
  getVerificationData,
};
