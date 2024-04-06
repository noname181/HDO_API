'use strict';
const models = require('../models');
const { getGeoCodeFromAddress } = require('../services/naverServices/naverMap.service');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const stations = await models.sb_charging_station.findAll({
      include: [
        {
          model: models.Org,
          as: 'org',
        },
      ],
    });

    try {
      return await Promise.all(
        stations.map(async (i) => {
          const coordinate =
            i.org && i.org.address ? await getGeoCodeFromAddress(i.org.address) : { longitude: '', latitude: '' };
          if (coordinate.latitude && coordinate.longitude) {
            await queryInterface.sequelize.query(
              'UPDATE sb_charging_stations SET coordinate = POINT(:lng, :lat) WHERE chgs_id = :id',
              { replacements: { lng: coordinate.longitude, lat: coordinate.latitude, id: i.chgs_id } }
            );
          }
        })
      );
    } catch (error) {
      console.log('20240103042904-update_data_for_coordinate_column_of_sb_charging_station_model::up::error:', error);
      return;
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return await queryInterface.sequelize.query('UPDATE sb_charging_stations SET coordinate = NULL');
  },
};
