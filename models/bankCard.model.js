const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BankCard extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /* 충전소 운영 스케줄*/

    static associate(models) {
      // define association here

      models.BankCard.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.BankCard.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.BankCard.belongsTo(models.UsersNew, {
        as: 'user',
        foreignKey: 'userId',
        constraints: false,
      });
    }
  }

  BankCard.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        comment: 'id', 
      },
      cardNo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'card number',
      },
      billingKey: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Billing key for card automatic payment approval',
      },
      cardBrand: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Card brand differentiation, e.g., Visa, MasterCard',
      },
      cardIssuer: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Card issuer, e.g., Shinhan, Kookmin',
      },
     /* card_number: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'card number',

      },
      expiration_date: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'expire date of card', 
      },
      birthday: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'card holder birthday', 
      },
      card_name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'card holder fullname', 
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'pin code of card', 
      },*/
      is_favorited: {
        type: DataTypes.BOOLEAN,
        values: [true, false],
        allowNull: false,
        defaultValue: false,
        comment: 'use as main card', 
      },
      createdAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      updatedAt: {
        // default 조치되 있지만 row 생성시 무조건 포함되어야 함
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'BankCard',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
      // indexes: [{unique: true, fields: ['divCode']}]       // unique 설정용 부분
    }
  );
  return BankCard;
};
