'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => {  
        await queryInterface.addIndex('EnvChargers', {
          fields: ['limitYn'],
          using: 'BTREE',
          transaction: t,
        }); 
      });
    } catch (error) {
      console.log('20240110035314-update_EnvChargers_table::up::error:', error);
      return;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        
      });
     
    } catch (error) { 
      console.log('20240110035314-update_EnvChargers_table::down::error:', error);
      return;
    }
  },
};
