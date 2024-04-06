'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sb_unitprice_change_reservations', 'excutedYN', {
      type: Sequelize.DataTypes.ENUM,
      allowNull: false,
      values: [
        'Y',
        'N',
      ],
      defaultValue: 'N',
    },);
  },

  async down(queryInterface, Sequelize) {
     
  },
};
