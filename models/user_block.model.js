'use strict';
const { Model } = require('sequelize');
const { USER_ACTION_TYPE } = require('../interfaces/userAction.interface');
module.exports = (sequelize, DataTypes) => {
  class UserBlock extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.UserBlock.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.UserBlock.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.UserBlock.belongsTo(models.Review, {
        as: 'review',
        foreignKey: 'review_id',
        constraints: false,
        allowNull: true,
      });
    }
  }
  UserBlock.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_request: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "ID of user request block or report"
      },
      blocked_user: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "ID of blocked user"
      },
      reported_user: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "ID of the reported user "
      },
      action: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: Object.values(USER_ACTION_TYPE),
        comment: 'Action status',
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
      modelName: 'UserBlock',
      createdAt: false,
      updatedAt: false,
      paranoid: true,
    }
  );
  return UserBlock;
};
