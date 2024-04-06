const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
/* 상담 내역 */
module.exports = (sequelize, DataTypes) => {
  class CsMessage extends Model {
    static associate(models) {
      models.CsMessage.belongsTo(models.Consultation, {
        as: 'CsMessage',
        foreignKey: 'csId',
        constraints: false,
      });
      models.CsMessage.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
    }
  }
  CsMessage.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'message ID',
      },
      phoneNo: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '(암호화된)사용자 연락처 (user phone number)',
      },
      text_message: {
        type: DataTypes.STRING(500),
        comment: '문자 메세지',
      },
      regNo: {
        type: DataTypes.STRING(255),
        comment: '접수 번호',
      },
    },
    {
      sequelize,
      modelName: 'CsMessage',
      timestamps: true,
      createdAt: true,
      updatedAt: false,
      paranoid: false,
    }
  );
  return CsMessage;
};
