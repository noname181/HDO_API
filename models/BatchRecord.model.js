const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class BatchRecord extends Model {}

  BatchRecord.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          comment: 'id',
        },
        env_chargers_stations_exec_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        env_chargers_stations_exec_cnt: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
        },
        process_refund_exec_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        process_refund_exec_cnt: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'BatchRecord',
        tableName: 'BatchRecords', // 매핑할 테이블 이름
        comment: 'records of batch jobs..',
        collate: 'utf8_general_ci',
        engine: 'InnoDB',
        timestamps: false, // createdAt 및 updatedAt 타임스탬프를 사용하지 않는 경우 false로 설정
      }
  );

  return BatchRecord;
};