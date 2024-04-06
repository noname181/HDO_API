'use strict';
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('CodeLookUps', 'upperDivCode', {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Upper divCode',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('CodeLookUps', 'upperDivCode');
  },
};
