const { CreatedWho } = require("./user");
const CarWash = {
  type: "object",
  required: ["car_number", "coupon_count", "member_name", "is_used_service"],
  properties: {
    id: {
      type: "string",
      example: "1",
    },
    car_number: {
      type: "integer",
      example: 4953,
    },
    coupon_count: {
      type: "integer",
      example: 5349,
    },
    price: {
      type: "string",
      example: "price",
    },
    purchase_date: {
      type: "string",
      example: "2023-08-07 11:54:55",
    },
    address: {
      type: "string",
      example: "address",
    },
    date_use: {
      type: "string",
      example: "2023-08-07 11:54:55",
    },
    member_name: {
      type: "string",
      example: "member_name",
    },
    is_used_service: {
      type: "boolean",
      example: false,
    },
    assignment: {
      type: "string",
      example: "assignment",
    },
    use_where: {
      type: "string",
      example: "use_where",
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

const CarWashInfo = {
  type: "object",
  required: ["car_number", "coupon_count", "member_name", "is_used_service"],
  properties: {
    id: {
      type: "string",
      example: "1",
    },
    car_number: {
      type: "integer",
      example: 4953,
    },
    coupon_count: {
      type: "integer",
      example: 5349,
    },
    price: {
      type: "string",
      example: "price",
    },
    purchase_date: {
      type: "string",
      example: "2023-08-07 11:54:55",
    },
    address: {
      type: "string",
      example: "address",
    },
    date_use: {
      type: "string",
      example: "2023-08-07 11:54:55",
    },
    member_name: {
      type: "string",
      example: "member_name",
    },
    is_used_service: {
      type: "boolean",
      example: false,
    },
    assignment: {
      type: "string",
      example: "assignment",
    },
    use_where: {
      type: "string",
      example: "use_where",
    },
    createdAt: {
      type: "string",
      example: "2023-08-07 11:54:55",
    },
    updatedAt: {
      type: "string",
      example: "2023-08-07 11:54:55",
    },
  },
};
const CarWashError404 = {
  type: "object",
  properties: {
    status: {
      type: "string",
      example: "404",
    },
    errorCode: {
      type: "string",
      example: "NOT_EXIST_CAR_WASH",
    },
    message: {
      type: "string",
      example: "해당 ID에 대한 소속 정보가 존재하지 않습니다",
    },
  },
};
module.exports = {
  CarWash,
  CarWashInfo,
  CarWashError404,
};
