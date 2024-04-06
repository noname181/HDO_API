const cryptor = require('../util/cryptor');
('use strict');
const { Model, DataTypes } = require('sequelize');

/* EasyPay 정산내역데이터레코드 */
module.exports = (sequelize, DataTypes) => {
  class TransactSettlementRecord extends Model {}
  TransactSettlementRecord.init(
    {
      recordType: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '레코드 구분 (T: 집계 레코드, D: 데이터 레코드)',
      },
      paymentMethod: {
        type: DataTypes.STRING(255),
        comment: '결제수단, 01: 신용카드, 02: 가상계좌, 03: 계좌이체, 04: 휴대폰, 50: 선불, 60: 간편결제(계좌간편결제)',
      },
      merchantId: {
        type: DataTypes.STRING(255),
        comment: 'KICC에서 부여한 가맹점ID',
      },
      settlementDueDate: {
        type: DataTypes.STRING(255),
        comment: '정산예정일(yyyymmdd)',
      },
      transactionType: {
        type: DataTypes.STRING(255),
        comment: '거래구분, A: 승인, C: 취소, P: 부분취소, R: 환불',
      },
      transactionDate: {
        type: DataTypes.INTEGER,
        comment: '거래일자, 승인일 OR 취소일 (yyyymmdd)',
      },
      originalTransactionDate: {
        type: DataTypes.INTEGER,
        comment: '원거래일자, yyyymmdd (승인: ‘00000000’, 취소: ‘yyyymmdd’)',
      },
      uniqueTransactionId: {
        type: DataTypes.INTEGER,
        comment: 'KICC에서 관리하는 거래 고유 번호',
      },
      merchantTransactionId: {
        type: DataTypes.INTEGER,
        comment: '가맹점거래번호, 결제 시 가맹점에서 보내주는 주문에 대한 유일한 번호',
      },
      issuer: {
        type: DataTypes.STRING(255),
        comment: '발급사',
      },
      purchaser: {
        type: DataTypes.STRING(255),
        comment: '매입사',
      },
      approvalNumber: {
        type: DataTypes.INTEGER,
        comment: '승인번호',
      },
      transactionAmount: {
        type: DataTypes.BIGINT,
        comment: '거래금액, 부호(' - ') 있음',
      },
      pgFee: {
        type: DataTypes.BIGINT,
        comment: 'PG수수료, 부호(' - ') 있음',
      },
      additionalFee: {
        type: DataTypes.BIGINT,
        comment: '추가수수료, 부호(' - ') 있음',
      },
      totalFee: {
        type: DataTypes.BIGINT,
        comment: '수수료, (PG수수료 + 추가수수료) 부호(' - ') 있음',
      },
      VAT: {
        type: DataTypes.BIGINT,
        comment: '부가세, 부호(' - ') 있음',
      },
      settlementAmount: {
        type: DataTypes.BIGINT,
        comment: '정산금액, (거래금액 - 수수료 - 부가세) 부호(' - ') 있음',
      },
      productName: {
        type: DataTypes.STRING(255),
        comment: '상품명',
      },
      cancellationTransactionNumber: {
        type: DataTypes.STRING(255),
        comment: '취소거래번호',
      },
    },
    {
      sequelize,
      modelName: 'TransactSettlementRecord',
      timestamps: true,
      createdAt: true,
      updatedAt: false,
      paranoid: false,
    }
  );
  return TransactSettlementRecord;
};
