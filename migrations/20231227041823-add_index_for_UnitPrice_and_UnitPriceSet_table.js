'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.addIndex('UnitPrices', {
          fields: ['title'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UnitPrices', {
          fields: ['useYN'],
          using: 'BTREE',
          transaction: t,
        });
      
        await queryInterface.addIndex('UnitPriceSets', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UnitPriceSets', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UnitPriceSets', {
          fields: ['createdAt'],
          using: 'BTREE',
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231227041823-add_index_for_UnitPrice_and_UnitPriceSet_table::up::error:', error);
      return;
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.removeIndex('UnitPrices', ['title'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UnitPrices', ['useYN'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UnitPriceSets', ['createdWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UnitPriceSets', ['updatedWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UnitPriceSets', ['createdAt'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231227041823-add_index_for_UnitPrice_and_UnitPriceSet_table::down::error:', error);
      return;
    }
  }
};
