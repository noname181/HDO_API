const { Model, DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SbChargerHistory extends Model {
    static associate(models) {
      // 관계 설정 코드 추가
      models.SbChargerHistory.belongsTo(models.sb_charging_station, {
        as: 'chargingStation',
        foreignKey: 'chgs_id',
        constraints: false,
      });
      models.SbChargerHistory.belongsTo(models.sb_charger, {
        as: 'chargers',
        foreignKey: 'chg_id',
        constraints: false,
      });
    }
  }

  SbChargerHistory.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '충전기 이력 ID',
      },
      ch_insert_dt: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '등록일(날짜검색용, 인덱스)',
        default: sequelize.literal("DATE_FORMAT(NOW(), '%Y%m%d')"),
      },
      chg_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        comment: '충전기 아이디',
      },
      chgs_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        comment: '충전소 아이디',
      },
      chgs_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '충전소명',
      },
      ch_code: {
        type: DataTypes.ENUM(
          'START',
          'END',
          'ONLINE',
          'OFFLINE',
          'EMER_STOP',
          'EMER_BACK',
          'START_REPAIR',
          'END_REPAIR',
          'ERROR',
          'START_BOOKING',
          'END_BOOKING'
        ),
        allowNull: true,
        comment: '충전 상태 코드',
      },
      ch_code_nm: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '충전 상태 코드 설명',
      },
      ch_remark: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '비고',
      },
      createdAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'SbChargerHistory',
      tableName: 'sb_charger_history',
      collate: 'utf8_general_ci',
      engine: 'InnoDB',
      timestamps: false,
      indexes: [{ name: 'ch_insert_dt', fields: ['ch_insert_dt'] }],
    }
  );

  return SbChargerHistory;
};
