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
        await queryInterface.addIndex('Bookings', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('Bookings', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('Bookings', {
          fields: ['userId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('Bookings', {
          fields: ['vehicleId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('Bookings', {
          fields: ['chgs_id'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('Bookings', {
          fields: ['chg_id'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('Bookings', {
          fields: ['b_status'],
          using: 'BTREE',
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231226041841-add_index_for_banner_models::up::error:', error);
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
        await queryInterface.removeIndex('Bookings', ['createdWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('Bookings', ['updatedWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('Bookings', ['userId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('Bookings', ['vehicleId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('Bookings', ['chgs_id'], {
          transaction: t,
        });

        await queryInterface.removeIndex('Bookings', ['chg_id'], {
          transaction: t,
        });

        await queryInterface.removeIndex('Bookings', ['b_status'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231226041841-add_index_for_banner_models::down::error:', error);
      return;
    }
  },
};
