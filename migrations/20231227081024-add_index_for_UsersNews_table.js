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
        await queryInterface.addIndex('UsersNews', {
          fields: ['orgId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UsersNews', {
          fields: ['usersNewId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UsersNews', {
          fields: ['roleId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UsersNews', {
          fields: ['type'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UsersNews', {
          fields: ['status'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UsersNews', {
          fields: ['name'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UsersNews', {
          fields: ['email'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UsersNews', {
          fields: ['phoneNo'],
          using: 'BTREE',
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231227081024-add_index_for_UsersNews_table::up::error:', error);
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
        await queryInterface.removeIndex('UsersNews', ['orgId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UsersNews', ['accountId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UsersNews', ['usersNewId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UsersNews', ['roleId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UsersNews', ['type'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UsersNews', ['status'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UsersNews', ['name'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UsersNews', ['email'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UsersNews', ['phoneNo'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231227081024-add_index_for_UsersNews_table::down::error:', error);
      return;
    }
  },
};
