const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class sb_unitprice_change_reservation extends Model {
    static associate(models) {
      // Define associations if needed
      models.sb_unitprice_change_reservation.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.sb_unitprice_change_reservation.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.sb_unitprice_change_reservation.belongsTo(models.UnitPriceSet, {
        as: 'unitPriceSet',
        foreignKey: 'floatingPrice',
        constraints: false,
      });
      models.sb_unitprice_change_reservation.belongsTo(models.sb_charger, {
        as: 'charger',
        foreignKey: 'chargerId',
        constraints: false,
      });
    }
  }

  sb_unitprice_change_reservation.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      priceOption: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'N',
      },
      date: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      fixedPrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      excutedYN: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: [
          'Y',
          'N',
        ],
        defaultValue: 'N',
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
      modelName: 'sb_unitprice_change_reservation',
      tableName: 'sb_unitprice_change_reservations',
      collate: 'utf8_general_ci',
      engine: 'InnoDB',
      createdAt: false,
      updatedAt: false,
      paranoid: false, // Hard Delete
      indexes: [
        { name: 'date', fields: ['date'] },
      ],
    }
  );

  return sb_unitprice_change_reservation;
};
