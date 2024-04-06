const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    /* 환경부  API에서 가져온 데이터 원본*/
    class FavoriteChargerStation extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        /*환경부 API에서 가져온 데이터 원본*/
        static associate(models) {
            // define association here
            models.FavoriteChargerStation.belongsTo(models.UsersNew, {
                as: 'createdBy',
                foreignKey: 'createdWho',
                constraints: false,
            });
            models.FavoriteChargerStation.belongsTo(models.UsersNew, {
                as: 'updatedBy',
                foreignKey: 'updatedWho',
                constraints: false,
            });
            models.FavoriteChargerStation.belongsTo(models.UsersNew, {
                as: 'user',
                foreignKey: 'userId',
                constraints: false,
            });
            models.FavoriteChargerStation.belongsTo(models.sb_charging_station, {
                as: 'charger',
                foreignKey: 'chargerId', 
                targetKey: 'chgs_id', // Target key in sb_charging_station
            });
            
            models.FavoriteChargerStation.belongsTo(models.EnvChargeStation, {
                as: 'envCharger',
                foreignKey: 'envChargerId', 
                targetKey: 'statId', // Target key in EnvChargeStation
            });
        }
    }
    FavoriteChargerStation.init(
        {
            id: {
                type: DataTypes.UUID,
				allowNull: false,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
            },
            nickname: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'nickname of the station', 
            },
            sortNumber: {
                type: DataTypes.INTEGER(10).UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            chargerId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            envChargerId: {
                type: DataTypes.STRING,
                allowNull: true, 
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
        },
        {
            sequelize,
            modelName: 'FavoriteChargerStation',
            timestamps: true,
		    createdAt: false,
		    updatedAt: false,
            paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
        }
    );
    return FavoriteChargerStation;
};
