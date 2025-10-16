// lsp-backend/modules/sms/SMSModel.js
const { query } = require("../../utils/db");

// NOTE: This model assumes two tables:
// `sms_masuk`: id, tanggal, jam, isi_pesan, status ('Masuk')
// `sms_keluar`: id, tanggal, jam, penerima_nama, penerima_nomor, isi_pesan, status ('Terkirim', 'Gagal', 'Menunggu')

async function findAllMasuk() {
  const res = await query(
    "SELECT * FROM sms_masuk ORDER BY tanggal DESC, jam DESC"
  );
  return res.rows;
}

async function findAllKeluar() {
  const res = await query(
    "SELECT * FROM sms_keluar ORDER BY tanggal DESC, jam DESC"
  );
  return res.rows;
}

async function createKeluar(data) {
  const { penerima, isi_pesan, status } = data;
  // 'penerima' is expected to be an object { nama, nomor }
  const { nama: penerima_nama, nomor: penerima_nomor } = penerima;

  const res = await query(
    "INSERT INTO sms_keluar (tanggal, jam, penerima_nama, penerima_nomor, isi_pesan, status) VALUES (CURRENT_DATE, CURRENT_TIME, $1, $2, $3, $4) RETURNING *",
    [penerima_nama, penerima_nomor, isi_pesan, status || "Menunggu"]
  );
  return res.rows[0];
}

module.exports = {
  findAllMasuk,
  findAllKeluar,
  createKeluar,
};
