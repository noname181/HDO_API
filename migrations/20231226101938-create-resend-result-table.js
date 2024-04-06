'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('settlement_resend_results', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      data_day: {
        type: DataTypes.CHAR(12),
        allowNull: true,
        defaultValue: null,
      },
      erp_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      payment_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      result: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    });

    await queryInterface.createTable('daily_resend_results', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      data_day: {
        type: DataTypes.CHAR(12),
        allowNull: true,
        defaultValue: null,
      },
      transaction_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      result: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('settlement_resend_results');
    await queryInterface.dropTable('daily_resend_results');
  },
};
