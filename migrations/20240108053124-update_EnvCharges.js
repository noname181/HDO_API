'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.changeColumn(
          'EnvChargers',
          'stat',
          { 
            type: Sequelize.TINYINT,
            allowNull: false,
            comment: "충전기상태",
          },
          { transaction: t }
        );

        await queryInterface.changeColumn(
          'EnvChargers',
          'output',
          { 
            type: Sequelize.ENUM,
            values: ['3','7','50','100','200'],
            comment: "충전용량kW",
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

        await queryInterface.addIndex('EnvChargers', {
          fields: ['stat'],
          using: 'BTREE',
          transaction: t,
        }); 

        await queryInterface.addIndex('EnvChargers', {
          fields: ['output'],
          using: 'BTREE',
          transaction: t,
        });

        await queryInterface.addIndex('EnvChargers', {
          fields: ['busiId'],
          using: 'BTREE',
          transaction: t,
        });
      });
    } catch (error) {
      console.log('20240108053124-update_EnvCharges ::up::error:', error);
      return;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.changeColumn(
          'EnvChargers',
          'stat',
          {
            type: Sequelize.STRING,
            allowNull: false,
            comment: "충전기상태",
          },
          {
            transaction: t,
          }
        ); 

        await queryInterface.changeColumn(
          'EnvChargers',
          'output',
          {
            type: Sequelize.STRING,
            comment: "충전용량kW",
          },
          {
            transaction: t,
          }
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
      });
     
    } catch (error) { 
      console.log('20240108053124-update_EnvCharges::down::error:', error);
      return;
    }
  },
};
