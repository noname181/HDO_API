'use strict';

const { readFile } = require('fs/promises');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    const data = await readFile(__dirname + '/initial.sql', { encoding: 'utf-8' });
    const tables = data.split(';');
    for await (const table of tables) {
      await queryInterface.sequelize.query(table);
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return await queryInterface.showAllTables().success(function (tableNames) {
      // Dont drop the SequelizeMeta table
      var tables = tableNames.filter(function (name) {
        return name.toLowerCase() !== 'sequelizemeta';
      });

      function dropTable(tableName, cb) {
        migration.dropTable(tableName);
        cb();
      }

      async.each(tables, dropTable, done);
    });
  },
};
