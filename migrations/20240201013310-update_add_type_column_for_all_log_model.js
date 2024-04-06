'use strict';

const { LOG_TYPE, LOG_LEVEL } = require('../controllers/webAdminControllers/logControllers/logType.enum');

const TABLE_NAME = 'all_logs';
const COLUMN_TYPE = 'type';
const COLUMN_LEVEL = 'level';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.addColumn(
          TABLE_NAME,
          COLUMN_TYPE,
          {
            type: Sequelize.ENUM,
            allowNull: false,
            values: Object.values(LOG_TYPE),
            defaultValue: LOG_TYPE.PAYMENT,
            comment: 'type of log',
          },
          { transaction: t }
        );

        await queryInterface.addColumn(
          TABLE_NAME,
          COLUMN_LEVEL,
          {
            type: Sequelize.ENUM,
            allowNull: false,
            values: Object.values(LOG_LEVEL),
            defaultValue: LOG_LEVEL.INFO,
            comment: 'level of log',
          },
          { transaction: t }
        );
      });
    } catch (error) {
      console.log('20240201013310-update_add_type_column_for_all_log_model::up::error:', error);
      return;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.removeColumn(TABLE_NAME, COLUMN_TYPE, { transaction: t });

        await queryInterface.removeColumn(TABLE_NAME, COLUMN_TYPE, { transaction: t });
      });
    } catch (error) {
      console.log('20240201013310-update_add_type_column_for_all_log_model::down::error:', error);
      return;
    }
  },
};
