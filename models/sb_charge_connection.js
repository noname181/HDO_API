const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sb_charge_connection extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /* 충전소 운영 스케줄*/

    static associate(models) {
      // define association here

      models.sb_charge_connection.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.sb_charge_connection.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.sb_charge_connection.belongsTo(models.UsersNew, {
        foreignKey: 'usersNewId',
        targetKey: 'id',
        constraints: false,
      });
      models.sb_charge_connection.belongsTo(models.sb_charging_station, {
        as: 'chargingStation',
        foreignKey: 'chgs_id',
        constraints: false,
      });
      models.sb_charge_connection.belongsTo(models.sb_charger, {
        as: 'charger',
        foreignKey: 'chg_id',
        constraints: false,
      });
      models.sb_charge_connection.belongsTo(models.Booking, {
        as: 'booking',
        foreignKey: 'bookingId',
        constraints: false,
      });
    }
  }

  Sb_charge_connection.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        comment: 'sb_charge_connection id',
      },
      chargeAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '총충전해야할량 (total charge by percent/kwh/money, devide by Bookings.chargeType (1:percent/2:kwh/3:money))',
      },
      chargedAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '총충전된량 (total kwh charged)',
      },
      estimateTime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '예상 소요시간 (estimate time when complete charge)',
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '충전 시작시각 (start time to charging)',
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '충전 종료시각 (end time to charging)',
      }, 
      chargeAmountKwh: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '총충전량 (total kwh charge)',
      },
      chargeAmountPercent: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '총충전량 % (total percentage charge = sb_charge_connection.chargeAmountKwh / Vehicles.batteryCap * 100)',
      },
      chargeStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '충전상태 (charge status)',
      },
      selectedTime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '선택시점 (insert after user click confirm button to charge)',
      },
      canceledTime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '취소시점 (update after user click cancel button before charge)',
      },
      completedTime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '완료시점 (update after complete to charge and unplug)',
      },
      remainTime: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '남은시간 (remain time when car do not move after complete to charge) (second)',
      },
      regtime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '등록시간 (insert after user click confirm button to charge)',
      },
      currentBatteryPercent: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '현재배터리량 (current battery percentage of vehicle) (%)',
      },
      timeCharged: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '충전진행된시간 (total time charged) (second)',
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
      modelName: 'sb_charge_connection',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
      // indexes: [{unique: true, fields: ['divCode']}]       // unique 설정용 부분
      indexes: [
        { name: 'createdWho', fields: ['createdWho'] },
        { name: 'updatedWho', fields: ['updatedWho'] },
        { name: 'usersNewId', fields: ['usersNewId'] },
        { name: 'chgs_id', fields: ['chgs_id'] },
        { name: 'chg_id', fields: ['chg_id'] },
        { name: 'bookingId', fields: ['bookingId'] },
      ],
    }
  );
  return Sb_charge_connection;
};
