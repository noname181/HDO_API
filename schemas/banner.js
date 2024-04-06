const { CreatedWho } = require("./user");
const Banner = {
  type: "object",
  required: ["title", "content", "category"],
  properties: {
    id: {
      type: "string",
      example: "1",
    },
    title: {
      type: "string",
      example: "title",
    },
    image: {
      type: "string",
      example: "image",
    },
    number: {
      type: "interger",
      example: "number",
    },
    view: {
      type: "string",
      example: "views",
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

const BannerInfo = {
  type: "object",
  required: ["title", "content", "category"],
  properties: {
    title: {
      type: "string",
      example: "title",
    },
    number: {
      type: "interger",
      example: 1,
    },
    image: {
      type: "string",
      example: "image",
    },
  },
};
const BannerError404 = {
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
  Banner,
  BannerInfo,
  BannerError404,
};
