'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('FavoriteChargerStations', 'envChargerId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'EnvChargeStations',
        key: 'id',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('FavoriteChargerStations', 'envChargerId');
  },
};
