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
        await queryInterface.addIndex('UserLogs', {
          fields: ['userId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UserLogs', {
          fields: ['createdAt'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UserLogs', {
          fields: ['ipAddress'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UserLogs', {
          fields: ['status'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('Vehicles', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('Vehicles', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('Vehicles', {
          fields: ['userId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('Vehicles', {
          fields: ['usersNewId'],
          using: 'BTREE',
          transaction: t,
        });


      });
    } catch (error) {
      console.log('20231227083050-add_index_for_UserLogs_and_Vehicles_table::up::error:', error);
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
        await queryInterface.removeIndex('UserLogs', ['userId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UserLogs', ['createdAt'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UserLogs', ['ipAddress'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UserLogs', ['status'], {
          transaction: t,
        });
        
        await queryInterface.removeIndex('Vehicles', ['createdWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('Vehicles', ['updatedWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('Vehicles', ['userId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('Vehicles', ['usersNewId'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231227083050-add_index_for_UserLogs_and_Vehicles_table::down::error:', error);
      return;
    }
  }
};
