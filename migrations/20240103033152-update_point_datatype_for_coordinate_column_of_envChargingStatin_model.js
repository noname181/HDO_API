'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('EnvChargeStations', 'temp_coordinate', {
      type: Sequelize.GEOMETRY('POINT'),
      allowNull: true,
    });

    await queryInterface.sequelize.query('UPDATE EnvChargeStations SET temp_coordinate = POINT(lng, lat)');

    await queryInterface.removeIndex('EnvChargeStations', ['coordinate']);

    await queryInterface.removeColumn('EnvChargeStations', 'coordinate');

    await queryInterface.renameColumn('EnvChargeStations', 'temp_coordinate', 'coordinate');

    return;
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return;
  },
};
