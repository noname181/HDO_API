'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Inquiry extends Model {
    static associate(models) {
      models.Inquiry.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.Inquiry.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
    }
  }
  Inquiry.init(
    {
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Content of the inquiry',
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Title of the inquiry',
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        values: [true, false],
        defaultValue: false,
        comment: 'Status of the inquiry (true or false)',
      },
      categoryName: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'category name of inquiry',
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'comment or inquiry',
      },
      createdAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      updatedAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Inquiry',
      createdAt: false,
      updatedAt: false,
      paranoid: true,
    }
  );
  return Inquiry;
};
