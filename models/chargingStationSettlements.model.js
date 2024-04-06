const cryptor = require('../util/cryptor');
('use strict');
const { Model, DataTypes } = require('sequelize');

/* EasyPay 거래내역레코드데이터 */
module.exports = (sequelize, DataTypes) => {
  class ChargingStationSettlements extends Model {}
  ChargingStationSettlements.init(
    {
      stationName: {
        type: DataTypes.STRING,
        comment: '충전소의 이름',
      },
      stationID: {
        type: DataTypes.STRING,
        comment: '충전소의 고유 ID',
      },
      chargerID: {
        type: DataTypes.STRING,
        comment: '충전기의 고유 ID',
      },
      totalPowerKW: {
        type: DataTypes.FLOAT,
        comment: '총 충전 전력 (kw)',
      },
      totalFee: {
        type: DataTypes.INTEGER,
        comment: '총 사용 요금',
      },
      totalChargingTime: {
        type: DataTypes.INTEGER,
        comment: '총 충전 시간',
      },
      settlementStartTime: {
        type: DataTypes.DATE,
        comment: '정산 시작 시간',
      },
      settlementEndTime: {
        type: DataTypes.DATE,
        comment: '정산 종료 시간',
      },
      result: {
        type: DataTypes.STRING,
        comment: '정산 결과',
      },
      sapStartTime: {
        type: DataTypes.DATE,
        comment: 'SAP 연계 시작 시간',
      },
      sapEndTime: {
        type: DataTypes.DATE,
        comment: 'SAP 연계 종료 시간',
      },
      sapResult: {
        type: DataTypes.STRING,
        comment: 'SAP 연계 결과',
      },
    },
    {
      sequelize,
      modelName: 'ChargingStationSettlements',
      timestamps: true,
      createdAt: true,
      updatedAt: false,
      paranoid: false,
    }
  );
  return ChargingStationSettlements;
};
