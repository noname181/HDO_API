'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => {  
        await queryInterface.addColumn(
          'EnvChargeStations',
          'stat',
          {
            type: Sequelize.TINYINT,
            allowNull: false,
            comment: "충전기상태",
          },
          {
            transaction: t,
          }
        );   
        await queryInterface.addColumn(
          'EnvChargeStations',
          'output3',
          {
            type: Sequelize.BOOLEAN,
            values: [true, false], 
            defaultValue: false,
          },
          {
            transaction: t,
          }
        );  
        await queryInterface.addColumn(
          'EnvChargeStations',
          'output7',
          {
            type: Sequelize.BOOLEAN,
            values: [true, false], 
            defaultValue: false,
          },
          {
            transaction: t,
          }
        );   
        await queryInterface.addColumn(
          'EnvChargeStations',
          'output50',
          {
            type: Sequelize.BOOLEAN,
            values: [true, false], 
            defaultValue: false,
          },
          {
            transaction: t,
          }
        );   
        await queryInterface.addColumn(
          'EnvChargeStations',
          'output100',
          {
            type: Sequelize.BOOLEAN,
            values: [true, false], 
            defaultValue: false,
          },
          {
            transaction: t,
          }
        );   
        await queryInterface.addColumn(
          'EnvChargeStations',
          'output200',
          {
            type: Sequelize.BOOLEAN,
            values: [true, false], 
            defaultValue: false,
          },
          {
            transaction: t,
          }
        );   
        await queryInterface.addColumn(
          'EnvChargeStations',
          'chgerType1',
          {
            type: Sequelize.BOOLEAN,
            values: [true, false], 
            defaultValue: false,
          },
          {
            transaction: t,
          }
        );   
        await queryInterface.addColumn(
          'EnvChargeStations',
          'chgerType2',
          {
            type: Sequelize.BOOLEAN,
            values: [true, false], 
            defaultValue: false,
          },
          {
            transaction: t,
          }
        );   
        await queryInterface.addColumn(
          'EnvChargeStations',
          'chgerType3',
          {
            type: Sequelize.BOOLEAN,
            values: [true, false], 
            defaultValue: false,
          },
          {
            transaction: t,
          }
        );   
        await queryInterface.addColumn(
          'EnvChargeStations',
          'chgerType4',
          {
            type: Sequelize.BOOLEAN,
            values: [true, false], 
            defaultValue: false,
          },
          {
            transaction: t,
          }
        );   
        await queryInterface.addColumn(
          'EnvChargeStations',
          'chgerType5',
          {
            type: Sequelize.BOOLEAN,
            values: [true, false], 
            defaultValue: false,
          },
          {
            transaction: t,
          }
        );   
        await queryInterface.addColumn(
          'EnvChargeStations',
          'chgerType6',
          {
            type: Sequelize.BOOLEAN,
            values: [true, false], 
            defaultValue: false,
          },
          {
            transaction: t,
          }
        );   
        await queryInterface.addColumn(
          'EnvChargeStations',
          'chgerType7',
          {
            type: Sequelize.BOOLEAN,
            values: [true, false], 
            defaultValue: false,
          },
          {
            transaction: t,
          }
        );  
        await queryInterface.addIndex('EnvChargeStations', {
          fields: ['stat'],
          using: 'BTREE',
          transaction: t,
        });  
      });
    } catch (error) {
      console.log('20240112180114-update_EnvChargeStations_table::up::error:', error);
      return;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => { 
        
      });
     
    } catch (error) { 
      console.log('20240112180114-update_EnvChargeStations_table::down::error:', error);
      return;
    }
  },
};
