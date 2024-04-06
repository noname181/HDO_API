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
        await queryInterface.addIndex('Points', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('Points', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('Points', {
          fields: ['userId'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('Points', {
          fields: ['bookingId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('RequestRefunds', {
          fields: ['noti_id'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('RequestRefunds', {
          fields: ['userId'],
          using: 'BTREE',
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231226024812-add_index_for_points_and_request_refund_table::up::error:', error);
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
        await queryInterface.removeIndex('Points', ['createdWho'], {
          transaction: t,
        });
        await queryInterface.removeIndex('Points', ['updatedWho'], {
          transaction: t,
        });
        await queryInterface.removeIndex('Points', ['userId'], {
          transaction: t,
        });
        await queryInterface.removeIndex('Points', ['bookingId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('RequestRefunds', ['noti_id'], {
          transaction: t,
        });
        await queryInterface.removeIndex('RequestRefunds', ['userId'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231226024812-add_index_for_points_and_request_refund_table::down::error:', error);
      return;
    }
  }
};
