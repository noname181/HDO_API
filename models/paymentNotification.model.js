/*
 * CREATE TABLE IF NOT EXISTS PaymentNotifications
 *     ( id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
 *     , res_cd            CHAR(4)         NOT NULL COMMENT 'PG거래번호'
 *     , res_msg           VARCHAR(100)    NOT NULL COMMENT '응답메시지'
 *     , cno               VARCHAR(100)    NOT NULL COMMENT 'PG거래번호'
 *     , order_no          VARCHAR(40)     NOT NULL COMMENT '주문번호'
 *     , amount            INT UNSIGNED    NOT NULL COMMENT '총 결제금액'
 *     , auth_no           VARCHAR(20)              COMMENT '승인번호'
 *     , tran_date         DATETIME        NOT NULL COMMENT '승인/변경일시'
 *     , card_no           VARCHAR(40)              COMMENT '카드번호'
 *     , issuer_cd         CHAR(3)                  COMMENT '발급사코드'
 *     , issuer_nm         VARCHAR(20)              COMMENT '발급사명'
 *     , acquirer_cd       CHAR(3)                  COMMENT '매입사코드'
 *     , acquirer_nm       VARCHAR(20)              COMMENT '매입사명'
 *     , noint             CHAR(2)                  COMMENT '무이자여부'
 *     , install_period    TINYINT UNSIGNED         COMMENT '할부개월'
 *     , used_pnt          INT UNSIGNED             COMMENT 'This value is not documented'
 *     , escrow_yn         ENUM('Y', 'N')  NOT NULL COMMENT '에스크로 사용유무'
 *     , complex_yn        ENUM('Y', 'N')           COMMENT 'This value is not documented'
 *     , stat_cd           CHAR(4)         NOT NULL COMMENT '상태코드'
 *     , stat_msg          VARCHAR(50)     NOT NULL COMMENT '상태메시지'
 *     , van_tid           VARCHAR(32)              COMMENT 'This value is not documented'
 *     , van_sno           CHAR(12)                 COMMENT 'VAN 거래일련번호'
 *     , pay_type          CHAR(2)         NOT NULL COMMENT '결제수단'
 *     , memb_id           CHAR(8)         NOT NULL COMMENT '가맹점 ID'
 *     , noti_type         CHAR(2)         NOT NULL COMMENT '노티구분'
 *     , part_cancel_yn    ENUM('Y', 'N')           COMMENT '부분취소 가능여부'
 *     , memb_gubun        VARCHAR(8)               COMMENT 'This value is not documented'
 *     , card_gubun        ENUM('N', 'Y', 'G')      COMMENT '카드 종류; N : 신용, Y : 체크, G : 기프트'
 *     , card_biz_gubun    ENUM('P', 'C', 'N')      COMMENT '발급 주체 구분; P : 개인, C : 법인, N : 기타'
 *     , cpon_flag         ENUM('Y', 'N')           COMMENT 'This value is not documented'
 *     , cardno_hash       VARCHAR(50)              COMMENT 'This value is not documented'
 *     , sub_card_cd       CHAR(3)                  COMMENT '빌키발급 시 BC 제휴사 카드코드'
 *     , bk_pay_yn         ENUM('Y', 'N')  NOT NULL COMMENT 'This value is not documented'
 *     , remain_pnt        INT UNSIGNED             COMMENT 'This value is not documented'
 *     , accrue_pnt        INT UNSIGNED             COMMENT 'This value is not documented'
 *     , canc_date         DATETIME                 COMMENT '취소일시'
 *     , mgr_amt           INT UNSIGNED             COMMENT '취소(변경)금액'
 *     , mgr_card_amt      INT UNSIGNED             COMMENT 'This value is not documented'
 *     , mgr_cpon_amt      INT UNSIGNED             COMMENT 'This value is not documented'
 *     , mgr_seqno         CHAR(20)                 COMMENT 'This value is not documented'
 *     , mgr_req_msg       VARCHAR(100)             COMMENT 'This value is not documented'
 *     , day_rem_pnt       INT UNSIGNED             COMMENT 'This value is not documented'
 *     , month_rem_pnt     INT UNSIGNED             COMMENT 'This value is not documented'
 *     , day_rem_cnt       INT UNSIGNED             COMMENT 'This value is not documented'
 * ) COMMENT '전달받은 EasyPay 문서의 신뢰성이 떨어져서 ENUM을 사용하기 어려워 보임';
 */
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentNotification extends Model {
    static associate(models) {
      models.PaymentNotification.belongsTo(models.sb_charging_log, {
        as: 'chargingLogs',
        foreignKey: 'cno',
        targetKey: 'pg_cno',
        constraints: false,
      });
      models.PaymentNotification.belongsTo(models.sb_charger, {
        as: 'sb_charger_memb',
        foreignKey: 'chg_id',
        targetKey: 'chg_id',
        constraints: false,
      });
      models.PaymentNotification.hasMany(models.RequestRefund, {
        as: 'requestRefunds',
        foreignKey: 'cancelPgCno',
        sourceKey: 'mgr_seqno',
        constraints: false,
      });
    }
  }

  PaymentNotification.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      cl_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        comment: 'charging log id',
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
      res_cd: {
        type: DataTypes.CHAR(4),
        allowNull: false,
        comment: 'PG거래번호',
      },
      res_msg: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '응답메시지',
      },
      cno: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'PG거래번호',
      },
      order_no: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '주문번호',
      },
      amount: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: '총 결제금액',
      },
      auth_no: {
        type: DataTypes.STRING(255),
        comment: '승인번호',
      },
      tran_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '승인/변경일시',
      },
      card_no: {
        type: DataTypes.STRING(255),
        comment: '카드번호',
      },
      issuer_cd: {
        type: DataTypes.CHAR(3),
        comment: '발급사코드',
      },
      issuer_nm: {
        type: DataTypes.STRING(255),
        comment: '발급사명',
      },
      acquirer_cd: {
        type: DataTypes.CHAR(3),
        comment: '매입사코드',
      },
      acquirer_nm: {
        type: DataTypes.STRING(255),
        comment: '매입사명',
      },
      noint: {
        type: DataTypes.CHAR(2),
        comment: '무이자여부',
      },
      install_period: {
        type: DataTypes.TINYINT,
        comment: '할부개월',
      },
      used_pnt: {
        type: DataTypes.INTEGER,
        comment: 'This value is not documented',
      },
      escrow_yn: {
        type: DataTypes.ENUM('Y', 'N'),
        allowNull: true,
        comment: '에스크로 사용유무',
      },
      complex_yn: {
        type: DataTypes.ENUM('Y', 'N'),
        comment: 'This value is not documented',
      },
      stat_cd: {
        type: DataTypes.CHAR(4),
        allowNull: true,
        comment: '상태코드',
      },
      stat_msg: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '상태메시지',
      },
      van_tid: {
        type: DataTypes.STRING(255),
        comment: 'This value is not documented',
      },
      van_sno: {
        type: DataTypes.CHAR(12),
        comment: 'VAN 거래일련번호',
      },
      pay_type: {
        type: DataTypes.CHAR(2),
        allowNull: true,
        comment: '결제수단',
      },
      memb_id: {
        type: DataTypes.CHAR(8),
        allowNull: true,
        comment: '가맹점 ID',
      },
      noti_type: {
        type: DataTypes.CHAR(2),
        allowNull: true,
        comment: '노티구분',
      },
      part_cancel_yn: {
        type: DataTypes.ENUM('Y', 'N'),
        comment: '부분취소 가능여부',
      },
      memb_gubun: {
        type: DataTypes.STRING(255),
        comment: 'This value is not documented',
      },
      card_gubun: {
        type: DataTypes.ENUM('N', 'Y', 'G'),
        comment: '카드 종류; N : 신용, Y : 체크, G : 기프트',
      },
      card_biz_gubun: {
        type: DataTypes.ENUM('P', 'C', 'N'),
        comment: '발급 주체 구분; P : 개인, C : 법인, N : 기타',
      },
      cpon_flag: {
        type: DataTypes.ENUM('Y', 'N'),
        comment: 'This value is not documented',
      },
      cardno_hash: {
        type: DataTypes.STRING(255),
        comment: 'This value is not documented',
      },
      sub_card_cd: {
        type: DataTypes.CHAR(3),
        comment: '빌키발급 시 BC 제휴사 카드코드',
      },
      bk_pay_yn: {
        type: DataTypes.ENUM('Y', 'N'),
        allowNull: true,
        comment: 'This value is not documented',
      },
      remain_pnt: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: 'This value is not documented',
      },
      accrue_pnt: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: 'This value is not documented',
      },
      canc_date: {
        type: DataTypes.DATE,
        comment: '취소일시',
      },
      mgr_amt: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: '취소(변경)금액',
      },
      mgr_card_amt: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: 'This value is not documented',
      },
      mgr_cpon_amt: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: 'This value is not documented',
      },
      mgr_seqno: {
        type: DataTypes.CHAR(20),
        comment: 'This value is not documented',
      },
      mgr_req_msg: {
        type: DataTypes.STRING(255),
        comment: 'This value is not documented',
      },
      day_rem_pnt: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: 'This value is not documented',
      },
      month_rem_pnt: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: 'This value is not documented',
      },
      day_rem_cnt: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: 'This value is not documented',
      },
      isRetry: {
        type: DataTypes.STRING(255),
        allowNull : true,
        defaultValue: "N",
        comment: '재결제 일경우 이게 응답된다??',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'PaymentNotification',
      timestamps: false,
      collate: 'utf8_general_ci',
      engine: 'InnoDB',
      indexes: [
        { name: 'cl_id', fields: ['cl_id'] },
      ],
    }
  );
  return PaymentNotification;
};
