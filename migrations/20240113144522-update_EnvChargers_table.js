'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => { 
        await queryInterface.changeColumn(
          'EnvChargers',
          'output',
          { 
            type: Sequelize.INTEGER,
            comment: "기관아이디",
          },
          { transaction: t }
        );
      });
    } catch (error) {
      console.log('20240113144522-update_EnvChargers_table::up::error:', error);
      return;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => { 
        await queryInterface.changeColumn(
          'EnvChargers',
          'output',
          { 
            type: Sequelize.TINYINT, 
            comment: "기관아이디",
          },
          { transaction: t }
        ); 
      });
     
    } catch (error) { 
      console.log('20240113144522-update_EnvChargers_table::down::error:', error);
      return;
    }
  },
};
