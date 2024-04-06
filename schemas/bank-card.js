const { CreatedWho } = require("./user");
const Card = {
  type: "object",
  required: ["card_number", "card_name", "expiration_date", "birthday", "password", "is_favorited"],
  properties: {
    id: {
      type: "string",
      example: "1",
    },
    card_number: {
      type: "string",
      example: "card_number",
    },
    card_name: {
      type: "string",
      example: "card_name",
    },
    expiration_date: {
      type: "string",
      example: "expiration_date",
    },
    birthday: {
      type: "string",
      example: "birthday",
    },
    password: {
      type: "string",
      example: "password",
    },
    is_favorited: {
      type: "string",
      example: false,
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

const CardInfo = {
  type: "object",
  required: ["card_number", "card_name", "expiration_date", "birthday", "password", "is_favorited"],
  properties: {
    id: {
      type: "string",
      example: "1",
    },
    card_number: {
      type: "string",
      example: "card_number",
    },
    card_name: {
      type: "string",
      example: "card_name",
    },
    expiration_date: {
      type: "string",
      example: "expiration_date",
    },
    birthday: {
      type: "string",
      example: "birthday",
    },
    password: {
      type: "string",
      example: "password",
    },
    is_favorited: {
      type: "string",
      example: false,
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
  },
};
const CardError404 = {
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
  Card,
  CardInfo,
  CardError404,
};
