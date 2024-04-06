const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sb_charge_local_ic_pay extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /* 충전기 현장결제 정보 등록*/

    static associate(models) {
      // define association here
    }
  }

  Sb_charge_local_ic_pay.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        comment: 'sb_charge_local_ic_pay id',
      },
      chg_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: '충전기인덱스',
      },
      connector_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '커넥터 ID(충전기채널)',
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '휴대폰번호',
      },
      payInfoYn: {
        type: DataTypes.ENUM,
        values: ["N", "Y"],
        defaultValue: "N",
        comment: "결제정보까지 등록이 되었는지 여부"
      },
      autoRefundYn: {
        type: DataTypes.ENUM,
        values: ["N", "Y"],
        defaultValue: "N",
        comment: "자동환불여부"
      },
      ordernumber: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '현장결제 주문번호(= 샵 트랜잭션 ID = 현장결제 가맹점에서 부여한 트랜잭션 고유번호)',
      },
      approvalnumber: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        comment: '승인번호',
      },
      paid_fee: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '결제요금',
      },
      cardkey: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        comment: '카드번호',
      },
      applied_unit_price: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '단가정보',
      },
      desired_kwh: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: '충전 지시 용량',
      },
      pg_cno: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        comment: '거래번호',
      },
      mall_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
        comment: '노티의 memb_id. mallId',
      },
      cl_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: null,
        comment: '충전로그 id',
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
      modelName: 'sb_charge_local_ic_pay',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
      indexes: [
        { name: 'pg_cno_index', fields: ['pg_cno'] },
        { name: 'cl_id_index', fields: ['cl_id'] },
      ]
    }
  );
  return Sb_charge_local_ic_pay;
};


// 결정해야할 문제

// 노티가 들어올때, 노티 타입이 10이면, 해당 승인번호와 주문번호를 가진 현장결제 정보가 있는지 알아본후
// 그 현장결제 정보에 pgCno와 mallId도 넣어준다. 이 pgCno는 나중에 인덱스를 걸어놓고 빠른 조인을 위한 수단으로 사용한다.
// 이렇게 폰, 결제정보, 노티가 무조건 확정적으로 이어지게 된다.
// 추가적으로 이 현장결제정보와 차징로그를 잇는다.
// 배치가 돌때, 그냥 이 현장결제정보 테이블만 보고, '차징로그로 이어지지 않았고 결제는 되었음'을 바로 판단이 가능하다.
// 그렇다면 그냥 mallId와 pgCno를 이용하여 전체취소를 시키고, 기록된 휴대폰번호로 자동취소문자를 보내주면 된다.
// 이 배치는 1분에 한번씩 돌아야 하기 때문에, 추후에 조인은 최대한 배제하는게 성능에 유리할 것이다.