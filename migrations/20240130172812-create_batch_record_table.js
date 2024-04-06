'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;

    // BatchRecords 테이블 생성
    await queryInterface.createTable('BatchRecords', {
      id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
      },
      env_chargers_stations_exec_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      env_chargers_stations_exec_cnt: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: null,
      },
      process_refund_exec_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      process_refund_exec_cnt: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: null,
      },
    }, {
      comment: 'records of batch jobs..',
      collate: 'utf8_general_ci',
      engine: 'InnoDB',
    });

    // BatchRecords에 기본값 추가 (데이터가 없을 경우에만)
    const hasData = await queryInterface.sequelize.query(
        'SELECT COUNT(*) AS count FROM BatchRecords'
    );
    if (hasData[0][0].count === 0) {
      await queryInterface.bulkInsert('BatchRecords', [{
        env_chargers_stations_exec_at: new Date(),
        env_chargers_stations_exec_cnt: 0,
        process_refund_exec_at: new Date(),
        process_refund_exec_cnt: 0,
      }]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('BatchRecords');
  }
};