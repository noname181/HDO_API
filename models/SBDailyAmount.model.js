const { Model, DataTypes, sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SBDailyAmount extends Model {}

  SBDailyAmount.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '인덱스',
    },
    mall_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '몰아이디',
      collate: 'utf8_general_ci',
    },
    calculate_date: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '날짜문자열(YYYY-MM-DD)',
      collate: 'utf8_general_ci',
    },
    amount: {
      type: DataTypes.BIGINT(20),
      allowNull: false,
      defaultValue: 0,
      comment: '총결제액',
    },
  }, {
    sequelize,
    modelName: 'SBDailyAmount',
    tableName: 'sb_daily_amount',
    collate: 'utf8_general_ci',
    engine: 'InnoDB',
    comment: '일별, mall_id별 총액 결산 테이블',
    indexes: [
      {
        name: 'mall_id_calculate_date',
        fields: ['mall_id', 'calculate_date'],
        unique: true,
        using: 'BTREE',
      },
    ],
    timestamps: false, // createdAt 및 updatedAt 타임스탬프를 사용하지 않는 경우 false로 설정
  });

  return SBDailyAmount;
}