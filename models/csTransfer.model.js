const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
/* 상담 내역 */
module.exports = (sequelize, DataTypes) => {
  class CsTransfer extends Model {
    static associate(models) {
      models.CsTransfer.belongsTo(models.Consultation, {
        as: 'CsTransfer',
        foreignKey: 'csId',
        constraints: false,
      });
    }
  }
  CsTransfer.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '이관 ID',
      },
      transPart: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '이관 부서',
      },
      transWhom: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '이관자',
      },
      transAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '이관 일시',
      },
    },
    {
      sequelize,
      modelName: 'CsTransfer',
      timestamps: true,
      createdAt: true,
      updatedAt: true,
      paranoid: false,
    }
  );
  return CsTransfer;
};
