const { CreatedWho, MobileUser } = require("./user");
const Point = {
  type: "object",
  properties: {
    id: {
      type: "string",
      example: "1",
    },
    pointType: {
      type: "string",
      example: "earn",
    },
    point: {
      type: "integer",
      example: 100,
    },
    pointDate: {
      type: "string",
      example: "2023-08-07 11:54:55",
    },
    bookingId: {
      type: "string",
      example: "1",
    },
    createdAt: {
      type: "string",
      example: "2023-08-07 11:54:55",
    },
    updatedAt: {
      type: "string",
      example: "2023-08-07 11:54:55",
    },
    user: MobileUser,
    createdBy: CreatedWho,
    updatedBy: CreatedWho,
  },
};

module.exports = {
  Point,
};
