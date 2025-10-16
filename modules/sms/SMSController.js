// lsp-backend/modules/sms/SMSController.js
const smsModel = require("./SMSModel");
const { mapToCamelCase, mapToSnakeCase } = require("../../utils/dataMapper");

async function getSmsMasuk(request, reply) {
  try {
    const data = await smsModel.findAllMasuk();
    reply.send(mapToCamelCase(data));
  } catch (error) {
    console.error("Error getting incoming SMS:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function getSmsKeluar(request, reply) {
  try {
    const data = await smsModel.findAllKeluar();
    reply.send(mapToCamelCase(data));
  } catch (error) {
    console.error("Error getting outgoing SMS:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function sendSms(request, reply) {
  try {
    const newData = await smsModel.createKeluar(mapToSnakeCase(request.body));
    reply.status(201).send(mapToCamelCase(newData));
  } catch (error) {
    console.error("Error sending SMS:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

module.exports = {
  getSmsMasuk,
  getSmsKeluar,
  sendSms,
};
