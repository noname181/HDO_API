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
        await queryInterface.addIndex('WebNotices', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('WebNotices', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('WebNotices', {
          fields: ['userId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('WebNotices', {
          fields: ['isActive'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('WebNotices', {
          fields: ['type'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('WebNotices', {
          fields: ['firstDate'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('WebNotices', {
          fields: ['lastDate'],
          using: 'BTREE',
          transaction: t,
        });

      });
    } catch (error) {
      console.log('20231227084629-add_index_for_WebNotices_table::up::error:', error);
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
        await queryInterface.removeIndex('WebNotices', ['createdWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('WebNotices', ['updatedWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('WebNotices', ['userId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('WebNotices', ['isActive'], {
          transaction: t,
        });

        await queryInterface.removeIndex('WebNotices', ['type'], {
          transaction: t,
        });

        await queryInterface.removeIndex('WebNotices', ['firstDate'], {
          transaction: t,
        });

        await queryInterface.removeIndex('WebNotices', ['lastDate'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231227084629-add_index_for_WebNotices_table::down::error:', error);
      return;
    }
  }
};
