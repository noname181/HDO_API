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
        // * carWash table
        await queryInterface.addIndex('CarWashes', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('CarWashes', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('CarWashes', {
          fields: ['userId'],
          using: 'BTREE',
          transaction: t,
        });

        // * charger_records_tb
        await queryInterface.addIndex('charger_records_tb', {
          fields: ['charger_id'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('charger_records_tb', {
          fields: ['station_id'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('charger_records_tb', {
          fields: ['org_id'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('charger_records_tb', {
          fields: ['mall_id'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('charger_records_tb', {
          fields: ['area_id'],
          using: 'BTREE',
          transaction: t,
        });
        await queryInterface.addIndex('charger_records_tb', {
          fields: ['branch_id'],
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
        await queryInterface.removeIndex('CarWashes', ['createdWho'], {
          transaction: t,
        });
        await queryInterface.removeIndex('CarWashes', ['updatedWho'], {
          transaction: t,
        });
        await queryInterface.removeIndex('CarWashes', ['userId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('charger_records_tb', ['charger_id'], {
          transaction: t,
        });
        await queryInterface.removeIndex('charger_records_tb', ['station_id'], {
          transaction: t,
        });
        await queryInterface.removeIndex('charger_records_tb', ['org_id'], {
          transaction: t,
        });
        await queryInterface.removeIndex('charger_records_tb', ['mall_id'], {
          transaction: t,
        });
        await queryInterface.removeIndex('charger_records_tb', ['area_id'], {
          transaction: t,
        });
        await queryInterface.removeIndex('charger_records_tb', ['branch_id'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231226041841-add_index_for_banner_models::down::error:', error);
      return;
    }
  },
};
