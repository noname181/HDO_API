const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sb_charging_station extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /*충전소 테이블*/
    static associate(models) {
      // define association here

      models.sb_charging_station.belongsTo(models.UsersNew, {
        as: 'operatorManager',
        foreignKey: 'chgs_operator_manager_id',
        constraints: false,
      });
      models.sb_charging_station.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.sb_charging_station.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.sb_charging_station.belongsTo(models.Org, {
        as: 'org',
        foreignKey: 'orgId',
        constraints: false,
      });
      /**
       * 충전기 테이블과 N:1 관계
       */
      models.sb_charging_station.hasMany(models.sb_charger, {
        as: 'chargers',
        foreignKey: 'chgs_id',
        constraints: false,
      });
      models.sb_charging_station.hasMany(models.Review, {
        as: 'reviews',
        foreignKey: 'chgs_id',
        constraints: false,
      });
      /**
       * 충전소 운영 테이블과 1:N 관계
       */
      models.sb_charging_station.hasMany(models.Booking, {
        as: 'bookings',
        foreignKey: 'chgs_id',
        constraints: false,
      });
    }
  }

  sb_charging_station.init(
    {
      chgs_id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Charging station index value (auto-assigned)',
      },
      chgs_station_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Charging station ID',
      },
      status: {
        type: DataTypes.ENUM,
        values: ['ACTIVE', 'INACTIVE'],
        allowNull: false,
        defaultValue: 'ACTIVE',
        comment: 'Current charging station status (ACTIVE or INACTIVE)',
      },
      chgs_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Charging station name',
      },
      /**
       * 추가됨
       */
      coordinate: {
        type: DataTypes.GEOMETRY('POINT'),
        allowNull: true,
        defaultValue: null,
        comment: 'Charging station location information in GEOMETRY format',
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
            coordinates: [coordinate.longitude, coordinate.latitude],
          });
        },
      },
      chrgStartTime: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'Charging operation start time',
      },
      chrgEndTime: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'Charging operation end time',
      },
      washStartTime: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'Car wash operation start time',
      },
      washEndTime: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'Car wash operation end time',
      },
      chgs_kepco_meter_no: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Korea Electric Power Corporation (KEPCO) meter number',
      },
      isUse: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'Y',
        comment: 'Availability status (Instead of deletion: Y for operational, N for suspended)',
      },
      /**
       * 추가됨
       */
      chgs_car_wash_yn: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        default: 'Y',
        comment: 'Car wash availability (Y or N) --> Data that seems necessary, no input field on the screen',
      },
      chgs_aff_only: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Affiliate-only information',
      },
      chgs_field_desc: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Field description',
      },
      area_code_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Area code',
      },
      activeStationYN: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'N',
        comment: '',
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
      modelName: 'sb_charging_station',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true,
    }
  );
  return sb_charging_station;
};
