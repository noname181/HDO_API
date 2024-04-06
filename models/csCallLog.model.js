const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
/* 상담 내역 */
module.exports = (sequelize, DataTypes) => {
  class CsCallLog extends Model {}
  CsCallLog.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'callLog ID',
      },
      regNo: {
        type: DataTypes.STRING(255),
        comment: '접수 번호',
      },
      agentId: {
        type: DataTypes.BIGINT.UNSIGNED,
        comment: '상담사ID',
      },
      csEvent: {
        type: DataTypes.STRING(255),
        comment: 'call enent',
      },
      csState: {
        type: DataTypes.STRING(255),
        comment: '상담사 상태',
      },
      callType: {
        type: DataTypes.STRING(255),
        comment: '통화구분',
      },
      cid: {
        type: DataTypes.STRING(255),
        comment: '고객번호',
      },
      uniqueId: {
        type: DataTypes.STRING(255),
        comment: 'uniqueId',
      },
      recordFile: {
        type: DataTypes.STRING(255),
        comment: '녹취파일',
      },
      extensionNumber: {
        type: DataTypes.STRING(255),
        comment: '내선번호',
      },
    },
    {
      sequelize,
      modelName: 'CsCallLog',
      timestamps: true,
      createdAt: true,
      updatedAt: false,
      paranoid: false,
    }
  );
  return CsCallLog;
};
