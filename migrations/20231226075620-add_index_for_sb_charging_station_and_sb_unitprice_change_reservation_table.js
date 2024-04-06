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
        await queryInterface.addIndex('sb_charging_stations', {
          fields: ['chgs_name'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charging_stations', {
          fields: ['chgs_kepco_meter_no'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charging_stations', {
          fields: ['createdAt'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charging_stations', {
          fields: ['orgId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charging_stations', {
          fields: ['chgs_operator_manager_id'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charging_stations', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charging_stations', {
            fields: ['updatedWho'],
            using: 'BTREE',
            transaction: t,
        });

        await queryInterface.addIndex('sb_unitprice_change_reservations', {
            fields: ['floatingPrice'],
            using: 'BTREE',
            transaction: t,
        });

        await queryInterface.addIndex('sb_unitprice_change_reservations', {
            fields: ['date'],
            using: 'BTREE',
            transaction: t,
        });

        await queryInterface.addIndex('sb_unitprice_change_reservations', {
            fields: ['createdWho'],
            using: 'BTREE',
            transaction: t,
        });

        await queryInterface.addIndex('sb_unitprice_change_reservations', {
            fields: ['updatedWho'],
            using: 'BTREE',
            transaction: t,
        });

        await queryInterface.addIndex('sb_unitprice_change_reservations', {
            fields: ['chargerId'],
            using: 'BTREE',
            transaction: t,
        });
        
      });
    } catch (error) {
      console.log('20231226075620-add_index_for_sb_charging_station_and_sb_unitprice_change_reservation_table::up::error:', error);
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
        await queryInterface.removeIndex('sb_charging_stations', ['chgs_name'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charging_stations', ['chgs_kepco_meter_no'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charging_stations', ['createdAt'], {
            transaction: t,
          });

        await queryInterface.removeIndex('sb_charging_stations', ['orgId'], {
            transaction: t,
        });

        await queryInterface.removeIndex('sb_charging_stations', ['chgs_operator_manager_id'], {
            transaction: t,
        });

        await queryInterface.removeIndex('sb_charging_stations', ['createdWho'], {
            transaction: t,
        });

        await queryInterface.removeIndex('sb_charging_stations', ['updatedWho'], {
            transaction: t,
        });

        await queryInterface.removeIndex('sb_unitprice_change_reservations', ['floatingPrice'], {
            transaction: t,
        });

        await queryInterface.removeIndex('sb_unitprice_change_reservations', ['date'], {
            transaction: t,
        });

        await queryInterface.removeIndex('sb_unitprice_change_reservations', ['createdWho'], {
            transaction: t,
        });

        await queryInterface.removeIndex('sb_unitprice_change_reservations', ['updatedWho'], {
            transaction: t,
        });

        await queryInterface.removeIndex('sb_unitprice_change_reservations', ['chargerId'], {
            transaction: t,
        });
      });
    } catch (error) {
      console.log('20231226075620-add_index_for_sb_charging_station_and_sb_unitprice_change_reservation_table::down::error:', error);
      return;
    }
  }
};
