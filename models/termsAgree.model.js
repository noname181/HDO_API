('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TermsAgree extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /*환경부 API에서 가져온 데이터 원본*/
    static associate(models) {
      // define association here
      models.TermsAgree.belongsTo(models.UsersNew, {
        as: 'user',
        foreignKey: 'userId',
        constraints: false,
      });
      models.TermsAgree.belongsTo(models.Terms, {
        as: 'terms',
        foreignKey: 'termId',
        constraints: false,
      });
    }
  }

  TermsAgree.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'TermsAgree ID',
      },
      termId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Terms ID',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'User ID',
      },
      targetId: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Target ID',
      },
      target: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Target',
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
      modelName: 'TermsAgree',
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );
  return TermsAgree;
};
