'use strict';

const {DataTypes} = require("sequelize");
module.exports = {
  async up(queryInterface, sequelize) {
    await queryInterface.createTable('sb_unitprice_change_pendings', {
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
        allowNull: false,
        comment: '등록일(날짜검색용, 인덱스)',
        default: sequelize.literal("DATE_FORMAT(NOW(), '%Y%m%d')"),
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
    }, {
      comment: '단가변경 대기',
      collate: 'utf8_general_ci',
      engine: 'InnoDB',
    });

    await queryInterface.addIndex('sb_unitprice_change_pendings', {
      fields: ['chg_id'],
      using: 'BTREE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sb_unitprice_change_pendings');
  }
};