const cryptor = require("../util/cryptor");
'use strict';
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    /* 환경부  API에서 가져온 데이터 원본*/
    class EnvChargerOrg extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        /*환경부 API에서 가져온 데이터 원본*/
        static associate(models) {
            // define association here

        }
    }
    EnvChargerOrg.init(
        {
            statNm: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: '충전소명',
              },
              statId: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: '충전소ID',
              },
              chgerId: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: '충전기ID',
              },
              chgerType: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: '충전기타입',
              },
              addr: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: '충전기주소',
              },
              location: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: '충전기상세위치',
              },
              lat: {
                type: DataTypes.STRING,
                comment: '충전기위도',
              },
              lng: {
                type: DataTypes.STRING,
                comment: '충전기경도',
              },
              useTime: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: '충전기이용가능시간',
              },
              busiId: {
                type: DataTypes.STRING,
                comment: '기관아이디',
              },
              bnm: {
                type: DataTypes.STRING,
                comment: '기관명',
              },
              busiNm: {
                type: DataTypes.STRING,
                comment: '운영기관명',
              },
              busiCall: {
                type: DataTypes.STRING,
                comment: '운영기관연락처',
              },
              stat: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: '충전기상태',
              },
              statUpdDt: {
                type: DataTypes.STRING,
                comment: '충전기상태변경통신이상통신복구일시',
              },
              lastTsdt: {
                type: DataTypes.STRING,
                comment: '마지막충전시작일시',
              },
              lastTedt: {
                type: DataTypes.STRING,
                comment: '마지막충전종료일시',
              },
              nowTsdt: {
                type: DataTypes.STRING,
                comment: '충전중시작일시',
              },
              output: {
                type: DataTypes.STRING,
                comment: '충전용량kW',
              },
              method: {
                type: DataTypes.STRING,
                comment: '충전방식',
              },
              kind: {
                type: DataTypes.STRING,
                comment: '충전소구분',
              },
              kindDetail: {
                type: DataTypes.STRING,
                comment: '충전소구분상세',
              },
              parkingFree: {
                type: DataTypes.STRING,
                comment: '주차료',
              },
              note: {
                type: DataTypes.STRING,
                comment: '충전소이용안내사항',
              },
              limitYn: {
                type: DataTypes.STRING,
                comment: '이용자제한',
              },
              limitDetail: {
                type: DataTypes.STRING,
                comment: '이용제한사유',
              },
              delYn: {
                type: DataTypes.STRING,
                comment: '충전기정보삭제여부',
              },
              delDetail: {
                type: DataTypes.STRING,
                comment: '충전기정보삭제사유',
              },
              trafficYn: {
                type: DataTypes.STRING,
                comment: '편의제공여부',
              },
              createdAt: {
                type: "TIMESTAMP",
                defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
                allowNull: false,
              },
              updatedAt: {
                type: "TIMESTAMP",
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
                onUpdate: sequelize.literal('CURRENT_TIMESTAMP'),
                allowNull: false,
              },
              /**====================================================================
               * 삭제 부분
               * ====================================================================
               */
              // zcode: {
              //   type: DataTypes.STRING,
              //   comment: '시도코드',
              // },
              // zscode: {
              //   type: DataTypes.STRING,
              //   comment: '지역구분상세',
              // },
        },
        {
            sequelize,
            modelName: 'EnvChargerOrg',
            timestamps: true,
		createdAt: false,
		updatedAt: false,
        }
    );
    return EnvChargerOrg;
};
