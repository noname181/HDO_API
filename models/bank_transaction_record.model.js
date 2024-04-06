const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class bank_transaction_record extends Model {
    static associate(models) { 
      models.bank_transaction_record.belongsTo(models.sb_charging_station, {
        as: 'chargingStation',
        foreignKey: 'station_id',
        targetKey: 'chgs_id',
        constraints: false,
      });
    }
  }

  bank_transaction_record.init(
    { 
      ZIFKEY: {
        type: DataTypes.CHAR(20),
        allowNull: false,
        defaultValue: 0,
        comment: 'SAP 생성 고유키',
      },
      BUKRS: {
        type: DataTypes.CHAR(4),
        allowNull: false,
        defaultValue: 0,
        comment: '회사코드',
      },
      SDODT: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '명세통지 전송일',
      },
      BNKCD: {
        type: DataTypes.CHAR(3),
        allowNull: false,
        defaultValue: 0,
        comment: '은행코드',
      },
      SNDID: {
        type: DataTypes.CHAR(10),
        allowNull: false,
        defaultValue: '',
        comment: '송신자 ID',
      },
      RCVID: {
        type: DataTypes.CHAR(10),
        allowNull: false,
        defaultValue: '',
        comment: '수신자 ID',
      },
      FBBTY: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 0,
        comment: '펌뱅킹 구분',
      },
      LCONO: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '명세통지번호',
      },
      SNDDT: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '전송일자',
      },
      BAKNO: {
        type: DataTypes.CHAR(15),
        defaultValue: 0,
        comment: '계좌번호',
      },
      TRAGB: {
        type: DataTypes.CHAR(2),
        defaultValue: 0,
        comment: '거래구분',
      },
      TBKCD: {
        type: DataTypes.CHAR(3),
        defaultValue: 0,
        comment: '거래은행',
      },
      TRAMT: {
        type: DataTypes.DECIMAL(17, 0),
        defaultValue: 0,
        comment: '이체금액',
      },
      BALSG: {
        type: DataTypes.CHAR(1),
        defaultValue: 0,
        comment: '잔액부호',
      },
      BAAMT: {
        type: DataTypes.DECIMAL(17, 0),
        defaultValue: 0,
        comment: '계좌잔액',
      },
      RAMPT: {
        type: DataTypes.CHAR(7),
        defaultValue: 0,
        comment: '입금거래점',
      },
      TRANM: {
        type: DataTypes.CHAR(16),
        defaultValue: 0,
        comment: '거래자성명',
      },
      BILNO: {
        type: DataTypes.CHAR(10),
        defaultValue: 0,
        comment: '어음,수표 번호',
      },
      OPTI1: {
        type: DataTypes.CHAR(13),
        defaultValue: 0,
        comment: '선택영역',
      },
      OPTI2: {
        type: DataTypes.CHAR(13),
        defaultValue: 0,
        comment: '선택영역',
      },
      OPTI3: {
        type: DataTypes.CHAR(13),
        defaultValue: 0,
        comment: '선택영역',
      },
      CMSCD: {
        type: DataTypes.CHAR(16),
        defaultValue: 0,
        comment: 'CMS코드',
      },
      JUMIN: {
        type: DataTypes.CHAR(13),
        defaultValue: 0,
        comment: '주민등록번호',
      },
      VBKNO: {
        type: DataTypes.CHAR(16),
        defaultValue: 0,
        comment: '가상계좌번호',
      },
      KUNNR: {
        type: DataTypes.CHAR(10),
        defaultValue: 0,
        comment: '고객',
      },
      TRATM: {
        type: DataTypes.TIME,
        defaultValue: null,
        comment: '거래시간',
      },
      TRADT: {
        type: DataTypes.STRING(255),
        defaultValue: null,
        comment: '거래일자',
      },
      HBKID: {
        type: DataTypes.CHAR(5),
        defaultValue: 0,
        comment: '거래은행',
      },
      HKTID: {
        type: DataTypes.CHAR(5),
        defaultValue: 0,
        comment: '계정 ID',
      },
      HKONT: {
        type: DataTypes.CHAR(10),
        defaultValue: 0,
        comment: 'G/L',
      },
      SAKNR: {
        type: DataTypes.CHAR(10),
        defaultValue: 0,
        comment: 'G/L 계정',
      },
      IOGUB: {
        type: DataTypes.CHAR(1),
        defaultValue: 0,
        comment: '입출금 구분자',
      },
      POSGB: {
        type: DataTypes.CHAR(1),
        defaultValue: 0,
        comment: '전표처리대상여부',
      },
      POSST: {
        type: DataTypes.CHAR(1),
        defaultValue: 0,
        comment: '전표처리상태',
      },
      GJAHR: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '회계연도',
      },
      BELNR: {
        type: DataTypes.CHAR(10),
        defaultValue: 0,
        comment: '전표 번호',
      },
      REVBN: {
        type: DataTypes.CHAR(10),
        defaultValue: 0,
        comment: '역분개전표번호',
      },
      ERRTX: {
        type: DataTypes.CHAR(73),
        defaultValue: 0,
        comment: '메시지 텍스트',
      },
      VERR1: {
        type: DataTypes.CHAR(1),
        defaultValue: 0,
        comment: '가상계좌오류(고객)',
      },
      VERR2: {
        type: DataTypes.CHAR(1),
        defaultValue: 0,
        comment: '가상계좌오류(유통경로복수)',
      },
      BENR2: {
        type: DataTypes.CHAR(10),
        defaultValue: 0,
        comment: '전표 번호',
      },
      RVBN2: {
        type: DataTypes.CHAR(10),
        defaultValue: 0,
        comment: '역분개전표번호',
      },
      VBLNR: {
        type: DataTypes.CHAR(10),
        defaultValue: 0,
        comment: '지급전표번호',
      },
      LIFNR: {
        type: DataTypes.CHAR(10),
        defaultValue: 0,
        comment: '공급업체',
      },
      RZAWE: {
        type: DataTypes.CHAR(1),
        defaultValue: 0,
        comment: '지급 방법',
      },
      BINO2: {
        type: DataTypes.CHAR(10),
        defaultValue: 0,
        comment: '어음,수표 번호',
      },
      BKONT: {
        type: DataTypes.CHAR(2),
        defaultValue: 0,
        comment: '제어 키',
      },
      EIGR1: {
        type: DataTypes.CHAR(10),
        defaultValue: 0,
        comment: '계정결정: 계정결정키값',
      },
      IKBNO: {
        type: DataTypes.CHAR(10),
        defaultValue: 0,
        comment: '보관어음 변경이력 No',
      },
      IKBSQ: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '변경이력 순번',
      },
      CTRDT: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null,
        comment: '취소원거래일자',
      },
      ODONO: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '원전문번호',
      },
      SEQNO: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '은행전문 Seqno',
      },
      BNKGB: {
        type: DataTypes.CHAR(2),
        defaultValue: 0,
        comment: '기관코드구분',
      },
      area_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null, 
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null, 
      },
      station_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null, 
      },
      station_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null, 
      },
    },
    {
      sequelize,
      modelName: 'bank_transaction_record',
      timestamps: false,
      paranoid: false,
    }
  );

  return bank_transaction_record;
};
