"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idGenerator = void 0;
const uuid_1 = require("uuid");
const idGenerator = () => {
    return (0, uuid_1.v4)();
};
exports.idGenerator = idGenerator;
