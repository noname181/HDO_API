'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sb_unitprice_change_pendings', 'isSent', {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      values: [true, false],
      defaultValue: false,
      comment: '대기 이후 전송을 했는지 여부',
      after: 'ucp_insert_dt', // 기존 컬럼 이름
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('sb_unitprice_change_pendings', 'isSent');
  }
};