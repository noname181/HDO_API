const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UPTimeTable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.UPTimeTable.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.UPTimeTable.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.UPTimeTable.hasMany(models.UPTimeTableDetail, {
        as: 'upTimeTimeTableDetails',
        foreignKey: 'upTimeTableId',
        constraints: false,
      });
      models.UPTimeTable.hasMany(models.UPSetDetail, {
        as: 'upSetDetailbyUpTimeTable',
        foreignKey: 'upSetId',
        constraints: false,
      });
    }
  }

  UPTimeTable.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '고유 식별자',
      },
      desc: {
        type: DataTypes.STRING(512),
        allowNull: false,
        comment: '단가 타임 테이블 설명',
      },
      useYN: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        values: [true, false],
        defaultValue: true,
        comment: '사용 여부',
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
      modelName: 'UPTimeTable',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true,
    }
  );
  return UPTimeTable;
};
