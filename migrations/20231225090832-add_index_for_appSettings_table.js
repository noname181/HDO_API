'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.addIndex('AppSettings', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('AppSettings', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('AppSettings', {
          fields: ['usersNewId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('bank_total_records', {
          fields: ['data_day'],
          using: 'BTREE',
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231225090832-add_index_for_appSettings_table::up::error:', error);
      return;
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.removeIndex('AppSettings', ['createdWho'], {
          transaction: t,
        });
        await queryInterface.removeIndex('AppSettings', ['updatedWho'], {
          transaction: t,
        });
        await queryInterface.removeIndex('AppSettings', ['usersNewId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('bank_total_records', ['data_day'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231225090832-add_index_for_appSettings_table::down::error:', error);
      return;
    }
  },
};
