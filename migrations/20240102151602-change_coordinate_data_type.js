'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'sb_charging_stations',
      'coordinate',
      {
        type: Sequelize.GEOMETRY('POINT'),
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'sb_charging_stations',
      'coordinate',
      {
        type: Sequelize.STRING(255),
      },
    );
  },
};
