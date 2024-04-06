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
        await queryInterface.addIndex('UPSets', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UPSets', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });
      
        await queryInterface.addIndex('UPSets', {
          fields: ['useYN'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UPSetDetails', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UPSetDetails', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UPSetDetails', {
          fields: ['upSetId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('UPSetDetails', {
          fields: ['upTimeTableId'],
          using: 'BTREE',
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231227070150-add_index_for_upSet_and_UPSetDetails_table::up::error:', error);
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
        await queryInterface.removeIndex('UPSets', ['createdWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UPSets', ['updatedWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UPSets', ['useYN'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UPSetDetails', ['createdWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UPSetDetails', ['updatedWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UPSetDetails', ['upSetId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('UPSetDetails', ['upTimeTableId'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231227070150-add_index_for_upSet_and_UPSetDetails_table::down::error:', error);
      return;
    }
  }
};
