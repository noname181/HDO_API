const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    /* 환경부  API에서 가져온 데이터 원본*/
    class EnvChargeStationTran extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        /*환경부 API 데이터 중 사용할 데이터 임시 저장*/
        static associate(models) {
            // define association here
        }
    }
    EnvChargeStationTran.init(
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
            coordinate: {
                type: DataTypes.GEOMETRY('POINT'),
                allowNull: true,
                defaultValue: null,
                comment: '충전소 위치정보 GEOMETRY 값',
                get() {
                    const coordinate = this.getDataValue('coordinate');
                    return coordinate
                        ? {
                              longitude: coordinate['x'],
                              latitude: coordinate['y'],
                          }
                        : {
                            longitude: null,
                            latitude: null,
                        };
                },
                set(coordinate) {
                    this.setDataValue('coordinate', {
                        type: 'Point',
                        coordinates: [
                            coordinate.longitude,
                            coordinate.latitude,
                        ],
                    });
                },
            },
            lat: {
                type: DataTypes.STRING,
                comment: '충전기위도',
            },
            lng: {
                type: DataTypes.STRING,
                comment: '충전기경도',
            },
            busiId: {
                type: DataTypes.STRING,
                comment: '기관 아이디'
            },
            bnm: {
                type: DataTypes.STRING,
                comment: '기관명'
            },
            maxOutput: {
                type: DataTypes.STRING,
                comment: '충전용량kW',
            },
            method: {
                type: DataTypes.STRING,
                comment: '충전방식',
            },
            parkingFree: {
                type: DataTypes.STRING,
                comment: '주차료',
            },
            limitYn: {
                type: DataTypes.ENUM,
                values: ['N', 'Y'],
                comment: '이용자 제한 ( N : 없음 )',
            },
            limitDetail: {
                type: DataTypes.STRING,
                comment: '이용제한 사유',
            },
            note: {
                type: DataTypes.STRING,
                comment: '충전소이용안내사항',
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
            /**====================================================
             * 삭제 부분
             * ====================================================
             */
            // zcode: {
            //     type: DataTypes.STRING,
            //     comment: '시도코드',
            // },
            // zscode: {
            //     type: DataTypes.STRING,
            //     comment: '지역구분상세',
            // },
            // kind: {
            //     type: DataTypes.STRING,
            //     comment: '충전소구분',
            // },
            // kindDetail: {
            //     type: DataTypes.STRING,
            //     comment: '충전소구분상세',
            // },
        },
        {
            sequelize,
            modelName: 'EnvChargeStationTran',
            timestamps: true,
            createdAt: false,
            updatedAt: false,
        }
    );
    return EnvChargeStationTran;
};
