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
        await queryInterface.addIndex('sb_charger_history', {
          fields: ['chgs_id'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charger_history', {
          fields: ['chg_id'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charger_history', {
          fields: ['createdAt'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('Terms', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('Terms', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('Terms', {
          fields: ['createdAt'],
          using: 'BTREE',
          transaction: t,
        });
        
      });
    } catch (error) {
      console.log('20231226093932-add_index_for_sb_charger_history_and_terms_table::up::error:', error);
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
        await queryInterface.removeIndex('sb_charger_history', ['chgs_id'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charger_history', ['chg_id'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charger_history', ['createdAt'], {
          transaction: t,
        });

        await queryInterface.removeIndex('Terms', ['createdWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('Terms', ['updatedWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('Terms', ['createdAt'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231226093932-add_index_for_sb_charger_history_and_terms_table::down::error:', error);
      return;
    }
  }
};
