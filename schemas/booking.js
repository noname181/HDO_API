const { CreatedWho } = require("./user");
const Booking = {
  type: "object",
  required: ["b_time_in", "b_time_out", "b_date", "b_status"],
  properties: {
    id: {
      type: "string",
      example: "1",
    },
    b_time_in: {
      type: "string",
      example: "b_time_in",
    },
    b_time_out: {
      type: "string",
      example: "b_time_out",
    },
    b_date: {
      type: "string",
      example: "b_date",
    },
    b_status: {
      type: "string",
      example: "deActive",
    },
    createdAt: {
      type: "string",
      example: "2023-08-07 11:54:55",
    },
    updatedAt: {
      type: "string",
      example: "2023-08-07 11:54:55",
    },
    userId: {
      type: "string",
      example: `${CreatedWho.properties.id.example}`,
    },
    vehicleId: {
      type: "interger",
      example: 1,
    },
    chgs_id: {
      type: "interger",
      example: 1,
    },
    chargerModelId: {
      type: "interger",
      example: 1,
    },
    createdBy: CreatedWho,
    updatedBy: CreatedWho,
  },
};

const BookingInfo = {
  type: "object",
  required: ["b_time_in", "b_time_out", "b_date", "b_status"],
  properties: {
    b_time_in: {
      type: "string",
      example: "b_time_in",
    },
    b_time_out: {
      type: "string",
      example: "b_time_out",
    },
    b_date: {
      type: "string",
      example: "b_date",
    },
    b_status: {
      type: "string",
      example: "deActive",
    },
    userId: {
      type: "string",
      example: `${CreatedWho.properties.id.example}`,
    },
    vehicleId: {
      type: "interger",
      example: 1,
    },
    chgs_id: {
      type: "interger",
      example: 1,
    },
    chargerModelId: {
      type: "interger",
      example: 1,
    }
  },
};
const BookingError404 = {
  type: "object",
  properties: {
    status: {
      type: "string",
      example: "404",
    },
    errorCode: {
      type: "string",
      example: "NOT_EXIST_BOOKING",
    },
    message: {
      type: "string",
      example: "해당 ID에 대한 소속 정보가 존재하지 않습니다",
    },
  },
};
module.exports = {
  Booking,
  BookingInfo,
  BookingError404,
};
