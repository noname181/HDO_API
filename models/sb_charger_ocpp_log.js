const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sb_charger_ocpp_log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /*사용자 충전기 이용 로그 테이블*/
    static associate(models) {
      // define association here
      models.sb_charger_ocpp_log.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.sb_charger_ocpp_log.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      /**
       * 충전기와 1:N 관계
       */
      models.sb_charger_ocpp_log.belongsTo(models.sb_charger, {
        as: 'chargerOCPPLogs',
        foreignKey: 'chg_id',
        constraints: false,
      });
      models.sb_charger_ocpp_log.belongsTo(models.FileToCharger, {
        as: 'fileOCPPLogs',
        foreignKey: 'file_id',
        constraints: false,
      });

    }
  }

  sb_charger_ocpp_log.init(
    {
      col_id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '상태 인덱스 번호',
      },
      division: {
        type: DataTypes.ENUM,
        values: ['AD', 'QR', 'TM', 'CD', 'FW'],
        allowNull: false,
        defaultValue: 'AD',
        comment: 'AD : 광고영상(zip),  QR : QR이미지, TM : 약관텍스트 파일',
      },
      version: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '날짜 형식  23.06.16.15  시까지',
      },
      fileURL: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        comment: 'S3 url',
      },
      newestVersion: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        values: [true, false],
        defaultValue: false,
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
      modelName: 'sb_charger_ocpp_log',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true,
    }
  );
  return sb_charger_ocpp_log;
};
