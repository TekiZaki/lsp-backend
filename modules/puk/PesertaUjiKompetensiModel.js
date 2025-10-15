// lsp-backend/modules/puk/PesertaUjiKompetensiModel.js
const { query } = require("../../utils/db");
const { mapToCamelCase } = require("../../utils/dataMapper");

// NOTE: This model will directly interact with the 'asesi_profiles' and 'events' tables,
// assuming that a participant in a 'jadwal uji kompetensi' is an 'asesi'
// and the 'events' table (which represents JUK) will have a way to link to asesi.
// For the current SQL schema, we need to create a linking table or modify existing ones.
// I will assume a new linking table 'event_participants' for this functionality.

// SQL Schema Addition Suggestion (add this to your sql.sql file):
/*
CREATE TABLE event_participants (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    asesi_id INT REFERENCES asesi_profiles(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(50) DEFAULT 'Terdaftar', -- e.g., 'Terdaftar', 'Hadir', 'Tidak Hadir', 'Lulus', 'Tidak Lulus'
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, asesi_id) -- An asesi can only be registered once per event
);
*/

const mapPesertaOutputToApi = (dbObject) => {
  if (!dbObject) return null;
  const camelCaseData = mapToCamelCase(dbObject);
  return {
    id: camelCaseData.id,
    jadwalId: camelCaseData.eventId,
    skemaId: camelCaseData.schemeId, // Derived from event's scheme_id
    nama: camelCaseData.fullName, // From asesi_profiles
    noPendaftaran: camelCaseData.registrationNumber, // From asesi_profiles
    noHp: camelCaseData.phoneNumber, // From asesi_profiles
    statusPendaftaran: camelCaseData.status, // From event_participants
    registrationDate: camelCaseData.registrationDate,
  };
};

async function findPesertaByJadwalId(jadwalId) {
  const res = await query(
    `
    SELECT
        ep.id,
        ep.event_id,
        ep.status,
        ep.registration_date,
        ap.id AS asesi_profile_id, -- Keep original asesi_profile ID if needed for other ops
        ap.full_name,
        ap.registration_number,
        ap.phone_number,
        e.scheme_id
    FROM event_participants ep
    JOIN asesi_profiles ap ON ep.asesi_id = ap.id
    JOIN events e ON ep.event_id = e.id
    WHERE ep.event_id = $1
    ORDER BY ap.full_name ASC
    `,
    [jadwalId]
  );
  return res.rows.map(mapPesertaOutputToApi);
}

async function addPeserta(jadwalId, asesiId) {
  // First, check if the asesi exists and is valid
  const asesiCheck = await query(
    "SELECT id FROM asesi_profiles WHERE id = $1",
    [asesiId]
  );
  if (asesiCheck.rows.length === 0) {
    throw new Error("Asesi with provided ID not found.");
  }

  // Then, add to event_participants
  const res = await query(
    `INSERT INTO event_participants (event_id, asesi_id)
     VALUES ($1, $2)
     RETURNING id, event_id, asesi_id, status, registration_date`,
    [jadwalId, asesiId]
  );

  // After insertion, fetch complete data to return a structured object
  const newParticipant = res.rows[0];
  const participantDetail = await query(
    `
    SELECT
        ep.id,
        ep.event_id,
        ep.status,
        ep.registration_date,
        ap.id AS asesi_profile_id,
        ap.full_name,
        ap.registration_number,
        ap.phone_number,
        e.scheme_id
    FROM event_participants ep
    JOIN asesi_profiles ap ON ep.asesi_id = ap.id
    JOIN events e ON ep.event_id = e.id
    WHERE ep.id = $1
    `,
    [newParticipant.id]
  );

  return mapPesertaOutputToApi(participantDetail.rows[0]);
}

async function removePeserta(jadwalId, pesertaId) {
  // pesertaId here refers to the ID in the `event_participants` table
  const res = await query(
    "DELETE FROM event_participants WHERE event_id = $1 AND id = $2 RETURNING id",
    [jadwalId, pesertaId]
  );
  return res.rows[0] ? { id: res.rows[0].id } : null;
}

module.exports = {
  findPesertaByJadwalId,
  addPeserta,
  removePeserta,
};
