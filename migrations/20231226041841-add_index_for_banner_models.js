'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.addIndex('BannerModels', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('BannerModels', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('BannerModels', {
          fields: ['startdate'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('BannerModels', {
          fields: ['enddate'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('BannerModels', {
          fields: ['title'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('BannerModels', {
          fields: ['option'],
          using: 'BTREE',
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231226041841-add_index_for_banner_models::up::error:', error);
      return;
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.removeIndex('BannerModels', ['createdWho'], {
          transaction: t,
        });
        await queryInterface.removeIndex('BannerModels', ['updatedWho'], {
          transaction: t,
        });
        await queryInterface.removeIndex('BannerModels', ['startdate'], {
          transaction: t,
        });

        await queryInterface.removeIndex('BannerModels', ['enddate'], {
          transaction: t,
        });

        await queryInterface.removeIndex('BannerModels', ['title'], {
          transaction: t,
        });

        await queryInterface.removeIndex('BannerModels', ['option'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231226041841-add_index_for_banner_models::down::error:', error);
      return;
    }
  },
};
