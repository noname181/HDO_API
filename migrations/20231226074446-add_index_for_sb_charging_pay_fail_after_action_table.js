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
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.addIndex('sb_charging_pay_fail_after_actions', {
          fields: ['costUserId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charging_pay_fail_after_actions', {
          fields: ['paidUserId'],
          using: 'BTREE',
          transaction: t,
        });

      });
    } catch (error) {
      console.log('20231226074446-add_index_for_sb_charging_pay_fail_after_action_table::up::error:', error);
      return;
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.removeIndex('sb_charging_pay_fail_after_actions', ['costUserId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charging_pay_fail_after_actions', ['paidUserId'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231226074446-add_index_for_sb_charging_pay_fail_after_action_table::down::error:', error);
      return;
    }
  }
};
