const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sb_charger_state_log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /*사용자 충전기 이용 로그 테이블*/
    static associate(models) {
      // define association here
      models.sb_charger_state_log.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.sb_charger_state_log.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      /**
       * 충전기와 1:N 관계
       */
      models.sb_charger_state_log.belongsTo(models.sb_charger, {
        as: 'chargerStateLogs',
        foreignKey: 'chg_id',
        constraints: false,
      });
    }
  }

  sb_charger_state_log.init(
    {
      csl_id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '상태 인덱스 번호',
      },
      csl_station_charger_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '충전기 고유번호',
      },
      csl_channel: {
        type: DataTypes.SMALLINT(6),
        allowNull: false,
        defaultValue: 0,
        comment: '충전기 채널',
      },
      csl_charger_state: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '충전기상태',
      },
      csl_charging_state: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '충전상태',
      },
      csl_se_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '상태 에러 코드(Status ErrorCode)'
      },
      csl_sve_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '상태 벤더 에러 코드(Status VendorErrorCode)'
      },
      csl_kwh: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: '사용 전력량',
      },
      csl_kwh_cumulative: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        comment: '누적 전력량',
      },
      csl_direction: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['recv', 'send', 'manual'],
        comment: '충전상태로그 디렉션',
      },
      csl_json: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '송수신 OCPP 메시지',
      },
      cs_temperature: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: '충전기 온도',
      },
      csl_vendor: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '공급업체',
      },
      csl_model: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '충전기 모델',
      },
      csl_firmware: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '충전기 펌웨어 이름',
      },
      csl_created_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('NOW'),
        comment: '등록일',
      },
      // csl_last_datetime: {
      //     type: DataTypes.DATE,
      //     allowNull: false,
      //     defaultValue: sequelize.fn('NOW'),
      //     comment: '업데이트일자',
      // },
      csl_addinfo1: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '추가 정보 1',
      },
      csl_addinfo2: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '추가 정보 2',
      },
      csl_addinfo3: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '추가 정보 3',
      },
      csl_event_code: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      csl_rssi: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '예약',
      },
      csl_last_ins: {
        type: DataTypes.CHAR,
        allowNull: true,
        comment: '예약',
      },
      csl_mdn: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '예약',
      },
      // csl_cur_member: {
      //     type: DataTypes.STRING,
      //     allowNull: true,
      // },
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
      modelName: 'sb_charger_state_log',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true,
    }
  );
  return sb_charger_state_log;
};
