'use strict';

const {DataTypes} = require("sequelize");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('temp_easy_logs', {
      id: {
        type: DataTypes.BIGINT(20),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'id',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        comment: 'content',
      },
      createdAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      comment: 'easy log..',
      collate: 'utf8_general_ci',
      engine: 'InnoDB',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('temp_easy_logs');
  }
};