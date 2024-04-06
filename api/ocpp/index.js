const createAuthPnc = require("./create-auth-pnc")
const createChgPayInfo = require("./create-chg-pay-info")
const readAuthPnc = require("./read-auth-pnc")
const readChargerInfoIdByAlias = require("./read-charger-info-id-by-alias")
const readMembership = require("./read-membership")
const readUnitPrice = require("./read-unit-price")
const updateAdDownloadCompleteReport = require("./update-ad-download-complete-report")
const updateAllOffline = require("./update-all-offline")
const updateChargingMemberPhone = require("./create-charging_member_phone")
const updateChargingTargetSoc = require("./update-charging-target-soc")

/*
    API Document received from OCPP Developer
    https://docs.google.com/spreadsheets/d/16I4g5vcfcEe7e5FknvQzrepCcUaECyD1Y8pdJFj_rSo/edit#gid=1047457327
*/
module.exports = {
    createAuthPnc,
    createChgPayInfo,
    readAuthPnc,
    readChargerInfoIdByAlias,
    readMembership,
    readUnitPrice,
    updateAdDownloadCompleteReport,
    updateAllOffline,
    updateChargingMemberPhone,
    updateChargingTargetSoc
};
