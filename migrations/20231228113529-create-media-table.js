'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Media', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'media id',
      },
      filePath: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'file path',
      },
      s3Url: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 's3 url',
      },
      createdAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdWho: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'created by user id',
      },
      updatedWho: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'updated by user id',
      },
    });

    await queryInterface.addIndex('Media', ['createdWho'], { name: 'idx_createdWho' });
    await queryInterface.addIndex('Media', ['updatedWho'], { name: 'idx_updatedWho' });
    await queryInterface.addIndex('Media', ['filePath'], { name: 'idx_filePath' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Media');
  },
};
