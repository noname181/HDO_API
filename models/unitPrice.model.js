const cryptor = require("../util/cryptor");
'use strict';
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UnitPrice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  UnitPrice.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        comment: 'unit price id'
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Unit-Price title',
      },
      applyDt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'apply date',
      }, 
      useYN: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        comment: 'Use status',
      },
      createdAt: {
        type: "TIMESTAMP",
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
      updatedAt: {
        type: "TIMESTAMP",
        defaultValue: sequelize.literal(
          "CURRENT_TIMESTAMP"
        ),
        allowNull: false,
      },
      createdWho: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      updatedWho: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      t0: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Unit Price from 0:00 to 1:00'
      },
      t1: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Unit Price from 1:00 to 2:00'
      },
      t2: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Unit Price from 2:00 to 3:00'
      },
      t3: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      t4: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      t5: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      t6: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      t7: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      t8: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      t9: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      t10: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      t11: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      t12: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      t13: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      t14: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      t15: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      t16: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      t17: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      t18: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      t19: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      t20: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      t21: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Unit Price from 21:00 to 22:00'
      },
      t22: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Unit Price from 22:00 to 23:00'
      },
      t23: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Unit Price from 23:00 to 00:00'
      }
    },
    {
      sequelize,
      modelName: 'UnitPrice',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );
  return UnitPrice;
};