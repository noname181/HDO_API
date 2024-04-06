const cryptor = require("../util/cryptor");
'use strict';
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class ErrorCode extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */

		static associate(models) {
			// define association here
		}
	}

	ErrorCode.init(
		{
			errorCode: {
				type: DataTypes.STRING(255),
				primaryKey: true,
				comment: '에러코드',
			},
			errorMsg: {
				type: DataTypes.STRING(255),
				allowNull: false,
				comment: '에러메시지',
			},
			solution: {
				type: DataTypes.STRING(1024),
				allowNull: true,
				comment: '솔루션',
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
			modelName: 'ErrorCode',
			timestamps: true,
			createdAt: false,
			paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
			indexes: [{unique: true, fields: ['errorMsg']}],
		}
	);
	return ErrorCode;
};
