'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('FavoriteChargerStations', 'chargerId', {
      type: DataTypes.STRING,
      allowNull: true, 
    });
    await queryInterface.changeColumn('FavoriteChargerStations', 'envChargerId', {
      type: DataTypes.STRING,
      allowNull: true, 
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('FavoriteChargerStations', 'chargerId', {
      type: DataTypes.INTEGER,
      allowNull: true, 
    });
    await queryInterface.changeColumn('FavoriteChargerStations', 'envChargerId', {
      type: DataTypes.INTEGER,
      allowNull: true, 
    });
  }
};
