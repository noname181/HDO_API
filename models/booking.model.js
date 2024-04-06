const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /* 충전소 운영 스케줄*/

    static associate(models) {
      // define association here

      models.Booking.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.Booking.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.Booking.belongsTo(models.UsersNew, {
        as: 'user',
        foreignKey: 'userId',
        constraints: false,
      });
      models.Booking.belongsTo(models.Vehicle, {
        as: 'vehicle',
        foreignKey: 'vehicleId',
        constraints: false,
      });
      models.Booking.belongsTo(models.sb_charging_station, {
        as: 'chargingStation',
        foreignKey: 'chgs_id',
        constraints: false,
      });
      models.Booking.belongsTo(models.sb_charger, {
        as: 'chargers',
        foreignKey: 'chg_id',
        sourceKey: 'chg_id',
        constraints: false,
      });
    }
  }

  Booking.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        comment: 'booking id',
      },
      b_time_in: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'start time of reservation',
      },
      b_time_out: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'end time of reservation',
      },
      b_date: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'reservation date',
      },
      b_status: {
        type: DataTypes.STRING(255),
        allowNull: false,
        values: ['reserved', 'selected', 'canceled', 'charging', 'terminated', 'completed'],
        defaultValue: 'reserved',
        comment: 'booking status',
      },
      scanType: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        allowNull: false,
        comment: 'scan type [(1) QR code / (2) NFC]',
      },
      chargeType: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        allowNull: false,
        comment: 'charge option [(1) charge with percent / (2) charge with kWh / (3) charge with money] [default = 1]',
      },
      maxParkFee: {
        type: DataTypes.DECIMAL(9, 1),
        allowNull: true,
        comment: 'maximum park fee',
      },
      unitPrice: {
        type: DataTypes.DECIMAL(9, 1),
        allowNull: true,
        comment: 'charge fee per 1 kwh',
      },
      totalPrice: {
        type: DataTypes.DECIMAL(9, 1),
        allowNull: true,
        comment: 'total charge fee',
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
      modelName: 'Booking',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
      // indexes: [{unique: true, fields: ['divCode']}]       // unique 설정용 부분
    }
  );
  return Booking;
};
