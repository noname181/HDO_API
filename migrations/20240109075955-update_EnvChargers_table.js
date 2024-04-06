'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => { 
        await queryInterface.changeColumn(
          'EnvChargers',
          'chgerType',
          { 
            type: Sequelize.TINYINT,
            allowNull: false,
            comment: '충전기타입',
          },
          { transaction: t }
        ); 

        await queryInterface.changeColumn(
          'EnvChargers',
          'busiId',
          {
            type: Sequelize.STRING,
            omment: "기관아이디",
          },
          {
            transaction: t,
          }
        );  

        await queryInterface.addIndex('EnvChargers', {
          fields: ['chgerType'],
          using: 'BTREE',
          transaction: t,
        }); 
      });
    } catch (error) {
      console.log('20240109075955-update_EnvChargers_table::up::error:', error);
      return;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.changeColumn(
          'EnvChargers',
          'chgerType',
          { 
            type: Sequelize.STRING,
            allowNull: false,
            comment: '충전기타입',
          },
          { transaction: t }
        ); 

        await queryInterface.changeColumn(
          'EnvChargers',
          'busiId',
          { 
            type: Sequelize.ENUM,
            values: [
              'AM', 'BA', 'BE', 'BN', 'BT', 'CG', 'CP', 'CS',
              'CU', 'CV', 'DE', 'DG', 'DP', 'EC', 'EE', 'EK',
              'EL', 'EM', 'EN', 'EO', 'EP', 'ET', 'EV', 'G2',
              'GP', 'GR', 'GS', 'HD', 'HE', 'HM', 'HP', 'HW',
              'HY', 'IK', 'IM', 'IN', 'JC', 'JD', 'JJ', 'JT',
              'JU', 'KC', 'KE', 'KH', 'KL', 'KM', 'KO', 'KP',
              'KS', 'LC', 'LI', 'LU', 'ME', 'MO', 'MT', 'NB',
              'NE', 'NJ', 'NT', 'PI', 'PK', 'PL', 'PS', 'PW',
              'RE', 'SB', 'SC', 'SE', 'SF', 'SG', 'SJ', 'SK',
              'SM', 'SN', 'SS', 'TB', 'TD', 'TU', 'UN', 'US',
              'WB'
            ],
            comment: "기관아이디",
          },
          { transaction: t }
        );
      });
     
    } catch (error) { 
      console.log('20240109075955-update_EnvChargers_table::down::error:', error);
      return;
    }
  },
};
