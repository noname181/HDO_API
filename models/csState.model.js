const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
/* 상담 내역 */
module.exports = (sequelize, DataTypes) => {
  class CsState extends Model {
    static associate(models) {
      // define association here
      models.CsState.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.CsState.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
    }
  }
  CsState.init(
    {
      csLogId: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
      },
      regNo: {
        type: DataTypes.STRING(255),
        comment: '접수번호 consultation FK 키',
      },
      seq: {
        type: DataTypes.INTEGER,
        comment: '순번',
      },
      statusCd: {
        type: DataTypes.SMALLINT(6),
        comment: '처리 상태코드',
      },
      prsContent: {
        type: DataTypes.TEXT,
        comment: '처리 내용',
      },
      completeDate: {
        type: DataTypes.DATE,
        comment: '완료 일시',
      },
    },
    {
      sequelize,
      modelName: 'CsState',
      timestamps: true,
      createdAt: true,
      updatedAt: true,
      paranoid: false,
    }
  );
  return CsState;
};
