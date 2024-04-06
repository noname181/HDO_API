const cryptor = require('../util/cryptor');
('use strict');
const { Model, DataTypes } = require('sequelize');

/* EasyPay 거래내역집계레코드 */
module.exports = (sequelize, DataTypes) => {
  class TransactHistorySummary extends Model {}
  TransactHistorySummary.init(
    {
      recordType: {
        type: DataTypes.STRING(1),
        comment: '레코드 구분 (T : 집계 레코드, D : 데이터 레코드)',
      },
      totalRecords: {
        type: DataTypes.BIGINT,
        comment: '총 레코드 건수 (=Data 레코드 건수)',
      },
      totalPages: {
        type: DataTypes.BIGINT,
        comment: '50,000 건으로 나눈 총 페이지 수',
      },
      currentPage: {
        type: DataTypes.BIGINT,
        comment: '현재 조회 된 페이지 번호',
      },
      totalApproved: {
        type: DataTypes.BIGINT,
        comment: '승인건수 의 합',
      },
      totalApprovedAmount: {
        type: DataTypes.BIGINT,
        comment: '승인금액 의 합',
      },
      totalCancellationCount: {
        type: DataTypes.BIGINT,
        comment: '취소(부분취소포함) 건수',
      },
      totalCancellationAmount: {
        type: DataTypes.BIGINT,
        comment: '취소(부분취소포함) 금액 ' - '부호 있음',
      },
      totalPointUsageCount: {
        type: DataTypes.BIGINT,
        comment: '포인트 사용건수의 합',
      },
      totalPointUsageAmount: {
        type: DataTypes.BIGINT,
        comment: '포인트 사용금액의 합',
      },
      totalPointCancellationCount: {
        type: DataTypes.BIGINT,
        comment: '포인트 사용취소건수의 합',
      },
      totalPointCancellationAmount: {
        type: DataTypes.BIGINT,
        comment: '포인트 사용취소금액의 합',
      },
      totalPointAccumulationCount: {
        type: DataTypes.BIGINT,
        comment: '포인트 적립건수의 합',
      },
      totalPointAccumulationAmount: {
        type: DataTypes.BIGINT,
        comment: '포인트 적립금액의 합',
      },
      totalPointAccumulationCancellationCount: {
        type: DataTypes.BIGINT,
        comment: '포인트 적립취소건수의 합',
      },
      totalPointAccumulationCancellationAmount: {
        type: DataTypes.BIGINT,
        comment: '포인트 적립취소금액의 합',
      },
      totalVatApproved: {
        type: DataTypes.BIGINT,
        comment: '승인 부가세의 합',
      },
      totalVatCanceled: {
        type: DataTypes.BIGINT,
        comment: '취소 부가세의 합',
      },
      totalServiceFeeApproved: {
        type: DataTypes.BIGINT,
        comment: '승인 봉사료의 합',
      },
      totalServiceFeeCanceled: {
        type: DataTypes.BIGINT,
        comment: '취소 봉사료의 합',
      },
      reservedField1: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
        comment: '예비',
      },
      reservedField2: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
        comment: '예비',
      },
    },
    {
      sequelize,
      modelName: 'TransactHistorySummary',
      timestamps: true,
      createdAt: true,
      updatedAt: false,
      paranoid: false,
    }
  );
  return TransactHistorySummary;
};
