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
            type: Sequelize.TINYINT,
            comment: "기관아이디",
          },
          { transaction: t }
        );
      });
    } catch (error) {
      console.log('20240110055446-update_EnvChargers_table::up::error:', error);
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
            type: Sequelize.ENUM,
            values: ['3','7','50','100','200'], 
            comment: "기관아이디",
          },
          { transaction: t }
        );
        await queryInterface.removeIndex('EnvChargers', ['statId'], {
          transaction: t,
        });
        await queryInterface.removeIndex('EnvChargers', ['busiId'], {
          transaction: t,
        });
      });
     
    } catch (error) { 
      console.log('20240110055446-update_EnvChargers_table::down::error:', error);
      return;
    }
  },
};
