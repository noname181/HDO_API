const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sb_charger extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /*충전기 테이블*/
    static associate(models) {
      // define association here
      models.sb_charger.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.sb_charger.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      /**
       * 충전소 테이블과 1:N 관계
       */
      models.sb_charger.belongsTo(models.sb_charging_station, {
        as: 'chargingStation',
        foreignKey: 'chgs_id',
        constraints: false,
      });
      /**
       * 모델 테이블과 1:N 관계
       */
      models.sb_charger.belongsTo(models.ChargerModel, {
        as: 'chargerModel',
        foreignKey: 'chargerModelId',
        constraints: false,
      });
      /**
       * 충전기 상태 테이블과 N:1 관계
       */
      models.sb_charger.hasMany(models.sb_charger_state, {
        as: 'chargerStates',
        foreignKey: 'chg_id',
        constraints: false,
      });
      /**
       * 충전기 상태 로그 테이블과 N:1관계
       */
      models.sb_charger.hasMany(models.sb_charger_state_log, {
        as: 'chargerStateLogs',
        foreignKey: 'chg_id',
        constraints: false,
      });
      /**
       * 사용자 충전기 이용 로그 테이블과 N:1
       */
      models.sb_charger.hasMany(models.sb_charging_log, {
        as: 'chargerUseLog',
        foreignKey: 'chg_id',
        constraints: false,
      });
      /**
       * 고장 신고 테이블과 N:1
       */
      models.sb_charger.hasMany(models.TroubleReport, {
        as: 'troubleReport',
        foreignKey: 'chg_id',
        constraints: false,
      });
      /**
       * chargerModels와의 관계 정의
       */
      models.sb_charger.belongsTo(models.ChargerModel, {
        as: 'chargersModel',
        foreignKey: 'chargerModelId',
        constraints: false,
      });
      /**
       * FileToChargers 관계 정의
       */
      models.sb_charger.belongsTo(models.FileToCharger, {
        as: 'FileToCharger',
        foreignKey: 'termsVersion',
        targetKey: 'version',
        constraints: false,
      });
      models.sb_charger.hasMany(models.Booking, {
        as: 'booking',
        foreignKey: 'chg_id',
        constraints: false,
      });
      models.sb_charger.hasMany(models.sb_charger_ocpp_log, {
        as: 'chargerOCPPLogs',
        foreignKey: 'chg_id',
        constraints: false,
      });
      /**
       * UnitPriceSet 관계 정의
       */
      models.sb_charger.belongsTo(models.UnitPriceSet, {
        as: 'UnitPriceSet',
        foreignKey: 'upSetId',
        constraints: false,
      });

      /**
       * 사이니지 광고 테이블과 N:1 관계 - 삭제 예정
       */
      // models.sb_charger.hasMany(models.SignageAd,{
      //     as: 'chargerToAd',
      //     foreignKey: 'chg_id',
      //     constraints: false
      // });
    }
  }

  sb_charger.init(
    {
      chg_id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: 'chg_id_chg_channel',
        comment: 'Charger index number (auto-assigned)',
      },
      chgs_id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        comment: 'Charging station ID (Parent)',
      },
      chg_channel: {
        type: DataTypes.SMALLINT(5).UNSIGNED,
        allowNull: true,
        defaultValue: 1,
        unique: 'chg_id_chg_channel',
        comment: 'Charger channel',
      },
      status: {
        type: DataTypes.ENUM,
        values: ['ACTIVE', 'INACTIVE'],
        allowNull: false,
        defaultValue: 'ACTIVE',
        comment: 'Current charger status (ACTIVE or INACTIVE)',
      },
      isJam: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'N',
        comment: 'Fault status (N: No fault, Y: Fault occurred)',
      },
      // chg_model_code: {
      //     type: DataTypes.STRING(255),
      //     allowNull: true,
      //     comment: '모델코드',
      // },
      chg_charger_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        // unique: 'compositeIndex',
        comment: 'Charger number (9~10 characters, 7 characters for station + 2 for charger)',
      },
      chg_alias: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Charger ID alias (Charging equipment MAC address)',
      },
      mall_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '가맹점 아이디. 노티의 memb_id, mallId',
      },
      mall_id2: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '가맹점 아이디. 노티의 memb_id, mallId',
      },
      chg_sn: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Serial number',
      },
      chg_fw_ver: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Firmware version',
      },
      chg_cell_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Terminal phone number',
      },
      usePreset: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'N',
        comment: 'Use preset charging rates (requires upSetId when used, otherwise use chg_unit_price as fixed rate)',
      },
      upSetId: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: true,
        comment: 'Unit price preset ID',
      },
      chg_unit_price: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: true,
        comment: 'Fixed price (used when usePreset is false)',
      },
      chg_use_yn: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'Y',
        comment: 'Charger usage status (Y: Yes, N: No)',
      },
      //추가
      qrTransDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'QR code image transmission date - If NULL, the charger needs to send a QR code image',
      },
      adTransDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'AD code image transmission date - If NULL, the charger needs to send a QR code image',
      },
      tmTransDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'TM code image transmission date - If NULL, the charger needs to send a QR code image',
      },
      cdTransDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'CD code image transmission date - If NULL, the charger needs to send a QR code image',
      },
      charger_status: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      fwTransDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'FW code image transmission date - If NULL, the charger needs to send a QR code image',
      },
      adVersion: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Transmitted advertisement version',
      },
      termsVersion: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Transmitted terms and conditions version',
      },
      // rebootedDate: {
      //     type: DataTypes.DATE,
      //     allowNull: true,
      //     defaultValue: sequelize.fn('NOW'),
      //     comment: '리부팅 일시?',
      // },
      reservable: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'N',
        comment: 'Reservable functionality availability (Y: Yes, N: No)',
      },
      resetAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: true,
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
      lastConfigAppliedAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      qrcode: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'QR code of charger , content as {"chg_id":1,"chgs_id":1}',
      },
      deeplink: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '',
      },
    },
    {
      sequelize,
      modelName: 'sb_charger',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true,
      // indexes: [{ unique: true, fields: ['chg_charger_id'] }],
    }
  );
  return sb_charger;
};
