'use strict';

const TABLE_NAME = 'all_logs';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hasTable = await queryInterface.tableExists(TABLE_NAME);
    if (hasTable) {
      return;
    }

    await queryInterface.createTable(
      TABLE_NAME,
      {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          comment: 'id',
        },
        url: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: 'url of api register card',
        },
        content: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'payment gateway response data',
        },
        userId: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
        },
        createdAt: {
          type: 'TIMESTAMP',
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false,
        },
        updatedAt: {
          type: 'TIMESTAMP',
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false,
        },
      },
      {
        comment: 'Register Card logging',
        collate: 'utf8_general_ci',
        engine: 'InnoDB',
      }
    );

    await queryInterface.addIndex(TABLE_NAME, {
      fields: ['createdAt', 'url', 'userId'],
      using: 'BTREE',
    });

    return;
  },

  async down(queryInterface, Sequelize) {
    const hasTable = await queryInterface.tableExists(RELATION_TABLE_NAME);
    if (!hasTable) {
      return;
    }

    await queryInterface.removeIndex(TABLE_NAME, ['createdAt', 'url', 'userId']);

    await queryInterface.dropTable(TABLE_NAME);
  },
};
