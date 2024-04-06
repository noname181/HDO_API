'use strict';
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('TroubleReports', 'content', {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'about how the reported problem is handled',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('TroubleReports', 'content');
  },
};
