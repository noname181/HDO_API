'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Point extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Point.belongsTo(models.Booking, {
        as: 'booking',
        foreignKey: 'bookingId',
        constraints: false,
      });
      models.Point.belongsTo(models.UsersNew, {
        as: 'user',
        foreignKey: 'userId',
        constraints: false,
      });
      models.Point.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.Point.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
    }
  }
  Point.init(
    {
      pointType: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['earn', 'spend'],
        defaultValue: 'earn',
        comment: 'Type of point transaction (earn or spend)', 
      },
      pointDate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Date and time of the point transaction', 
      },
      point: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Amount of points earned or spent', 
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
      modelName: 'Point',
      createdAt: false,
      updatedAt: false,
      paranoid: true,
      indexes: [
        { name: 'createdWho', fields: ['createdWho'] },
        { name: 'updatedWho', fields: ['updatedWho'] },
        { name: 'userId', fields: ['userId'] },
        { name: 'bookingId', fields: ['bookingId'] },
      ],
    }
  );
  return Point;
};
