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
        await queryInterface.addIndex('SAP_Person', {
          fields: ['ENAME'],
          using: 'BTREE',
          transaction: t,
        });
        
      });
    } catch (error) {
      console.log('20231226033839-add_index_for_sap_person_table::up::error:', error);
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
        await queryInterface.removeIndex('SAP_Person', ['ENAME'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231226033839-add_index_for_sap_person_table::down::error:', error);
      return;
    }
  }
};
