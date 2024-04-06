const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Config extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /* 충전소 운영 스케줄*/

    // createdWho, updatedWho 생성
    static associate(models) {
      // define association here
    }
  }

  Config.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '코드 아이디',
      },
      divCode: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '코드 타입 예) PARK_ALLOW_MIN',
      },
      divComment: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '코드 설명 예) 충전완료 후, 주차면 점유 허용 시간 (분)',
      },
      cfgVal: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '파라메터 값 -   예)10',
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
      modelName: 'Config',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
      indexes: [{ unique: true, fields: ['divCode'] }],
    }
  );
  return Config;
};
