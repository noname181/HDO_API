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
        await queryInterface.addIndex('sb_charger_state_logs', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });
        
        await queryInterface.addIndex('sb_charger_state_logs', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charger_state_logs', {
          fields: ['chg_id'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charger_states', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charger_states', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charger_states', {
          fields: ['chg_id'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charger_states', {
          fields: ['cs_channel'],
          using: 'BTREE',
          transaction: t,
        });

      });
    } catch (error) {
      console.log('20231226064327-add_index_for_sb_charger_state_log_and_sb_charger_state_table::up::error:', error);
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
        await queryInterface.removeIndex('sb_charger_state_logs', ['createdWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charger_state_logs', ['updatedWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charger_state_logs', ['chg_id'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charger_states', ['createdWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charger_states', ['updatedWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charger_states', ['chg_id'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charger_states', ['cs_channel'], {
          transaction: t,
        });
    
      });
    } catch (error) {
      console.log('20231226064327-add_index_for_sb_charger_state_log_and_sb_charger_state_table::down::error:', error);
      return;
    }
  }
};
