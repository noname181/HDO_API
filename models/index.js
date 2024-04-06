'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);

const config = require('../config/sequelize');
const env = process.env.NODE_ENV || 'dev';

const db = {};

const blackList = ['all_logs'];

let sequelize;
sequelize = new Sequelize(config[env].database, config[env].username, config[env].password, config[env]);

const AllLogs = require('./allLogs')(sequelize, Sequelize.DataTypes);

db.AllLogs = AllLogs;

fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js' && file.indexOf('.test.js') === -1;
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db)
  .filter((item) => !blackList.includes(item))
  .forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
