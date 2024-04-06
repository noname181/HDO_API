const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UPSetDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.UPSetDetail.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.UPSetDetail.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.UPSetDetail.belongsTo(models.UPSet, {
        as: 'upSetDetails',
        foreignKey: 'upSetId',
        constraints: false,
      });
      models.UPSetDetail.belongsTo(models.UPTimeTable, {
        as: 'upSetDetailbyUpTimeTable',
        foreignKey: 'upTimeTableId',
        constraints: false,
      });
    }
  }

  UPSetDetail.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '고유 식별자',
      },
      fromDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('NOW'),
        comment: '시작일',
      },
      toDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('NOW'),
        comment: '종료일',
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
      modelName: 'UPSetDetail',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true,
    }
  );
  return UPSetDetail;
};
