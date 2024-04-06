const { CreatedWho } = require("./user");
const Trouble = {
  type: "object",
  required: ["chg_id", "troubleTitle", "troubleDesc"],
  properties: {
    id: {
      type: "string",
      example: "1",
    },
    troubleTitle: {
      type: "string",
      example: "title",
    },
    troubleDesc: {
      type: "string",
      example: "FAQ category",
    },
    chg_id: {
      type: "string",
      example: "chg_id",
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

const TroubleInfo = {
  type: "object",
  required: ["title", "content", "category"],
  properties: {
    id: {
      type: "string",
      example: "1",
    },
    troubleTitle: {
      type: "string",
      example: "title",
    },
    troubleDesc: {
      type: "string",
      example: "Description",
    }
  },
};
const TroubleError404 = {
  type: "object",
  properties: {
    status: {
      type: "string",
      example: "404",
    },
    errorCode: {
      type: "string",
      example: "NOT_EXIST_FAQ",
    },
    message: {
      type: "string",
      example: "해당 ID에 대한 소속 정보가 존재하지 않습니다",
    },
  },
};
module.exports = {
  Trouble,
  TroubleInfo,
  TroubleError404,
};
