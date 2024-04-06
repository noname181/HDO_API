'use strict';

const FIRST_MODEL_NAME = 'EnvChargerOrgs';
const FIRST_COLUMN_NAME = ['statId'];

const SECOND_MODEL_NAME = 'EnvChargerTrans';
const SECOND_COLUMN_NAME = ['statId'];

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
