'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('sb_chargers', 'lastConfigAppliedAt', {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
      after: 'updatedAt'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('sb_chargers', 'lastConfigAppliedAt');
  }
};
