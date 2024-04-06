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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStationById = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const tokenService_1 = require("../../../util/tokenService");
const newRole_middleware_1 = require("../../../middleware/newRole.middleware");
const notFoundStation_exception_1 = require("../../../exceptions/notFound/notFoundStation.exception");
const models = require('../../../models');
exports.getStationById = {
    path: '/admin/stations/:id',
    method: 'get',
    checkToken: true,
    roles: [tokenService_1.USER_TYPE.EXTERNAL, tokenService_1.USER_TYPE.HDO, tokenService_1.USER_TYPE.MOBILE],
    logDisable: false,
    service: service,
};
function service(request, response) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { params, user: authUser } = request;
        const id = params.id ? Number(params.id) : 0;
        const nowHour = (0, moment_timezone_1.default)().tz('Asia/Seoul').hours();
        const station = yield models.sb_charging_station.findByPk(id, {
            include: [
                {
                    model: models.sb_charger,
                    as: 'chargers',
                    attributes: { exclude: ['createdWho', 'updatedWho'] },
                    include: [
                        {
                            model: models.sb_charger_state,
                            as: 'chargerStates',
                            attributes: {
                                exclude: ['createdWho', 'updatedWho', 'deletedAt'],
                            },
                            order: [['createdAt', 'DESC']],
                        },
                        {
                            model: models.ChargerModel,
                            as: 'chargerModel',
                            required: false,
                            attributes: {
                                exclude: ['deletedAt', 'createdWho', 'updatedWho'],
                            },
                        },
                        {
                            model: models.UnitPriceSet,
                            as: 'UnitPriceSet',
                            attributes: [[`unitPrice${nowHour + 1}`, 'unitPrice']],
                        },
                    ],
                },
                {
                    model: models.Org,
                    as: 'org',
                    attributes: [
                        'id',
                        'category',
                        'fullname',
                        'name',
                        'bizRegNo',
                        'address',
                        'contactName',
                        'contactPhoneNo',
                        'contactEmail',
                        'deductType',
                        'discountPrice',
                        'staticUnitPrice',
                        'payMethodId',
                        'isPayLater',
                        'isLocked',
                        'billingDate',
                        'closed',
                        'area',
                        'region',
                        'branch',
                        'haveCarWash',
                        'haveCVS',
                        'STN_STN_SEQ',
                        'STN_STN_ID',
                        'STN_STN_GUBUN',
                        'STN_CUST_NO',
                        'STN_ASSGN_AREA_GUBUN',
                        'STN_COST_CT',
                        'STN_PAL_CT',
                        'STN_STN_SHORT_NM',
                        'erp',
                        'createdAt',
                        'updatedAt',
                        [
                            models.sequelize.literal(`(SELECT descInfo FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1)`),
                            'branchName',
                        ],
                        [
                            models.sequelize.literal("(SELECT upperDivCode FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1)"),
                            'areaName',
                        ],
                    ],
                },
                { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
                { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
                { model: models.UsersNew, as: 'operatorManager', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
            ],
            attributes: {
                exclude: ['createdWho', 'updatedWho', 'deletedAt'],
            },
        });
        if (!station) {
            throw new notFoundStation_exception_1.NotFoundStationException();
        }
        const isFavorite = yield models.FavoriteChargerStation.findOne({
            where: {
                chargerId: station.chgs_id,
                userId: authUser.id,
            },
        });
        //Get minimum unit price
        let { chargers } = station;
        let unitPrice;
        if (chargers) {
            chargers = chargers.map((chg) => {
                var _a, _b;
                if (!chg.chg_unit_price) {
                    chg.chg_unit_price = (_b = (_a = chg.UnitPriceSet) === null || _a === void 0 ? void 0 : _a.dataValues) === null || _b === void 0 ? void 0 : _b.unitPrice;
                }
                return chg;
            });
            chargers.sort((a, b) => a.chg_unit_price - b.chg_unit_price);
            unitPrice = getUnitPrice(chargers);
        }
        let maxKw = 0;
        let pncAvailable = false;
        (_a = station.chargers) === null || _a === void 0 ? void 0 : _a.map((item) => {
            var _a, _b, _c, _d, _e, _f;
            if (((_b = (_a = item === null || item === void 0 ? void 0 : item.dataValues) === null || _a === void 0 ? void 0 : _a.chargerModel) === null || _b === void 0 ? void 0 : _b.maxKw) && ((_d = (_c = item === null || item === void 0 ? void 0 : item.dataValues) === null || _c === void 0 ? void 0 : _c.chargerModel) === null || _d === void 0 ? void 0 : _d.maxKw) > maxKw)
                maxKw = item.chargerModel.maxKw;
            if ((_f = (_e = item === null || item === void 0 ? void 0 : item.dataValues) === null || _e === void 0 ? void 0 : _e.chargerModel) === null || _f === void 0 ? void 0 : _f.pncAvailable)
                pncAvailable = true;
        });
        // const coordinate = station.org?.address ? await getGeoCodeFromAddress(station.org.address) : station.coordinate;
        const coordinate = station.coordinate;
        const result = {
            coordinate,
            chgs_id: station.chgs_id,
            chgs_station_id: station.chgs_station_id,
            status: station.status,
            chgs_name: station.chgs_name,
            chrgStartTime: station.chrgStartTime,
            chrgEndTime: station.chrgEndTime,
            washStartTime: station.washStartTime,
            washEndTime: station.washEndTime,
            chgs_kepco_meter_no: station.chgs_kepco_meter_no,
            isUse: station.isUse,
            chgs_car_wash_yn: station.chgs_car_wash_yn,
            chgs_aff_only: station.chgs_aff_only,
            chgs_field_desc: station.chgs_field_desc,
            area_code_id: station.area_code_id,
            createdAt: station.createdAt,
            updatedAt: station.updatedAt,
            orgId: station.orgId,
            chgs_operator_manager_id: station.chgs_operator_manager_id,
            chargers: station.chargers,
            org: station.org,
            createdBy: station.createdBy,
            updatedBy: station.updatedBy,
            operatorManager: station.operatorManager,
            isFavorite: isFavorite ? true : false,
            unitPrice: unitPrice,
            activeStationYN: station.activeStationYN,
            maxKw,
            pncAvailable,
            region: station.region,
        };
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.OK).json({ result });
    });
}
function getUnitPrice(chargers) {
    let unitPrice;
    for (const chg of chargers) {
        if (chg.chg_unit_price) {
            unitPrice = chg.chg_unit_price;
            break;
        }
    }
    return unitPrice;
}
