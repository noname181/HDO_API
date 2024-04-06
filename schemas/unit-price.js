const { CreatedWho } = require("./user");
const UnitPriceSet = {
  type: "object",
  required: [
  "unitPrice1",
  "unitPrice2",
  "unitPrice3",
  "unitPrice4",
  "unitPrice5",
  "unitPrice6",
  "unitPrice7",
  "unitPrice8",
  "unitPrice9",
  "unitPrice10",
  "unitPrice11",
  "unitPrice12",
  "unitPrice13",
  "unitPrice14",
  "unitPrice15",
  "unitPrice16",
  "unitPrice17",
  "unitPrice18",
  "unitPrice19",
  "unitPrice20",
  "unitPrice21",
  "unitPrice22",
  "unitPrice23",
  "unitPrice24",
  "unitPriceSetName",
  "registerDate"],
  properties: {
    id: {
      type: "string",
      example: "1",
    },
    unitPriceSetName: {
      type: "string",
      example: "string"
    },
    unitPrice1: {
      type: "interger",
      example: 100
    },
    unitPrice2: {
      type: "interger",
      example: 100
    },
    unitPrice3: {
      type: "interger",
      example: 100
    },
    unitPrice4: {
      type: "interger",
      example: 100
    },
    unitPrice5: {
      type: "interger",
      example: 100
    },
    unitPrice6: {
      type: "interger",
      example: 100
    },
    unitPrice7: {
      type: "interger",
      example: 100
    },
    unitPrice8: {
      type: "interger",
      example: 100
    },
    unitPrice9: {
      type: "interger",
      example: 100
    },
    unitPrice10: {
      type: "interger",
      example: 100
    },
    unitPrice11: {
      type: "interger",
      example: 100
    },
    unitPrice12: {
      type: "interger",
      example: 100
    },
    unitPrice13: {
      type: "interger",
      example: 100
    },
    unitPrice14: {
      type: "interger",
      example: 100
    },
    unitPrice15: {
      type: "interger",
      example: 100
    },
    unitPrice16: {
      type: "interger",
      example: 100
    },
    unitPrice17: {
      type: "interger",
      example: 100
    },
    unitPrice18: {
      type: "interger",
      example: 100
    },
    unitPrice19: {
      type: "interger",
      example: 100
    },
    unitPrice20: {
      type: "interger",
      example: 100
    },
    unitPrice21: {
      type: "interger",
      example: 100
    },
    unitPrice22: {
      type: "interger",
      example: 100
    },
    unitPrice23: {
      type: "interger",
      example: 100
    },
    unitPrice24: {
      type: "interger",
      example: 100
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
const UnitPriceSetError404 = {
  type: "object",
  properties: {
    status: {
      type: "string",
      example: "404",
    },
    errorCode: {
      type: "string",
      example: "NOT_EXIST_UNIT_PRICE",
    },
    message: {
      type: "string",
      example: "해당 ID에 대한 소속 정보가 존재하지 않습니다",
    },
  },
};
module.exports = {
  UnitPriceSet,
  UnitPriceSetError404,
};
