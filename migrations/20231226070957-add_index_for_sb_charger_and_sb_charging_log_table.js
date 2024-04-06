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
        await queryInterface.addIndex('sb_chargers', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });
        
        await queryInterface.addIndex('sb_chargers', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_chargers', {
          fields: ['chgs_id'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_chargers', {
          fields: ['chargerModelId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_chargers', {
          fields: ['termsVersion'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_chargers', {
          fields: ['upSetId'],
          using: 'BTREE',
          transaction: t,
        });
        
        await queryInterface.addIndex('sb_charging_logs', {
          fields: ['chg_id'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charging_logs', {
          fields: ['chgs_id'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charging_logs', {
          fields: ['usersNewId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charging_logs', {
          fields: ['createdAt'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charging_logs', {
          fields: ['reason'],
          using: 'BTREE',
          transaction: t,
        });


      });
    } catch (error) {
      console.log('20231226070957-add_index_for_sb_charger_and_sb_charging_log_table::up::error:', error);
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
        await queryInterface.removeIndex('sb_chargers', ['createdWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_chargers', ['updatedWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_chargers', ['chgs_id'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_chargers', ['chargerModelId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_chargers', ['termsVersion'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_chargers', ['upSetId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charging_logs', ['chg_id'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charging_logs', ['chgs_id'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charging_logs', ['usersNewId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charging_logs', ['createdAt'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charging_logs', ['reason'], {
          transaction: t,
        });
    
      });
    } catch (error) {
      console.log('20231226070957-add_index_for_sb_charger_and_sb_charging_log_table::down::error:', error);
      return;
    }
  }
};
