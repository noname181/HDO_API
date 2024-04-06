'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sb_charge_requests', 'cl_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      comment: '충전로그 아이디',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('sb_charge_requests', 'cl_id');
  }
};