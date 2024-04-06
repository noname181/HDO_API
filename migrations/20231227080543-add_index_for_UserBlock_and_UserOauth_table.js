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
        await queryInterface.addIndex('UserBlocks', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UserBlocks', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UserOauths', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UserOauths', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UserOauths', {
          fields: ['usersNewId'],
          using: 'BTREE',
          transaction: t,
        });

      });
    } catch (error) {
      console.log('20231227080543-add_index_for_UserBlock_and_UserOauth_table::up::error:', error);
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
        await queryInterface.removeIndex('UserBlocks', ['createdWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UserBlocks', ['updatedWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UserOauths', ['createdWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UserOauths', ['updatedWho'], {
          transaction: t,
        });
        
        await queryInterface.removeIndex('UserOauths', ['usersNewId'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231227080543-add_index_for_UserBlock_and_UserOauth_table::down::error:', error);
      return;
    }
  }
};
