'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Review.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.Review.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.Review.belongsTo(models.sb_charging_station, {
        as: 'chargingStation',
        foreignKey: 'chgs_id',
        constraints: false,
      });
    }
  }
  Review.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Review ID',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Review content',
      },
      chgs_id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        comment: 'Charging station ID',
      },
      stars: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
        comment: 'Rating stars given in the review (1 to 5)',
      },
      images: {
        type: DataTypes.JSON,
        comment: 'Images associated with the review',
      },
      number_of_reports: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
      modelName: 'Review',
      createdAt: false,
      updatedAt: false,
      paranoid: true,
    }
  );
  return Review;
};
