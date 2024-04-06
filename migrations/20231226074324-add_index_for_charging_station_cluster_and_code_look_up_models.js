'use strict';

const FIRST_MODEL_NAME = 'ChargingStationClusters';
const FIRST_COLUMN_NAME = ['zoomLevel'];

const SECOND_MODEL_NAME = 'CodeLookUps';
const SECOND_COLUMN_NAME = ['descVal', 'upperDivCode', 'use'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        for await (const item of FIRST_COLUMN_NAME) {
          await queryInterface.addIndex(FIRST_MODEL_NAME, {
            fields: [item],
            using: 'BTREE',
            transaction: t,
          });
        }

        for await (const item of SECOND_COLUMN_NAME) {
          await queryInterface.addIndex(SECOND_MODEL_NAME, {
            fields: [item],
            using: 'BTREE',
            transaction: t,
          });
        }
      });
    } catch (error) {
      console.log('20231226074324-add_index_for_charging_station_cluster_and_code_look_up_models::up::error:', error);
      return;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        for await (const item of FIRST_COLUMN_NAME) {
          await queryInterface.removeIndex(FIRST_MODEL_NAME, [item], {
            transaction: t,
          });
        }

        for await (const item of SECOND_COLUMN_NAME) {
          await queryInterface.removeIndex(SECOND_MODEL_NAME, [item], {
            transaction: t,
          });
        }
      });
    } catch (error) {
      console.log('20231226074324-add_index_for_charging_station_cluster_and_code_look_up_models::down::error:', error);
      return;
    }
  },
};
