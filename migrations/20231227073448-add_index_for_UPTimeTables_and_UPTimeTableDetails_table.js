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
        await queryInterface.addIndex('UPTimeTables', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UPTimeTables', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });
      
        await queryInterface.addIndex('UPTimeTables', {
          fields: ['useYN'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UPTimeTableDetails', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UPTimeTableDetails', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UPTimeTableDetails', {
          fields: ['upTimeTableId'],
          using: 'BTREE',
          transaction: t,
        });

      });
    } catch (error) {
      console.log('20231227073448-add_index_for_UPTimeTables_and_UPTimeTableDetails_table::up::error:', error);
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
        await queryInterface.removeIndex('UPTimeTables', ['createdWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UPTimeTables', ['updatedWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UPTimeTables', ['useYN'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UPTimeTableDetails', ['createdWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UPTimeTableDetails', ['updatedWho'], {
          transaction: t,
        });
        
        await queryInterface.removeIndex('UPTimeTableDetails', ['upTimeTableId'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231227073448-add_index_for_UPTimeTables_and_UPTimeTableDetails_table::down::error:', error);
      return;
    }
  }
};
