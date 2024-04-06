const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TroubleShoot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /*고장 신고 테이블*/

    // createdWho, updatedWho 생성
    static associate(models) {
      // define association here
      models.TroubleShoot.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.TroubleShoot.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.TroubleShoot.belongsTo(models.TroubleReport, {
        as: 'troubleShoots',
        foreignKey: 'troubleReportId',
        constraints: false,
      });
    }
  }

  TroubleShoot.init(
    {
      id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: '조치 내역 아이디 (자동 채번)',
      },
      troubleType: {
        type: DataTypes.ENUM,
        values: ['SOFTWARE', 'HARDWARE', 'CABLE', 'OTHER'],
        defaultValue: 'OTHER',
        allowNull: false,
        comment: '고장 범주- 소프트웨어:SOFTWARE, 하드웨어:HARDWARE, 케이블:CABLE, 기타:OTHER',
      },
      actionTitle: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '조치 내용 제목',
      },
      actionDetails: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '조치 내용',
      },
      repairCost: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '수리 비용',
      },
      mediaUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        comment: '해결된 사진 URL (URL 배열 또는 단일 URL)',
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
      modelName: 'TroubleShoot',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );
  return TroubleShoot;
};