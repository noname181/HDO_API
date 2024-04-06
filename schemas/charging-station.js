const { CreatedWho } = require("./user");
const ChargingStation = {
  type: "object",
  required: ["id", "chgs_station_id", "chgs_name", "status"],
  properties: {
    id: {
      type: "id",
      example: "1",
    },
    chgs_station_id: {
      type: "string",
      example: "chgs_station_id",
    },
    status: {
      type: "string",
      example: "status",
    },
    chgs_name: {
      type: "string",
      example: "chgs_name",
    },
    createdAt: {
      type: "string",
      example: "2023-08-07 11:54:55",
    },
    updatedAt: {
      type: "string",
      example: "2023-08-07 11:54:55",
    },
    createdBy: CreatedWho,
    updatedBy: CreatedWho,
  },
};
module.exports = {
  ChargingStation,
};
