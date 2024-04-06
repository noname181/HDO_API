const cryptor = require('../util/cryptor');
'use strict';
const {
	Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class WebUserReg extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			// association(1:1 관계 예시) - 하나의 사용자는 하나의 차량을 가짐.(교체시 기존 차량 삭제 후 신규 차량 등록)
			// models.User.hasOne(models.Vehicle, {
			// 	as: 'vehicle',
			// 	foreignKey: 'userId',
			// 	constraints: false
			// });
			models.WebUserReg.belongsTo(models.Org, {
				foreignKey: 'orgId',
				constraints: false
			});
		}
	}

	WebUserReg.init({
		id: {
			type: DataTypes.UUID,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			comment: 'userId, cognito에서 전달되는 사용자 식별자(keyname : sub)'
		},
		accountId: {
			type: DataTypes.STRING(320),
			allowNull: true,
			comment: '로그인용 계정 id(보통 email, hdo의 경우 아이디)',
		},
		status: {
			type: DataTypes.ENUM,
			allowNull: false,
			values: ['WAIT', 'DONE', 'RESET_PASSWORD'],
			defaultValue: 'WAIT',
			comment: '가입대기(WAIT) / 가입완료(DONE) / 패스워드 리셋요청(RESET_PASSWORD)'
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
			comment: '(암호화된) 사용자명',
			get() {
				const name = this.getDataValue('name');
				if (!name) return null;
				return cryptor.decrypt(name);
			},
			set(name) {
				if (!name) return null;
				const encryptedName = cryptor.encrypt(name);
				this.setDataValue('name', encryptedName);
			}
		},
		phoneNo: {
			type: DataTypes.STRING(255),
			allowNull: true,
			comment: '(암호화된)사용자 연락처',
			get() {
				const phoneNo = this.getDataValue('phoneNo');
				if (!phoneNo) return null;
				const decryptedPhoneNo = cryptor.decrypt(phoneNo);
				return decryptedPhoneNo;
			},
			set(phoneNo) {
				if (!phoneNo) return null;
				const encryptedNumber = cryptor.encrypt(phoneNo);
				this.setDataValue('phoneNo', encryptedNumber);
			}
		},
		role: {
			type: DataTypes.ENUM,
			allowNull: false,
			values: ['ADMIN', 'VIEWER'],
			defaultValue: 'VIEWER',
			comment: '권한(ADMIN관리자, VIEWER조회만 가능한 사용자)'
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
	}, {
		sequelize,
		modelName: 'WebUserReg',
		timestamps: true,
		createdAt: false,
		updatedAt: false,
		paranoid: true // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
	});
	return WebUserReg;
};