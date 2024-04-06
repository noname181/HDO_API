'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Faq extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Faq.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.Faq.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
    }
  }
  Faq.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'FAQ title',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'FAQ content',
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'FAQ category',
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
      modelName: 'Faq',
      createdAt: false,
      updatedAt: false,
      paranoid: true,
    }
  );
  return Faq;
};
