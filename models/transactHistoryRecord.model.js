const cryptor = require('../util/cryptor');
('use strict');
const { Model, DataTypes } = require('sequelize');

/* EasyPay 거래내역레코드데이터 */
module.exports = (sequelize, DataTypes) => {
  class TransactHistoryRecord extends Model {}
  TransactHistoryRecord.init(
    {
      recordType: {
        type: DataTypes.STRING(255),
        comment: '레코드 구분 (T: 집계 레코드, D: 데이터 레코드)',
      },
      paymentMethod: {
        type: DataTypes.STRING(255),
        comment: '결제수단',
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
        comment: '거래구분',
      },
      transactionDate: {
        type: DataTypes.INTEGER,
        comment: '승인일 OR 취소일 (yyyymmdd)',
      },
      originalTransactionDate: {
        type: DataTypes.INTEGER,
        comment: '원거래일자',
      },
      uniqueTransactionId: {
        type: DataTypes.INTEGER,
        comment: 'KICC에서 관리하는 거래 고유 번호',
      },
      merchantTransactionId: {
        type: DataTypes.INTEGER,
        comment: '결제 시 가맹점에서 보내주는 주문에 대한 유일한 번호',
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
        comment: '거래금액',
      },
      pgFee: {
        type: DataTypes.BIGINT,
        comment: 'PG수수료',
      },
      additionalFee: {
        type: DataTypes.BIGINT,
        comment: '추가수수료',
      },
      totalFee: {
        type: DataTypes.BIGINT,
        comment: '수수료',
      },
      VAT: {
        type: DataTypes.BIGINT,
        comment: '부가세',
      },
      settlementAmount: {
        type: DataTypes.BIGINT,
        comment: '정산금액',
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
      modelName: 'TransactHistoryRecord',
      timestamps: true,
      createdAt: true,
      updatedAt: false,
      paranoid: false,
    }
  );
  return TransactHistoryRecord;
};
