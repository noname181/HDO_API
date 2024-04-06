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
        await queryInterface.addIndex('sb_charge_requests', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });
        
        await queryInterface.addIndex('sb_charge_requests', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charge_requests', {
          fields: ['userId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charge_requests', {
          fields: ['chg_id'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charge_requests', {
          fields: ['cl_id'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charger_ocpp_logs', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charger_ocpp_logs', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charger_ocpp_logs', {
          fields: ['chg_id'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charger_ocpp_logs', {
          fields: ['file_id'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charger_ocpp_logs', {
          fields: ['division'],
          using: 'BTREE',
          transaction: t,
        });


      });
    } catch (error) {
      console.log('20231226061215-add_index_for_sb_charge_request_and_sb_charger_ocpp_log_table::up::error:', error);
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
        await queryInterface.removeIndex('sb_charge_requests', ['createdWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charge_requests', ['updatedWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charge_requests', ['userId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charge_requests', ['chg_id'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charge_requests', ['cl_id'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charger_ocpp_logs', ['createdWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charger_ocpp_logs', ['updatedWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charger_ocpp_logs', ['chg_id'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charger_ocpp_logs', ['file_id'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charger_ocpp_logs', ['division'], {
          transaction: t,
        });
    
      });
    } catch (error) {
      console.log('20231226061215-add_index_for_sb_charge_request_and_sb_charger_ocpp_log_table::down::error:', error);
      return;
    }
  }
};
