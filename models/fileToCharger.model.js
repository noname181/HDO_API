const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FileToCharger extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.FileToCharger.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.FileToCharger.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
    }
  }

  FileToCharger.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '고유 식별자',
      },
      division: {
        type: DataTypes.ENUM,
        values: ['AD', 'QR', 'TM'],
        allowNull: false,
        defaultValue: 'AD',
        comment: 'AD : 광고영상(zip),  QR : QR이미지, TM : 약관텍스트 파일',
      },
      version: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '날짜 형식  23.06.16.15  시까지',
      },
      fileURL: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        comment: 'S3 url',
      },
      newestVersion: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        values: [true, false],
        defaultValue: false,
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
      modelName: 'FileToCharger',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true,
    }
  );
  return FileToCharger;
};
