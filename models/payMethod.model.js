const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PayMethod extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.PayMethod.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.PayMethod.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.PayMethod.belongsTo(models.UsersNew, {
        as: 'createdByAdmin',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.PayMethod.belongsTo(models.UsersNew, {
        as: 'updatedByAdmin',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.PayMethod.belongsTo(models.UsersNew, {
        as: 'user',
        foreignKey: 'userId',
        constraints: false,
      });
      models.PayMethod.belongsTo(models.Org, {
        as: 'org',
        foreignKey: 'orgId',
        constraints: false,
      });
      models.PayMethod.belongsTo(models.UsersNew, {
        as: 'userNew',
        foreignKey: 'usersNewId',
        constraints: false,
      });
    }
  }

  PayMethod.init(
    {
      id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: 'payMethod id',
      },
      seq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '순번, ASC(기본결제수단은 순번1이 기본)',
      },
      alias: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: '카드',
        comment: '결제수단별명',
      },
      cardNo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '카드번호',
      },
      billingKey: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '카드 자동결제 승인용 billingKey',
      },
      cardBrand: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '카드 브랜드 구분 visa, 마스터 등',
      },
      cardIssuer: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '카드 발급 사,  신한, 국민 등',
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
      modelName: 'PayMethod',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );
  return PayMethod;
};