const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
/* 상담 내역 */
module.exports = (sequelize, DataTypes) => {
  class CsScript extends Model {
    static associate(models) {
      models.CsScript.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.CsScript.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
    }
  }
  CsScript.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '문자 및 스크립트 ID',
      },
      scriptName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '스크립트 이름',
      },
      scrptContent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '스크립트 내용',
      },
      scriptType: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '스크립트 타입 COM: 일반, MES: 문자',
      },
      scriptComment: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '스크립트 설명',
      },
      scriptCategory: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '템플릿 카테고리',
      },
    },
    {
      sequelize,
      modelName: 'CsScript',
      timestamps: true,
      createdAt: true,
      updatedAt: true,
      paranoid: true,
    }
  );
  return CsScript;
};
