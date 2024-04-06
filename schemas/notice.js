const { CreatedWho } = require("./user");
const Notice = {
  type: "object",
  required: ["title", "content", "category"],
  properties: {
    id: {
      type: "string",
      example: "1",
    },
    title: {
      type: "string",
      example: "Notice title",
    },
    count: {
      type: "number",
      example: "Notice count",
    },
    regtime: {
      type: "string",
      example: "Notice regtime",
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

const NoticeInfo = {
  type: "object",
  required: ["title", "content", "category"],
  properties: {
    title: {
      type: "string",
      example: "Notice title",
    },
  },
};
const NoticeError404 = {
  type: "object",
  properties: {
    status: {
      type: "string",
      example: "404",
    },
    errorCode: {
      type: "string",
      example: "Notice not found",
    },
    message: {
      type: "string",
      example: "Notice not found",
    },
  },
};
module.exports = {
  Notice,
  NoticeInfo,
  NoticeError404,
};
