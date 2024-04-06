const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class sb_unitprice_change_pending extends Model {
    static associate(models) {
      // Define associations if needed
    }
  }

  sb_unitprice_change_pending.init(
    {
      ucp_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: '단가변경예약 인덱스',
      },
      chg_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '충전기 아이디',
      },
      change_reservation_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: null,
        comment: 'if from sb_unitprice_change_reservations, that id',
      },
      usePreset: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'N',
        collate: 'utf8_general_ci',
        comment: '단가프리셋 사용여부',
      },
      upSetId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: null,
        comment: '단가프리셋 사용시 단가프리셋 아이디',
      },
      chg_unit_price: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: null,
        comment: '단가프리셋 미사용시 고정단가',
      },
      ucp_insert_dt: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '등록일(날짜검색용, 인덱스)',
      },
      isSent: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        values: [true, false],
        defaultValue: false,
        comment: '대기 이후 전송을 했는지 여부',
      },
      createdAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      updatedAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'sb_unitprice_change_pending',
      tableName: 'sb_unitprice_change_pendings',
      comment: '단가변경 대기',
      collate: 'utf8_general_ci',
      engine: 'InnoDB',
      createdAt: false,
      updatedAt: false,
      paranoid: false,  // Hard Delete
      indexes: [
        { name: 'chg_id', fields: ['chg_id'] },
        { name: 'ucp_insert_dt', fields: ['ucp_insert_dt'] },
      ],
    }
  );

  return sb_unitprice_change_pending;
};
