'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sb_unitprice_change_reservations', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      priceOption: {
        type: Sequelize.CHAR(1),
        allowNull: false,
        defaultValue: 'N',
      },
      fixedPrice: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      floatingPrice: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdWho: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      updatedWho: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
    }, {
      collate: 'utf8_general_ci',
      engine: 'InnoDB',
      createdAt: false,
      updatedAt: false,
      paranoid: false, // Hard Delete
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('sb_unitprice_change_reservations');
  }
};
