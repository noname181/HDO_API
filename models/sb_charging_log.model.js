const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sb_charging_log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /*사용자 충전기 이용 로그 테이블*/
    static associate(models) {
      // define association here
      models.sb_charging_log.belongsTo(models.sb_charger, {
        as: 'chargerUseLog',
        foreignKey: 'chg_id',
        constraints: false,
      });
      /**
       * 충전소와 1:N 관계
       */
      models.sb_charging_log.belongsTo(models.sb_charging_station, {
        as: 'chargingStationUseLog',
        foreignKey: 'chgs_id',
        constraints: false,
      });
      models.sb_charging_log.belongsTo(models.UsersNew, {
        as: 'userNew',
        foreignKey: 'usersNewId',
        constraints: false,
      });
      models.sb_charging_log.belongsTo(models.PaymentNotification, {
        as: 'paymentNotification',
        foreignKey: 'order_no',
        targetKey: 'order_no',
        constraints: false,
      });
    }
  }
  sb_charging_log.init(
    {
      cl_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '이용자 충전 로그 pk, 인덱스 번호',
      },
      cl_channel: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: false,
        comment: '충전기 충전 채널 번호',
      },
      cl_order_user_no: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '멤버십 카드 ID',
      },
      cl_order_mac_addr: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '차량 MAC-Addr',
      },
      cl_transaction_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '충전 transaction 아이디?',
      },
      cl_start_datetime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '충전시작시간',
      },
      cl_end_datetime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '충전종료시간',
      },
      cl_unplug_datetime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '언플러그시간',
      },
      cl_kwh: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: '실제 충전된 용량(실측에선 wh로 측정됨. 추후 데이터타입 바꿔야할수 있음)',
      },
      soc: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '연결된 차량의 배터리잔량',
      },
      remain: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '완충시까지 남은 분(minutes)',
      },
      useType: {
        type: DataTypes.ENUM,
        values: ['CREDIT', 'RF', 'NFC', 'APP', 'PNC'],
        allowNull: false,
        defaultValue: 'CREDIT',
        comment: '충전 유형 (CREDIT, RF, NFC, APP,  PNC)',
      },
      desired_kwh: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: '충전 지시 용량',
      },
      desired_percent: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '충전 지시 비율',
      },
      desired_amt: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '충전 지시 희망금액',
      },
      appliedUnitPrice: {
        type: DataTypes.SMALLINT(5).UNSIGNED,
        allowNull: true,
        comment: '적용 단가 ',
      },
      cl_start_meter: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: '충전기 충전 시작값',
      },
      cl_stop_meter: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: '충전기 충전 종료값',
      },
      reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '충전 종료 이유',
      },
      chargeFee: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '실제로 결제된 금액(감산분 반영)',
      },
      ignored_kwh: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: '완충후 최종 종료와의 시간차로 인해 결제금액에 계산되지 않고 무시된 전력량',
      },
      cl_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('NOW'),
        comment: '등록일',
      },
      // auth_num
      pg_cno: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'PG거래번호(pgCno)',
      },
      order_no: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '결제 발생하는 주문번호(샵 트랜잭션 아이디로 사용되기도함.)',
      },
      approval_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'pg사에서 부여한 승인번호(취소등이 아닌 원본 결제에 해당하면 붙음)',
      },
      payMethodDetail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '결제 카드 식별용 정보(ex. 카드 마지막 4자리 등) - 비회원 결제기록용',
      },
      authAmtCharge: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: true,
        comment: '충전 선결제 금액',
      },
      authAmtPark: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: true,
        comment: '미출차 선결제 금액',
      },
      authDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '결제일시 ',
      },
      payCompletedYn: {
        type: DataTypes.ENUM,
        values: ['N', 'Y', ''],
        allowNull: true,
        defaultValue: 'N',
        comment: '앱(후불), 현장(부분취소) 결제가 정상완료되었는지 여부',
      },
      receivePhoneNo: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '문자 수신 번호',
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
      afterAction: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'COST (잡손실처리) // PAID (후속지불완료) ',
      },
      expectedAmt: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: true,
        comment: '결제에 성공했어야 했을 금액',
      },
      afterPaidAmt: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: true,
        comment: '초기 결제 실패후 나중에 지불한 금액 총액',
      },
    },
    {
      sequelize,
      modelName: 'sb_charging_log',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true,
    }
  );
  return sb_charging_log;
};
