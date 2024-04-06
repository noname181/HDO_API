'use strict';

const FIRST_MODEL_NAME = 'data_results_tb';
const FIRST_COLUMN_NAME = ['data_day'];

const SECOND_MODEL_NAME = 'EnvChargers';
const SECOND_COLUMN_NAME = ['busiId', 'stat'];

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
      console.log('20231226075258-add_index_for_config_and_coupon_models::up::error:', error);
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
      console.log('20231226075258-add_index_for_config_and_coupon_models::down::error:', error);
      return;
    }
  },
};
