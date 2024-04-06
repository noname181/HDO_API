const cryptor = require('../util/cryptor');
('use strict');
const { Model, DataTypes } = require('sequelize');

/* EasyPay 정산내역집계레코드 */
module.exports = (sequelize, DataTypes) => {
  class TransactSettlementSummary extends Model {}
  TransactSettlementSummary.init(
    {
      recordType: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '레코드 구분 (T: 집계 레코드, D: 데이터 레코드)',
      },
      totalRecords: {
        type: DataTypes.BIGINT,
        comment: '총 레코드 건수 (=Data 레코드 건수)',
      },
      totalPages: {
        type: DataTypes.BIGINT,
        comment: '총 페이징 수, 50,000 건으로 나눈 총 페이지 수',
      },
      currentPage: {
        type: DataTypes.BIGINT,
        comment: '현재 조회된 페이지 번호',
      },
      totalSalesCount: {
        type: DataTypes.BIGINT,
        comment: '매출 건수, 승인건수의 합',
      },
      totalSalesAmount: {
        type: DataTypes.BIGINT,
        comment: '매출 금액, 승인금액의 합',
      },
      totalRefundCount: {
        type: DataTypes.BIGINT,
        comment: '취소/환불(부분취소) 건수',
      },
      totalRefundAmount: {
        type: DataTypes.BIGINT,
        comment: '취소/환불(부분취소) 금액',
      },
      totalCountSum: {
        type: DataTypes.BIGINT,
        comment: '건수 합계, 매출건수 + 취소/환불건수',
      },
      totalAmountSum: {
        type: DataTypes.BIGINT,
        comment: '금액 합계, 매출금액 + 취소/환불금액',
      },
      totalPGFees: {
        type: DataTypes.BIGINT,
        comment: 'PG수수료 합계',
      },
      totalAdditionalFees: {
        type: DataTypes.BIGINT,
        comment: '추가수수료 합계',
      },
      totalFeesSum: {
        type: DataTypes.BIGINT,
        comment: '수수료 합계 (PG수수료합계 + 추가수수료합계)',
      },
      totalVAT: {
        type: DataTypes.BIGINT,
        comment: '부가세 합계',
      },
      totalSettlementAmount: {
        type: DataTypes.BIGINT,
        comment: '정산금액 합계',
      },
    },
    {
      sequelize,
      modelName: 'TransactSettlementSummary',
      timestamps: true,
      createdAt: true,
      updatedAt: false,
      paranoid: false,
    }
  );
  return TransactSettlementSummary;
};
