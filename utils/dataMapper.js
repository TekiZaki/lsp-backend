// lsp-backend/utils/dataMapper.js

/**
 * Mengubah string dari camelCase menjadi snake_case.
 * Contoh: "namaLsp" -> "nama_lsp"
 */
const toSnakeCase = (str) => {
  if (!str) return str;
  return str.replace(/([A-Z])/g, "_$1").toLowerCase();
};

/**
 * Mengubah string dari snake_case menjadi camelCase.
 * Contoh: "nama_lsp" -> "namaLsp"
 */
const toCamelCase = (str) => {
  if (!str) return str;
  return str.replace(/([_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("_", "");
  });
};

/**
 * Mengubah kunci objek dari camelCase ke snake_case.
 */
const mapToSnakeCase = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;

  return Object.keys(obj).reduce((acc, key) => {
    const newKey = toSnakeCase(key);
    acc[newKey] = obj[key];
    return acc;
  }, {});
};

/**
 * Mengubah kunci objek atau array objek dari snake_case ke camelCase.
 */
const mapToCamelCase = (data) => {
  if (!data) return data;

  // Jika input adalah array, map setiap item
  if (Array.isArray(data)) {
    return data.map(mapToCamelCase);
  }

  // Jika input bukan objek, kembalikan data asli
  if (typeof data !== "object" || data === null) return data;

  // Jika input adalah objek, konversi kuncinya
  return Object.keys(data).reduce((acc, key) => {
    const newKey = toCamelCase(key);
    acc[newKey] = data[key];
    return acc;
  }, {});
};

module.exports = {
  mapToSnakeCase,
  mapToCamelCase,
};
