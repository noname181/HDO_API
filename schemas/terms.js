const { CreatedWho } = require("./user");
const TERMS = {
  type: "object",
  required: ["title", "content", "category"],
  properties: {
    id: {
      type: "string",
      example: "1",
    },
    title: {
      type: "string",
      example: "TERMS title",
    },
    category: {
      type: "string",
      example: "TERMS category",
    },
    content: {
      type: "string",
      example: "TERMS content",
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

const TERMSInfo = {
  type: "object",
  required: ["title", "content", "category"],
  properties: {
    title: {
      type: "string",
      example: "TERMS title",
    },
    category: {
      type: "string",
      example: "TERMS category",
    },
    content: {
      type: "string",
      example: "TERMS content",
    },
  },
};
const TERMSError404 = {
  type: "object",
  properties: {
    status: {
      type: "string",
      example: "404",
    },
    errorCode: {
      type: "string",
      example: "NOT_EXIST_TERMS",
    },
    message: {
      type: "string",
      example: "해당 ID에 대한 약관 정보가 존재하지 않습니다",
    },
  },
};
module.exports = {
  TERMS,
  TERMSInfo,
  TERMSError404,
};
