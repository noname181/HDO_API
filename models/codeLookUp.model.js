const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CodeLookUp extends Model {
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

  CodeLookUp.init(
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
        primaryKey: true,
        comment: '코드 타입 (code type)',
      },
      divComment: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '코드 설명 (code description)',
      },
      sequence: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '순서 시퀀스 (order sequence)',
      },
      descVal: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        comment: 'code value (sequential increase within the same divCode category, does not change)',
      },
      descInfo: {
        type: DataTypes.STRING(),
        allowNull: true,
        comment: 'web에 표시되는 내용 (code content)',
      },
      isSubCode: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'is sub code or not ? (true/false)',
      },
      use: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        values: [true, false],
        defaultValue: true,
        comment: '사용여부 (use or not , true/false)',
      },
      upperDivCode: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'upperDivCode',
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
      // upperDivCode: {
      //   type: DataTypes.STRING(255),
      //   allowNull: false,
      //   primaryKey: true,
      //   comment: '상위 코드 타입 (code type)',
      // },
    },
    {
      sequelize,
      modelName: 'CodeLookUp',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );
  return CodeLookUp;
};
