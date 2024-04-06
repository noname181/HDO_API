// TODO should define data type for query from sequelize
const _ = require('lodash');

export const transformUser = ({ fields = [], user = {} }) => {
  return _.pick(user, fields);
};
