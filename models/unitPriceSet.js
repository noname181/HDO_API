'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UnitPriceSet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.UnitPriceSet.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.UnitPriceSet.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
    }
  }

  UnitPriceSet.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      unitPriceSetName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      unitPrice1: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 0-1h',
      },
      unitPrice2: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 1-2h',
      },
      unitPrice3: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 2-3h',
      },
      unitPrice4: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 3-4h',
      },
      unitPrice5: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 4-5h',
      },
      unitPrice6: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 5-6h',
      },
      unitPrice7: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 6-7h',
      },
      unitPrice8: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 7-8h',
      },
      unitPrice9: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 8-9h',
      },
      unitPrice10: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 9-10h',
      },
      unitPrice11: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 10-11h',
      },
      unitPrice12: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 11-12h',
      },
      unitPrice13: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 12-13h',
      },
      unitPrice14: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 13-14h',
      },
      unitPrice15: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 14-15h',
      },
      unitPrice16: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 15-16h',
      },
      unitPrice17: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 16-17h',
      },
      unitPrice18: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 17-18h',
      },
      unitPrice19: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 18-19h',
      },
      unitPrice20: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 19-20h',
      },
      unitPrice21: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 20-21h',
      },
      unitPrice22: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 21-22h',
      },
      unitPrice23: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 22-23h',
      },
      unitPrice24: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'The price charge of time 23-24h',
      },
      registerDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      isUsed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      modelName: 'UnitPriceSet',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true,
    }
  );
  return UnitPriceSet;
};
