const { CreatedWho } = require("./user");
const ChargerPayment = {
  type: "object",
  required: ["car_number", "charge_speed", "charge_time", "charge_pay", "payment_method", "payment_time"],
  properties: {
    id: {
      type: "string",
      example: "1",
    },
    car_number: {
      type: "string",
      example: "car_number",
    },
    charge_speed: {
      type: "string",
      example: "charge_speed",
    },
    charge_time: {
      type: "string",
      example: "charge_time",
    },
    charge_pay: {
      type: "string",
      example: "charge_pay",
    },
    payment_method: {
      type: "string",
      example: "payment_method",
    },
    payment_time: {
      type: "string",
      example: "2023-08-07 11:54:55",
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
    createdBy: CreatedWho,
    updatedBy: CreatedWho,
  },
};

const ChargerPaymentInfo = {
  type: "object",
  required: ["car_number", "charge_speed", "charge_time", "charge_pay", "payment_method", "payment_time"],
  properties: {
    id: {
      type: "string",
      example: "1",
    },
    car_number: {
      type: "string",
      example: "car_number",
    },
    charge_speed: {
      type: "string",
      example: "charge_speed",
    },
    charge_time: {
      type: "string",
      example: "charge_time",
    },
    charge_pay: {
      type: "string",
      example: "charge_pay",
    },
    payment_method: {
      type: "string",
      example: "payment_method",
    },
    payment_time: {
      type: "string",
      example: "2023-08-07 11:54:55",
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
    }
  }
};

const ChargerPaymentError404 = {
  type: "object",
  properties: {
    status: {
      type: "string",
      example: "404",
    },
    errorCode: {
      type: "string",
      example: "NOT_EXIST_CARD",
    },
    message: {
      type: "string",
      example: "해당 ID에 대한 소속 정보가 존재하지 않습니다",
    },
  },
};
module.exports = {
  ChargerPayment,
  ChargerPaymentInfo,
  ChargerPaymentError404,
};
