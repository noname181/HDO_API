const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  /* 환경부  API에서 가져온 데이터 원본*/
  class ChargerModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /*환경부 API에서 가져온 데이터 원본*/
    static associate(models) {
      // define association here
      models.ChargerModel.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.ChargerModel.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.ChargerModel.hasMany(models.sb_charger, {
        as: 'chargers',
        foreignKey: 'chargerModelId',
        constraints: false,
      });
      models.ChargerModel.hasMany(models.ChargerModelFW, {
        as: 'firmwares',
        foreignKey: 'modelId',
        constraints: false,
      });
    }
  }
  ChargerModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '충전기 모델 아이디 (charger model ID)',
      },
      modelCode: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '모델코드 (model code)'
      },
      manufacturerId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '제조사 ID (manufacturer ID)',
      },
      modelName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '모델이름 (model name)',
      },
      maxKw: {
        type: DataTypes.INTEGER(5),
        allowNull: false,
        comment: '충전기 정전용량(200kw, 150kw) (Charger maximum capacity (200kw, 150kw))',
      },
      speedType: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'ultra-fast:초고속/fast:고속/medium:중속/slow:완속 - reference to code table',
      },
      connectorType: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '충전 커넥터 타입 ID - 코드테이블 참조 (charger connector type)',
      },
      channelCount: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        comment: '충전기 채널수 (number of charger channels)',
      },
      lastFirmwareVer: {
        type: DataTypes.STRING,
        comment: '최신 F/W 버전 (latest F/W version)',
      },
      pncAvailable: {
        type: DataTypes.BOOLEAN,
        comment: 'PnC 가능 여부 (PnC availability, true/false)',
      },
      useYN: {
        type: DataTypes.BOOLEAN,
        comment: '사용여부 (usage status, true/false)',
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
      modelName: 'ChargerModel',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
      indexes: [{ fields: ['modelCode'] }],
    }
  );
  return ChargerModel;
};
