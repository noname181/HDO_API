const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vehicle extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    // createdWho, updatedWho 생성
    static associate(models) {
      // define association here
      models.Vehicle.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.Vehicle.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.Vehicle.belongsTo(models.UsersNew, {
        as: 'vehicles',
        foreignKey: 'userId',
        constraints: false,
      });
      models.Vehicle.belongsTo(models.UsersNew, {
        as: 'userNew',
        foreignKey: 'usersNewId',
        constraints: false,
      });
    }
  }

  Vehicle.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        comment: '차량 id (vehicle id)',
      },
      isPrimary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        values: [true, false],
        defaultValue: false,
        comment: '대표차량 여부 (use as main vehicle)',
      },
      manufacturer: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '제조사 (manufacturer)',
      },
      type: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '차량 모델 (vehicle model)',
      },
      subType: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '차량 세부모델',
      },
      year: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '연식 (year of production)',
      },
      batteryCap: {
        type: DataTypes.DECIMAL(6, 1),
        allowNull: false,
        comment: '배터리용량 (battery capital)',
      },
      numberPlate: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '차량번호 (plate number)',
      },
      macAddr: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '차량 MAC 주소 (MAC address)',
      },
      price: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '차량가액',
      },
      usePnC: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        values: [true, false],
        defaultValue: false,
        comment: 'PnC 충전 이용 여부 (Plug and Charge) (default : false)',
      },
      askPnCDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('NOW'),
        comment: 'PnC 사용 여부 물어봐도 되는 날짜? (date ask PnC) (Default : now)',
      },
      mediaUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        comment: '차량 이미지 (안쓸 듯) (vehicle image (optional))',
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
      modelName: 'Vehicle',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );
  return Vehicle;
};
