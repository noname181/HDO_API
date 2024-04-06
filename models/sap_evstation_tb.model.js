const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class sap_evstation_tb extends Model {
    static associate(models) { }
  } 
  sap_evstation_tb.init(
    { 
        KUNNR: {
            type: DataTypes.STRING(255),
            allowNull: false,
            primaryKey: true,
            comment: '고객 번호',
          },
          NAME1: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: '이름 1',
          },
          VKORG: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: '영업조직',
          },
          VTWEG: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: '유통경로',
          },
          SPART: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '제품군',
          },
          VKBUR: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '사업장',
          },
          VKGRP: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '영업 그룹',
          },
          SORTL: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '정렬 필드',
          },
          STRAS: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '주소',
          },
          PSTLZ: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '우편번호',
          },
          ORT01: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '도시',
          },
          REGIO: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '지역(시/도, 도, 군)',
          },
          TELF1: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '첫번째 전화번호',
          },
          TELFX: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '팩스번호',
          },
          STCD1: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '법인(주민)번호',
          },
          STCD2: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '사업자번호',
          },
          STCDT: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '계산서발행기준',
          },
          J_1KFTBUS: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '사업유형',
          },
          J_1KFTIND: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '업종',
          },
          J_1KFREPRE: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '대표자명',
          },
          KVGR1: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '고객그룹 1',
          },
          KVGR2: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '고객그룹 2',
          },
          KVGR3: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '고객그룹 3',
          },
          VWERK: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '납품 플랜트(자체 또는 외부)',
          },
          PERNR: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '사원 번호',
          },
          account_number: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '계좌번호',
          },
          cost_center: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '코스트센터',
          },
          pr_center: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '손익센터',
          },
    },
    {
      sequelize,
      modelName: 'sap_evstation_tb',
      tableName: 'sap_evstation_tb',
      timestamps: false,
      paranoid: false,
    }
  );

  return sap_evstation_tb;
};
