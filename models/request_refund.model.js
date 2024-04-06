const { Model, DataTypes} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RequestRefund extends Model {

    static associate(models) {
      // define association here
      models.RequestRefund.belongsTo(models.PaymentNotification, {
        as: 'paymentNotification',
        foreignKey: 'noti_id',
        targetKey: 'id',
        constraints: false,
        allowNull: true,
      });
      models.RequestRefund.belongsTo(models.UsersNew, {
        as: 'whoRefund',
        foreignKey: 'userId',
        targetKey: 'id',
        constraints: false,
        allowNull: true,
      });
    }

  }

  RequestRefund.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      comment: '환불해준 유저의 ID(CS상담사, HDO관리자등)',
    },
    orgId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      comment: '환불해준 유저의 org ID(CS상담사, HDO관리자등)',
    },
    div_code: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['BROKEN', 'ETC'],
      defaultValue: 'BROKEN',
      comment: 'BROKEN: 고장, ETC: 기타',
    },
    refund_reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '환불사유(reason,comment,비고)',
    },
    oriPgCno: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '원주문 거래번호',
    },
    cancelPgCno: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '취소주문 거래번호',
    },
    statusCode: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '상태 코드',
    },
    cancelAmount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '취소금액',
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
    modelName: 'RequestRefund',
    indexes: [
      { name: 'noti_id', fields: ['noti_id'] },
      { name: 'userIdIndex', fields: ['userId'] },
      { name: 'orgIdIndex', fields: ['orgId'] },
    ],
    timestamps: false,

    }
  )
  return RequestRefund;
}
