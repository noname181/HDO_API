const { CreatedWho } = require("./user");
const ChargeConnection = {
  type: "object",
  required: ["chgs_id", "chg_id", "chargeAmount", "startTime", "endTime"],
  properties: {
    id: {
      type: "string",
      example: "1",
    },
    chgs_id: {
      type: "string",
      example: "chgs_id",
    },
    chg_id: {
      type: "string",
      example: "chg_id",
    },
    chargeAmount: {
      type: "string",
      example: "chargeAmount",
    },
    startTime: {
      type: "string",
      example: "startTime",
    },
    endTime: {
      type: "string",
      example: "endTime",
    },
    scanType: {
      type: "integer",
      example: 0,
    },
    chargeType: {
      type: "inte",
      example: 1,
    },
    estimateTime: {
      type: "inte",
      example: "estimateTime",
    },
    pointId: {
      type: 0,
      example: "pointId",
    },
    couponId: {
      type: 0,
      example: "couponId",
    },
    couponPrice: {
      type: "string",
      example: "couponPrice",
    },
    membershipOrNot: {
      type: 1,
      example: "membershipOrNot",
    },
    chargeUnitPrice: {
      type: "string",
      example: "chargeUnitPrice",
    }, 
    chargeAmountKwh: {
      type: 100,
      example: "chargeAmountKwh",
    },
    chargeAmountPercent: {
      type: 1,
      example: "chargeAmountPercent",
    },
    remainTime: {
      type: 100,
      example: "remainTime",
    },
    chargeStatus: {
      type: "string",
      example: "chargeStatus",
    },
    selectedTime: {
      type: "string",
      example: "selectedTime",
    },
    canceledTime: {
      type: "string",
      example: "canceledTime",
    },
    completedTime: {
      type: "string",
      example: "completedTime",
    },
    penaltyNotExit: {
      type: 100,
      example: "penaltyNotExit",
    },
    chargeCost: {
      type: 100,
      example: "chargeCost",
    },
    discountUse: {
      type: 100,
      example: "discountUse",
    },
    freeChargeKWh: {
      type: 100,
      example: "freeChargeKWh",
    },
    freeChargePrice: {
      type: 100,
      example: "freeChargePrice",
    },
    chargingCouponKWh: {
      type: 100,
      example: "chargingCouponKWh",
    },
    chargingCouponPrice: {
      type: 100,
      example: "chargingCouponPrice",
    },
    totalPay: {
      type: 100,
      example: "totalPay",
    },
    regtime: {
      type: "string",
      example: "regtime",
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
    chg_id: {
      type: "interger",
      example: 1,
    },
    chgs_id: {
      type: "interger",
      example: 1,
    },
    bankCardId: {
      type: "interger",
      example: 1,
    },
    createdBy: CreatedWho,
    updatedBy: CreatedWho,
  },
};

const ChargeConnectionInfo = {
  type: "object",
  required: ["chargeAmount", "startTime", "endTime"],
  properties: {
    chg_id: {
      type: "string",
      example: "1",
    },
    currectBatteryPercent: {
      type: "integer",
      example: 0,
    },
    timeCharged: {
      type: "interger",
      example: 1,
    },
    startTime: {
      type: "date",
      example: "2023-08-07 11:54:55",
    },
    estimateTime: {
      type: "date",
      example: "2023-08-07 11:54:55",
    },
    endTime: {
      type: "date",
      example: "2023-08-07 11:54:55",
    }, 
    chargeAmountKwh: {
      type: "interger",
      example: 100,
    },
    chargeAmountPercent: {
      type: "interger",
      example: 100,
    },
    chargeStatus: {
      type: "string",
      example: "status",
    },
    canceledTime: {
      type: "date",
      example: "2023-08-07 11:54:55",
    },
    completedTime: {
      type: "date",
      example: "2023-08-07 11:54:55",
    },
  },
};

const RefreshChargeConnection = {
  type: "object",
  required: ["chgs_id", "chg_id", "chargeAmount", "startTime", "endTime"],
  properties: {
    chg_id: {
      type: "string",
      example: "chg_id",
    },
    chargeAmount: {
      type: "string",
      example: "chargeAmount",
    },
    startTime: {
      type: "string",
      example: "startTime",
    },
    endTime: {
      type: "string",
      example: "endTime",
    },
    estimateTime: {
      type: "inte",
      example: "estimateTime",
    }, 
    chargeAmountKwh: {
      type: 100,
      example: "chargeAmountKwh",
    },
    chargeAmountPercent: {
      type: 1,
      example: "chargeAmountPercent",
    },
    chargeStatus: {
      type: "string",
      example: "chargeStatus",
    },
    canceledTime: {
      type: "string",
      example: "canceledTime",
    },
    completedTime: {
      type: "string",
      example: "completedTime",
    },
  },
};
module.exports = {
  ChargeConnection,
  ChargeConnectionInfo,
  RefreshChargeConnection
};
