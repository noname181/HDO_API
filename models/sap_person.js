const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SAP_Person extends Model {
    static associate(models) {}
  }

  SAP_Person.init(
    {
      PERNR: {
        type: DataTypes.STRING,
        primaryKey: true,
        comment: '사원 번호',
      },
      ENAME: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '사원 또는 지원자의 포맷된 이름',
      },
      PASSWORD: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '암호',
      },
      EMAIL: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '간단한 인터넷 메일(SMTP) 주소',
      },
      ORG: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ORG1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      JKW: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '직위코드',
      },
      JKW1: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '직위명 ',
      },
      JKG: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '직급코드',
      },
      JKG1: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '직급명 ',
      },
      PHONE: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '전화번호',
      },
      PHONE2: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '전화번호',
      },
      DPT: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      DPT1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'SAP_Person',
      tableName: 'SAP_People',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
      indexes: [
        { name: 'ENAME', fields: ['ENAME'] },
      ],
    }
  );

  return SAP_Person;
};
