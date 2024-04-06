const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class temp_easy_log extends Model {}

  temp_easy_log.init(
      {
        id: {
          type: DataTypes.BIGINT(20),
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
          comment: 'id',
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null,
          comment: 'content',
        },
      },
      {
        sequelize,
        modelName: 'temp_easy_log',
        tableName: 'temp_easy_logs',
        timestamps: true,
        collate: 'utf8_general_ci',
        engine: 'InnoDB',
        comment: 'easy log..',
      }
  );

  return temp_easy_log;
};