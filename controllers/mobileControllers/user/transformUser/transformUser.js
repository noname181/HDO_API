"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformUser = void 0;
// TODO should define data type for query from sequelize
const _ = require('lodash');
const transformUser = ({ fields = [], user = {} }) => {
    return _.pick(user, fields);
};
exports.transformUser = transformUser;
