const { Model, DataTypes, sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MessageLog extends Model {
    static associate(models) {
      models.MessageLog.belongsTo(models.UsersNew, {
        as: 'csUser',
        foreignKey: 'csId',
        constraints: false,
      });

      models.MessageLog.belongsTo(models.sb_charger, {
        as: 'charger',
        foreignKey: 'chargerId',
        constraints: false,
      });
    }
  }

  MessageLog.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '메시지 ID',
      },
      csId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        comment: '상담사 userId',
      },
      messageType: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '메세지 타입 (TALK:알림톡, L:MESSAGE)',
      },
      chargerId: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: true,
        comment: '충전기 아이디',
      },
      textMessage: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '메시지 내용',
      },
      phoneNo: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '수신자 핸드폰 번호',
      },
      phoneCaller: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '발신자 핸드폰 번호',
      },
      sendDt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '발신 날짜 (알림톡은 altRcptDtm, LMS는 reqDtm',
      },
      returnType: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '발송 결과 값 - 전송 성공(S), 전송 실패(F)',
      },
      createdAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'MessageLog',
      tableName: 'messageLog',
      collate: 'utf8_general_ci',
      engine: 'InnoDB',
      indexes: [
        { name: 'csKey', fields: ['csId'] },
        { name: 'chagerKey', fields: ['chargerId'] },
      ],
      timestamps: false, // createdAt 및 updatedAt 타임스탬프를 사용하지 않는 경우 false로 설정
    }
  );
  return MessageLog;
};
