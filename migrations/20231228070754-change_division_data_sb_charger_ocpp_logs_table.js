'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn('sb_charger_ocpp_logs', 'division', {
      type: Sequelize.DataTypes.ENUM,
      values: ['AD', 'QR', 'TM', 'CD','FW'],
      allowNull: false,
      defaultValue: 'AD',
      comment: 'AD : 광고영상(zip),  QR : QR이미지, TM : 약관텍스트 파일',
    },);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn('sb_charger_ocpp_logs', 'division', {
      type: Sequelize.DataTypes.ENUM,
      values: ['AD', 'QR', 'TM', 'CD'],
      allowNull: false,
      defaultValue: 'AD',
      comment: 'AD : 광고영상(zip),  QR : QR이미지, TM : 약관텍스트 파일',
    },);
  }
};
