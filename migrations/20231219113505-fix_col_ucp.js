'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('sb_unitprice_change_pendings', 'ucp_insert_dt', {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '등록일(날짜검색용, 인덱스)',
    });
    await queryInterface.addColumn('sb_unitprice_change_pendings', 'change_reservation_id', {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      comment: 'if from sb_unitprice_change_reservations, that id',
    });
  },

  async down(queryInterface, Sequelize) {
  }
};