'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserOauth extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    // createdWho, updatedWho 생성
    static associate(models) {
      // define association here
      models.UserOauth.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.UserOauth.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.UserOauth.belongsTo(models.UsersNew, {
        foreignKey: 'usersNewId',
        targetKey: 'id',
        constraints: false,
      });
    }
  }

  UserOauth.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'user oauth primary key',
      },
      oAuthId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '소셜 로그인시 받아오는 고유 식별값',
      },
      provider: {
        type: DataTypes.ENUM,
        values: ['KAKAO', 'NAVER', 'GOOGLE', 'APPLE', 'BIO', ''],
        allowNull: false,
        defaultValue: '',
        comment: 'oAuth 타입',
      },
      email: {
        type: DataTypes.STRING(320),
        allowNull: true,
        comment: '이메일',
      },
      profileImage: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        comment: '프로필 이미지',
      },
      createdAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      updatedAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'UserOauth',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: false, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );
  return UserOauth;
};
