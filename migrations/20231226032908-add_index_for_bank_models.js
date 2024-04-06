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
        await queryInterface.addIndex('BankCards', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('BankCards', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('BankCards', {
          fields: ['userId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('BankCards', {
          fields: ['cardNo'],
          using: 'BTREE',
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231226032908-add_index_for_bank_models::up::error:', error);
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
        await queryInterface.removeIndex('BankCards', ['createdWho'], {
          transaction: t,
        });
        await queryInterface.removeIndex('BankCards', ['updatedWho'], {
          transaction: t,
        });
        await queryInterface.removeIndex('BankCards', ['userId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('BankCards', ['cardNo'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231226032908-add_index_for_bank_models::down::error:', error);
      return;
    }
  },
};
