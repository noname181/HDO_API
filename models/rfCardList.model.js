'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RFCardList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.RFCardList.belongsTo(models.UsersNew, {
        targetKey: 'id',
        foreignKey: 'usersNewId',
        constraints: false,
      });
    }
  }

  RFCardList.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '사전 할당된 RF카드 번호 리스트 ID',
      },
      rfCardNo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '번호 16개',
      },
      usedYN: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'N',
        comment: '사용여부',
      },
      usedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '사용일시',
      },
      lostYN: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'N',
        comment: '분실여부',
      },
      lostAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '분실신고 접수일시',
      },
      expiredYN: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'N',
        comment: '유효기간만료여부',
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
      modelName: 'RFCardList',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
      indexes: [{ unique: true, fields: ['rfCardNo'] }],
    }
  );
  return RFCardList;
};