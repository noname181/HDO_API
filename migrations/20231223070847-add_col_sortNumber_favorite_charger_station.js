'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('FavoriteChargerStations', 'sortNumber', {
      type: Sequelize.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('FavoriteChargerStations', 'sortNumber');
  },
};
