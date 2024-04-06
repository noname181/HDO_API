const Sequelize = require('sequelize');
const models = require('../../../models');
const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const express = require('express');
const axios = require('axios');
const https = require('https');

const getCallCdrs = {
  path: '/web/cs-callLogData',
  method: 'get',
  checkToken: false,
  // roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  // permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];
  const apiUrl = `https://ktapi-evnu.oilbank.co.kr:8100/api/v1/cdr-stat?tenants_id=1&start_date=${dateString}`;
  console.log(apiUrl);
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });
  let callCountData;
  try {
    console.log('확인2');
    const getCallLogKtData = await axios
      .get(apiUrl, {
        httpsAgent: agent,
      })
      .then((response) => {
        console.log(response.data.item[0]);
        callCountData = response.data.item[0];
      })
      .catch((error) => {
        console.log(error);
        throw new Error(`HTTP error! status: ${getCallLogKtData.status}`);
      });

    const gridCSLogData = await models.sequelize.query(
      `
        SELECT
        MAX(logData.id) AS id,
        logData.agentId,
        logData.extensionNumber,
        userData.name,
        nowState.csState,
        SUM(CASE WHEN logData.csEvent = 'Bridge' THEN 1 ELSE 0 END) AS BridgeCount,
        COALESCE(messageData.messageCount, 0) AS messageCount,
        COALESCE(refundData.refundCount, 0 ) AS refundCount,
        COALESCE(refundData.totalCancelAmount, 0)AS refundAmount,
        DATE(logData.createdAt) AS logDate
      FROM 
        CsCallLogs AS logData
      LEFT OUTER JOIN ( SELECT id, csState FROM CsCallLogs ) AS nowState ON ( logData.id = nowState.id )
      LEFT OUTER JOIN ( SELECT id, NAME FROM UsersNews ) AS userData ON ( logData.agentId = userData.id )
      LEFT OUTER JOIN ( 
          SELECT COUNT(*) AS messageCount, csId, DATE(createdAt) AS createdAt
          FROM messageLog 
          GROUP BY csId,DATE(createdAt)
      ) AS messageData ON (logData.agentId = messageData.csId && DATE(logData.createdAt) = DATE(messageData.createdAt))
      LEFT OUTER JOIN ( SELECT
              userId AS userId,
              DATE(createdAt) AS date,
              SUM(cancelAmount) AS totalCancelAmount,
              COUNT(userId) AS refundCount
              FROM RequestRefunds
              GROUP BY DATE(createdAt), userId ) 
                AS refundData ON (logData.agentId = refundData.userId && DATE(logData.createdAt) = DATE(refundData.date))
      WHERE DATE(logData.createdAt) = DATE(:dateString)
      GROUP BY 
        logData.agentId,
        DATE(logData.createdAt)
        `,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { dateString: dateString },
        nest: true,
      }
    );

    // JSON 형태로 결과 반환
    response.status(HTTP_STATUS_CODE.OK).json({
      callCountData,
      gridCSLogData,
    });
  } catch (error) {
    response.status(500).json({ error: error.toString() });
  }
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  next();
}

module.exports = { getCallCdrs };
