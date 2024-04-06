'use strict';
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('WebNotices', 'type', {
      type: DataTypes.CHAR(9),
      values: ['MOBILE', 'WEB'],
      defaultValue: 'WEB',
      allowNull: false,
      comment: 'Notice popup for web or mobile notifications',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('WebNotices', 'type');
  },
};
