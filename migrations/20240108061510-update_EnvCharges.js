'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => { 
        await queryInterface.addIndex('EnvChargers', {
          fields: ['output'],
          using: 'BTREE',
          transaction: t,
        }); 
      });
    } catch (error) {
      console.log('20240108061510-update_EnvCharges::up::error:', error);
      return;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        
      });
     
    } catch (error) { 
      console.log('20240108061510-update_EnvCharges::down::error:', error);
      return;
    }
  },
};
