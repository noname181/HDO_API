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
        await queryInterface.addIndex('TermsAgrees', {
          fields: ['userId'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('TermsAgrees', {
          fields: ['termId'],
          using: 'BTREE',
          transaction: t,
        });
      
        await queryInterface.addIndex('TroubleReports', {
          fields: ['createdWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('TroubleReports', {
          fields: ['updatedWho'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('TroubleReports', {
          fields: ['reportStatus'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('TroubleReports', {
          fields: ['createdAt'],
          using: 'BTREE',
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231227032231-add_index_for_TermsAgree_and_TroubleReport_table::up::error:', error);
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
        await queryInterface.removeIndex('TermsAgrees', ['userId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('TermsAgrees', ['termId'], {
          transaction: t,
        });

        await queryInterface.removeIndex('TroubleReports', ['createdWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('TroubleReports', ['updatedWho'], {
          transaction: t,
        });

        await queryInterface.removeIndex('TroubleReports', ['reportStatus'], {
          transaction: t,
        });

        await queryInterface.removeIndex('TroubleReports', ['createdAt'], {
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20231227032231-add_index_for_TermsAgree_and_TroubleReport_table::down::error:', error);
      return;
    }
  }
};
