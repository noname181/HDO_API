const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      models.Role.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.Role.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.Role.hasMany(models.UsersNew, {
        as: 'users',
        foreignKey: 'roleId',
        constraints: false,
      });
    }
  }

  Role.init(
    {
      id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        comment: 'role id',
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'role name',
      },
      mainMenu: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'default page',
        defaultValue: '대시보드',
      },
      listPermission: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'permission to read data without private data',
        defaultValue: '[]',
      },
      readPermission: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'permission to read data with private data',
        defaultValue: '[]',
      },
      writePermission: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'permission to create and update data with private data',
        defaultValue: '[]',
      },
      deletePermission: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'permission to delete data with private data',
        defaultValue: '[]',
      },
      createdAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      sequelize,
      modelName: 'Role',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
      indexes: [
        { name: 'createdWho', fields: ['createdWho'] },
        { name: 'updatedWho', fields: ['updatedWho'] },
        { name: 'name', fields: ['name'] },
      ],
    }
  );

  return Role;
};
