const cryptor = require("../util/cryptor");
'use strict';
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class ChargingStationCluster extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		/* 충전소 위치 클러스터 */

		static associate(models) {
			// define association here
		}
	}

	ChargingStationCluster.init(
		{
			id: {
				type: DataTypes.UUID,
				allowNull: false,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
				comment: '고유 ID'
			},
			bias: {
				type: DataTypes.DOUBLE(3,1),
				allowNull: false,
				comment: '클러스터링 편향수치(낮을 수록 클러스터 갯수 증가)',
			},
			zoomLevel: {
				type: DataTypes.DOUBLE(3,1),
				allowNull: false,
				comment: '매핑될 줌 레벨(소수점 단위로 끊을 예정)',
			},
			size: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: true,
				comment: '클러스터 리스트',
			},
			point: {
				type: DataTypes.JSON,
				allowNull: true,
				comment: '클러스터 리스트',
			},
			center: {
				type: DataTypes.GEOMETRY('POINT'),
				allowNull: true,
				defaultValue: null,
				comment: '충전소 위치정보 GEOMETRY 값',
				get() {
					const center = this.getDataValue('center');
					return center
						? {
							longitude: center['x'],
							latitude: center['y'],
						} : {
							longitude: null,
							latitude: null,
						};
				},
				set(center) {
					this.setDataValue('center', {
						type: 'Point',
						coordinates: [center.longitude, center.latitude]
					});
				}
			},
			createdAt: {
				type: "TIMESTAMP",
				defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: 'ChargingStationCluster',
			timestamps: false,
			createdAt: false,
			updatedAt: false,
		}
	);
	return ChargingStationCluster;
};
