'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.changeColumn(
          'sb_charging_stations',
          'coordinate',
          {
            type: Sequelize.STRING(255),
          },
          { transaction: t }
        );

        await queryInterface.addIndex('sb_charging_stations', {
          fields: ['coordinate'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.changeColumn(
          'EnvChargeStations',
          'coordinate',
          {
            type: Sequelize.STRING(255),
          },
          { transaction: t }
        );

        await queryInterface.addIndex('EnvChargeStations', {
          fields: ['coordinate'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('EnvChargeStations', {
          fields: ['lat', 'lng'],
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
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.removeIndex('sb_charging_stations', ['coordinate'], {
          transaction: t,
        });

        await queryInterface.changeColumn(
          'sb_charging_stations',
          'coordinate',
          {
            type: Sequelize.GEOMETRY('POINT'),
          },
          {
            transaction: t,
          }
        );

        await queryInterface.removeIndex('EnvChargeStations', ['coordinate'], {
          transaction: t,
        });

        await queryInterface.changeColumn(
          'EnvChargeStations',
          'coordinate',
          {
            type: Sequelize.GEOMETRY('POINT'),
          },
          {
            transaction: t,
          }
        );

        await queryInterface.removeIndex('EnvChargeStations', ['lat', 'lng'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231227084629-add_index_for_WebNotices_table::down::error:', error);
      return;
    }
  },
};
