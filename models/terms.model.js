('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Terms extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /*환경부 API에서 가져온 데이터 원본*/
    static associate(models) {
      // define association here
      models.Terms.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.Terms.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
    }
  }
  Terms.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Terms ID',
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Title of the term', 
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Content of the term', 
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Category of the term', 
      },
      useYN: {
        type: DataTypes.BOOLEAN,
        comment: 'Usage status (true/false)',  
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Id of parent term',  
      },
      version: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'version of the term',   
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
      modelName: 'Terms',
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );
  return Terms;
};
