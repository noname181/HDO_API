const { CreatedWho } = require("./user");
const Coupon = {
  type: "object",
  required: ["number", "information", "member"],
  properties: {
    id: {
      type: "string",
      example: "1",
    },
    number: {
      type: "string",
      example: "Coupon number",
    },
    information: {
      type: "string",
      example: "Coupon information",
    },
    member: {
      type: "string",
      example: "Coupon member",
    },
    isUsed: {
      type: "boolean",
      example: true,
    },
    division: {
      type: "string",
      example: "Coupon division",
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

const CouponInfo = {
  type: "object",
  required: ["number", "information", "member"],
  properties: {
    number: {
      type: "string",
      example: "Coupon number",
    },
    information: {
      type: "string",
      example: "Coupon information",
    },
    member: {
      type: "string",
      example: "Coupon member",
    },
    division: {
      type: "string",
      example: "Coupon division",
    },
  },
};
const CouponError404 = {
  type: "object",
  properties: {
    status: {
      type: "string",
      example: "404",
    },
    errorCode: {
      type: "string",
      example: "Coupon not found",
    },
    message: {
      type: "string",
      example: "Coupon not found",
    },
  },
};
module.exports = {
  Coupon,
  CouponInfo,
  CouponError404,
};
