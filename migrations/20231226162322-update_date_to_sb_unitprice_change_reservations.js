'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('sb_unitprice_change_reservations', 'date', {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('sb_unitprice_change_reservations', 'date', {
      type: 'TIMESTAMP',
      allowNull: false,
    });
  },
};
