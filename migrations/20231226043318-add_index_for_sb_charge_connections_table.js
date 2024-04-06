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
        await queryInterface.addIndex('sb_charge_connections', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });
        
        await queryInterface.addIndex('sb_charge_connections', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charge_connections', {
          fields: ['usersNewId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charge_connections', {
          fields: ['chgs_id'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charge_connections', {
          fields: ['chg_id'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('sb_charge_connections', {
          fields: ['bookingId'],
          using: 'BTREE',
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231226043318-add_index_for_sb_charge_connections_table::up::error:', error);
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
        await queryInterface.removeIndex('sb_charge_connections', ['createdWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charge_connections', ['updatedWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charge_connections', ['usersNewId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charge_connections', ['chgs_id'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charge_connections', ['chg_id'], {
          transaction: t,
        });

        await queryInterface.removeIndex('sb_charge_connections', ['bookingId'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231226043318-add_index_for_sb_charge_connections_table::down::error:', error);
      return;
    }
  }
};
