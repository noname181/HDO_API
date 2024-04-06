const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CarWash extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /* 충전소 운영 스케줄*/

    static associate(models) {
      // define association here

      models.CarWash.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.CarWash.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.CarWash.belongsTo(models.UsersNew, {
        as: 'user',
        foreignKey: 'userId',
        constraints: false,
      });
    }
  }

  CarWash.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        comment: 'carwash id',
      },
      car_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'car number'
      },
      coupon_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'count of coupon'
      },
      price: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'price of the carwash service',
      },
      purchase_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'date of purchase of the carwash service'
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'address of the carwash service', 
      },
      date_use: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'date of use of the carwash service',
      },
      member_name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'member name',
      },
      is_used_service: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        commit: 'service is used or not'
      },
      assignment: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'assignment details',
      },
      use_where: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'location or place where the carwash service is used',
      },
      createdAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      updatedAt: {
        // default 조치되 있지만 row 생성시 무조건 포함되어야 함
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'CarWash',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
      // indexes: [{unique: true, fields: ['divCode']}]       // unique 설정용 부분
    }
  );
  return CarWash;
};
