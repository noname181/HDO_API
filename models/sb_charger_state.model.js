const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sb_charger_state extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /*충전기 상태 테이블*/
    static associate(models) {
      // define association here
      models.sb_charger_state.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.sb_charger_state.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      /**
       * 충전기 테이블과 1:N 관계
       */
      models.sb_charger_state.belongsTo(models.sb_charger, {
        as: 'chargerStates',
        foreignKey: 'chg_id',
        constraints: false,
      });
    }
  }

  sb_charger_state.init(
    {
      cs_id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '상태 인덱스 번호',
      },
      cs_station_charger_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '충전기 고유번호',
      },
      cs_channel: {
        type: DataTypes.SMALLINT(6),
        allowNull: false,
        defaultValue: 1,
        comment: '충전기 채널(=connId, 1 or 2)',
      },
      cs_charger_state: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '충전기상태',
      },
      cs_charging_state: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "충전의 상태 ( ready, available, preparing, offline - 이걸로 커넥터연결 판단 , charging, finishing-이걸로 미출차판단 )"
      },
      cs_se_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '상태 에러 코드(Status ErrorCode)'
      },
      cs_sve_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '상태 벤더 에러 코드(Status VendorErrorCode)'
      },
      cs_kwh: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: '사용 전력량',
      },
      cs_kwh_cumulative: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        comment: '누적 전력량',
      },
      cs_temperature: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: '충전기 온도',
      },
      cs_vendor: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '공급업체',
      },
      cs_model: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '충전기 모델',
      },
      cs_firmware: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '충전기 펌웨어 이름',
      },
      cs_created_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('NOW'),
        comment: '등록일',
      },
      cs_last_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('NOW'),
        comment: '업데이트일자',
      },
      cs_addinfo1: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '추가 정보 1',
      },
      cs_addinfo2: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '추가 정보 2',
      },
      cs_addinfo3: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '추가 정보 3',
      },
      cs_event_code: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      cs_rssi: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '예약',
      },
      cs_last_ins: {
        type: DataTypes.CHAR,
        allowNull: true,
        comment: '예약',
      },
      cs_mdn: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '예약',
      },
      cs_cur_member: {
        type: DataTypes.STRING,
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
    },
    {
      sequelize,
      modelName: 'sb_charger_state',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true,
    }
  );
  return sb_charger_state;
};
