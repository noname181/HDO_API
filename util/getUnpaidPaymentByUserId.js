"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnpaidPaymentByUserId = void 0;
const sequelize_1 = require("sequelize");
const getUnpaidPaymentByUserId = (id, models) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = isNaN(parseInt(id)) ? 0 : parseInt(id);
    const unpaidClog = yield models.sb_charging_log.findOne({
        where: {
            usersNewId: userId,
            payCompletedYn: 'N',
            cl_unplug_datetime: { [sequelize_1.Op.ne]: null },
        },
        order: [['cl_id', 'DESC']],
    });
    return unpaidClog;
});
exports.getUnpaidPaymentByUserId = getUnpaidPaymentByUserId;
