const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TroubleReport extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /*고장 신고 테이블*/

    // createdWho, updatedWho 생성
    static associate(models) {
      // define association here
      models.TroubleReport.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.TroubleReport.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      /**
       * 충전기 테이블과 1:N  관계
       */
      models.TroubleReport.belongsTo(models.sb_charging_station, {
        as: 'chargingStation',
        foreignKey: 'chgs_id',
        constraints: false,
      });
      models.TroubleReport.belongsTo(models.sb_charger, {
        as: 'chargers',
        foreignKey: 'chg_id',
        sourceKey: 'chg_id',
        constraints: false,
      });
      /**
       * 조치내역 테이블과 N:1관계
       */
      models.TroubleReport.hasMany(models.TroubleShoot, {
        as: 'troubleShoots',
        foreignKey: 'troubleReportId',
        constraints: false,
      });
    }
  }

  TroubleReport.init(
    {
      id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Trouble report ID',
      },
      troubleTitle: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Trouble title',
      },
      troubleDesc: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Trouble description',
      },
      mediaUrl: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Links to trouble photos',
      },
      content: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'about how the reported problem is handled',
      },
      reportStatus: {
        type: DataTypes.ENUM,
        values: ['REPORTED', 'ACCEPTED', 'INPROGRESS', 'COMPLETED'],
        allowNull: false,
        defaultValue: 'REPORTED',
        comment: 'Reported: REPORTED, Accepted: ACCEPTED, In Progress: INPROGRESS, Completed: COMPLETED',
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
      modelName: 'TroubleReport',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );
  return TroubleReport;
};
