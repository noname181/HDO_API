'use strict';
const { HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const { Op, QueryTypes, Sequelize } = require('sequelize');
const models = require('../../models');
const moment = require('moment');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/payment/history/user/month/all'],
  method: 'get', 
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {  
  const category = _request.query.categoryName; 
  //const branchId = _request.query.branch; 
  const region = _request.query.region; 
  const startDate = moment().startOf('month').format('YYYY-MM-DD');
  // const endDate = moment().endOf('month').format('YYYY-MM-DD');
  const startDateMonthLastMonth = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
  const endDateMonthLastMonth = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
  // const today = moment().tz('Asia/Seoul').format('YYYY-MM-DD');
  // const yesterday = moment(today, 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD');
  const today0 = moment().tz('Asia/Seoul').format('YYYY-MM-DD');
  const endDate = moment(today0, 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD');
  const today = moment(today0, 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD');
  const yesterday = moment(today0, 'YYYY-MM-DD').subtract(2, 'days').format('YYYY-MM-DD');
  const currentMonth = moment().tz('Asia/Seoul').format('M'); // Months are 0-indexed in JavaScript
  const currentYear = moment().tz('Asia/Seoul').format('YYYY');
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  // console.log('startDate::::', startDate)
  // console.log('endDate::::', endDate)
  // console.log('startDateMonthLastMonth::::', startDateMonthLastMonth)
  // console.log('endDateMonthLastMonth::::', endDateMonthLastMonth)
  //  console.log('today::::', today)
  // console.log('yesterday::::', yesterday)
  // console.log('currentMonth::::', currentMonth)
  // console.log('currentYear::::', currentYear)
  // console.log('daysInMonth::::', daysInMonth)
  
  
    
    const join_area_branch = ` LEFT OUTER JOIN 
                                  sb_charging_stations AS cs ON cl.chgs_id = cs.chgs_id  
                               LEFT OUTER JOIN 
                                  Orgs AS org ON cs.orgId = org.id `;

    let filter_category = '';
    if(category){
      filter_category = ` AND org.category = '${category}' `;
    }
   

    //const filter_area_branch = ` AND org.branch = '${branchId}' `;

    const filter_region = ` AND org.region = '${region}' `;

    const join_area_branch2 = ` LEFT OUTER JOIN 
                                  sb_chargers AS c ON c.chg_id = pn.chg_id  
                               LEFT OUTER JOIN 
                                  sb_charging_stations AS cs ON c.chgs_id = cs.chgs_id  
                               LEFT OUTER JOIN 
                                  Orgs AS org ON cs.orgId = org.id `;

    const join_area_branch3 = ` LEFT OUTER JOIN 
                                  sb_chargers AS c ON c.chg_id = cst.chg_id 
                               LEFT OUTER JOIN 
                                  sb_charging_stations AS cs ON c.chgs_id = cs.chgs_id  
                               LEFT OUTER JOIN 
                                  Orgs AS org ON cs.orgId = org.id `;
 
                                  
    // const join_area_branch4 = ` LEFT OUTER JOIN 
    //                               Orgs AS org ON charger_records_tb.area_id = org.area AND charger_records_tb.branch_id = org.branch `;  

    const join_area_branch4 = ` LEFT OUTER JOIN Orgs AS org ON charger_records_tb.erp_id = org.erp `; 


    const join_area_branch5 = ` LEFT OUTER JOIN 
                                  sb_chargers AS c ON c.chg_id = cst.chg_id AND c.deletedAt IS NULL 
                               LEFT OUTER JOIN 
                                  sb_charging_stations AS cs ON c.chgs_id = cs.chgs_id AND cs.deletedAt IS NULL 
                               LEFT OUTER JOIN 
                                  Orgs AS org ON cs.orgId = org.id AND org.deletedAt IS NULL `;

    const calcTotalThisMonth = await models.sequelize.query(
      `
            SELECT SUM(AAA.daycharge_amount) AS totalKwh 
            FROM (
              SELECT 
                charger_records_tb.daycharge_amount  
              FROM 
                  charger_records_tb 
                  ${join_area_branch4} 
              WHERE  
                (DATE_FORMAT(charger_records_tb.data_day, '%Y%m%d') >= DATE_FORMAT('${startDate}', '%Y%m%d')
                AND DATE_FORMAT(charger_records_tb.data_day, '%Y%m%d') <= DATE_FORMAT('${endDate}', '%Y%m%d'))  
                ${filter_category} 
                ${region ? filter_region : ''} 
              GROUP BY charger_records_tb.id 
            ) AS AAA 
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

 //   console.log('calcTotalThisMonth:::::',calcTotalThisMonth); 


    const totalCountThisMonth = await models.sequelize.query(
      `
            SELECT SUM(AAA.transaction_count) AS totalCount 
            FROM (
              SELECT 
                charger_records_tb.transaction_count  
              FROM 
                  charger_records_tb 
                  ${join_area_branch4} 
              WHERE  
                (DATE_FORMAT(charger_records_tb.data_day, '%Y%m%d') >= DATE_FORMAT('${startDate}', '%Y%m%d')
                AND DATE_FORMAT(charger_records_tb.data_day, '%Y%m%d') <= DATE_FORMAT('${endDate}', '%Y%m%d'))  
                ${filter_category} 
                ${region ? filter_region : ''} 
              GROUP BY charger_records_tb.id 
            ) AS AAA 
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

 //   console.log('totalCountThisMonth:::::',totalCountThisMonth); 

    const calcTotalLastMonth = await models.sequelize.query(
      `
            SELECT SUM(AAA.daycharge_amount) AS totalKwh 
            FROM (
              SELECT 
                charger_records_tb.daycharge_amount  
              FROM 
                  charger_records_tb 
                  ${join_area_branch4} 
              WHERE  
                (DATE_FORMAT(charger_records_tb.data_day, '%Y%m%d') >= DATE_FORMAT('${startDateMonthLastMonth}', '%Y%m%d')
                AND DATE_FORMAT(charger_records_tb.data_day, '%Y%m%d') <= DATE_FORMAT('${endDateMonthLastMonth}', '%Y%m%d'))  
                ${filter_category} 
                ${region ? filter_region : ''} 
              GROUP BY charger_records_tb.id 
            ) AS AAA 
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

 //   console.log('calcTotalLastMonth:::::',calcTotalLastMonth); 


    const totalCountLastMonth = await models.sequelize.query(
      `
            SELECT SUM(AAA.transaction_count) AS totalCount 
            FROM (
              SELECT 
                charger_records_tb.transaction_count  
              FROM 
                  charger_records_tb 
                  ${join_area_branch4} 
              WHERE  
                (DATE_FORMAT(charger_records_tb.data_day, '%Y%m%d') >= DATE_FORMAT('${startDateMonthLastMonth}', '%Y%m%d')
                AND DATE_FORMAT(charger_records_tb.data_day, '%Y%m%d') <= DATE_FORMAT('${endDateMonthLastMonth}', '%Y%m%d'))  
                ${filter_category} 
                ${region ? filter_region : ''} 
              GROUP BY charger_records_tb.id 
            ) AS AAA 
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

 //   console.log('totalCountLastMonth:::::',totalCountLastMonth);
 

    const calcTotalToday = await models.sequelize.query(
      `
            SELECT SUM(AAA.daycharge_amount) AS totalKwh 
            FROM (
              SELECT 
                charger_records_tb.daycharge_amount  
              FROM 
                  charger_records_tb 
                  ${join_area_branch4} 
              WHERE  
                DATE_FORMAT(charger_records_tb.data_day, '%Y%m%d') = DATE_FORMAT('${today}', '%Y%m%d') 
                ${filter_category} 
                ${region ? filter_region : ''} 
              GROUP BY charger_records_tb.id 
            ) AS AAA 
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

 //   console.log('calcTotalToday:::::',calcTotalToday);
 

    const totalCountToday = await models.sequelize.query(
      `
            SELECT SUM(AAA.transaction_count) AS totalCount 
            FROM (
              SELECT 
                charger_records_tb.transaction_count  
              FROM 
                  charger_records_tb 
                  ${join_area_branch4} 
              WHERE  
                DATE_FORMAT(charger_records_tb.data_day, '%Y%m%d') = DATE_FORMAT('${today}', '%Y%m%d') 
                ${filter_category} 
                ${region ? filter_region : ''} 
              GROUP BY charger_records_tb.id 
            ) AS AAA 
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

 //   console.log('totalCountToday:::::',totalCountToday);
 

    const calcTotalYesterday = await models.sequelize.query(
      `
            SELECT SUM(AAA.daycharge_amount) AS totalKwh 
            FROM (
              SELECT 
                charger_records_tb.daycharge_amount  
              FROM 
                  charger_records_tb 
                  ${join_area_branch4} 
              WHERE  
                DATE_FORMAT(charger_records_tb.data_day, '%Y%m%d') = DATE_FORMAT('${yesterday}', '%Y%m%d') 
                ${filter_category} 
                ${region ? filter_region : ''} 
              GROUP BY charger_records_tb.id 
            ) AS AAA 
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

 //   console.log('calcTotalYesterday:::::',calcTotalYesterday);
 

    const totalCountYesterday = await models.sequelize.query(
      `
            SELECT SUM(AAA.transaction_count) AS totalCount 
            FROM (
              SELECT 
                charger_records_tb.transaction_count  
              FROM 
                  charger_records_tb 
                  ${join_area_branch4} 
              WHERE  
                DATE_FORMAT(charger_records_tb.data_day, '%Y%m%d') = DATE_FORMAT('${yesterday}', '%Y%m%d') 
                ${filter_category} 
                ${region ? filter_region : ''} 
              GROUP BY charger_records_tb.id 
            ) AS AAA 
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

 //   console.log('totalCountYesterday:::::',totalCountYesterday);
  
    const totalPaymentThisMonth = await models.sequelize.query(
        `
          SELECT SUM(AAA.sales_amount) AS totalPayment 
          FROM (
            SELECT 
              charger_records_tb.sales_amount 
            FROM 
                charger_records_tb 
                ${join_area_branch4} 
            WHERE 
              (DATE_FORMAT(charger_records_tb.data_day, '%Y%m%d') >= DATE_FORMAT('${startDate}', '%Y%m%d') 
              AND DATE_FORMAT(charger_records_tb.data_day, '%Y%m%d') <= DATE_FORMAT('${endDate}', '%Y%m%d')) 
              ${filter_category} 
              ${region ? filter_region : ''} 
            GROUP BY charger_records_tb.id 
          ) as AAA
        `,
        {
          type: Sequelize.QueryTypes.SELECT,
        }
      );

   //   console.log('totalPaymentThisMonth:::::',totalPaymentThisMonth); 

    const totalPaymentLastMonth = await models.sequelize.query(
      `
          SELECT SUM(AAA.sales_amount) AS totalPayment 
          FROM (
            SELECT 
              charger_records_tb.sales_amount 
            FROM 
                charger_records_tb 
                ${join_area_branch4} 
            WHERE 
              (DATE_FORMAT(charger_records_tb.data_day, '%Y%m%d') >= DATE_FORMAT('${startDateMonthLastMonth}', '%Y%m%d') 
              AND DATE_FORMAT(charger_records_tb.data_day, '%Y%m%d') <= DATE_FORMAT('${endDateMonthLastMonth}', '%Y%m%d')) 
              ${filter_category} 
              ${region ? filter_region : ''} 
            GROUP BY charger_records_tb.id 
          ) AS AAA 
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

 //   console.log('totalPaymentLastMonth:::::',totalPaymentLastMonth);
 

    const totalPaymentToday = await models.sequelize.query(
      `
        SELECT SUM(AAA.sales_amount) AS totalPayment 
        FROM (
          SELECT 
              charger_records_tb.sales_amount  
          FROM 
              charger_records_tb 
              ${join_area_branch4} 
          WHERE 
            DATE_FORMAT(charger_records_tb.data_day, '%Y%m%d') = DATE_FORMAT('${today}', '%Y%m%d') 
            ${filter_category} 
            ${region ? filter_region : ''} 
          GROUP BY charger_records_tb.id 
        ) AS AAA  
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

 //   console.log('totalPaymentToday:::::',totalPaymentToday);
 

    const totalPaymentYesterday = await models.sequelize.query(
      `
            SELECT SUM(AAA.sales_amount) AS totalPayment 
            FROM (
              SELECT 
                charger_records_tb.sales_amount  
              FROM 
                  charger_records_tb 
                  ${join_area_branch4} 
              WHERE 
                DATE_FORMAT(charger_records_tb.data_day, '%Y%m%d') = DATE_FORMAT('${yesterday}', '%Y%m%d') 
                ${filter_category} 
                ${region ? filter_region : ''} 
              GROUP BY charger_records_tb.id 
            ) AS AAA 
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

 //   console.log('totalPaymentYesterday:::::',totalPaymentYesterday);

    const increaseKwhThisMonth =
      calcTotalLastMonth[0]['totalKwh'] > 0 
        ? ((calcTotalThisMonth[0]['totalKwh'] - calcTotalLastMonth[0]['totalKwh'])/ calcTotalLastMonth[0]['totalKwh']) * 100 
        : calcTotalThisMonth[0]['totalKwh'];
    const increasePaymentThisMonth =
      totalPaymentLastMonth[0].totalPayment > 0 
        ? ((totalPaymentThisMonth[0].totalPayment - totalPaymentLastMonth[0].totalPayment)/ totalPaymentLastMonth[0].totalPayment) * 100 
        : totalPaymentThisMonth[0].totalPayment;
    const increaseKwhToday =
      calcTotalYesterday[0]['totalKwh'] > 0 
        ? ((calcTotalToday[0]['totalKwh'] - calcTotalYesterday[0]['totalKwh'])/ calcTotalYesterday[0]['totalKwh']) * 100 
        : calcTotalToday[0]['totalKwh'];
    const increasePaymentToday =
      totalPaymentYesterday[0].totalPayment > 0 ? ((totalPaymentToday[0].totalPayment - totalPaymentYesterday[0].totalPayment)/ totalPaymentYesterday[0].totalPayment) * 100 : totalPaymentToday[0].totalPayment;

   

    const totalAmountKwhAllStationsToday = await models.sequelize.query(
      `
      SELECT AAA.station_id, AAA.station_name AS chgs_name, SUM(AAA.transaction_count) AS totalCount, ROUND(SUM((COALESCE(AAA.daycharge_amount, 0))/1000),2) AS totalAmountKwh
      FROM (
          SELECT 
          charger_records_tb.station_id, 
          charger_records_tb.station_name,
          charger_records_tb.transaction_count,
          charger_records_tb.daycharge_amount
            FROM 
            charger_records_tb 
            ${join_area_branch4}
            WHERE DATE(charger_records_tb.data_day) = DATE(CURDATE() - INTERVAL 1 DAY) 
            ${filter_category} 
            ${region ? filter_region : ''}
            GROUP BY charger_records_tb.id 
        ) AS AAA
        GROUP BY
        AAA.station_id
        ORDER BY
        totalAmountKwh DESC
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );
 
    const totalAmountKwhAllStationsThisMonth = await models.sequelize.query(
      `
        SELECT AAA.station_id, AAA.station_name AS chgs_name, SUM(AAA.transaction_count) AS totalCount, ROUND(SUM((COALESCE(AAA.daycharge_amount, 0))/1000),2) AS totalAmountKwh
        FROM (
            SELECT 
            charger_records_tb.station_id, 
            charger_records_tb.station_name,
            charger_records_tb.transaction_count,
            charger_records_tb.daycharge_amount
            FROM 
            charger_records_tb 
            ${join_area_branch4}
            WHERE 
            MONTH(charger_records_tb.data_day) = MONTH(NOW())
            AND YEAR(charger_records_tb.data_day) = YEAR(NOW()) 
            ${filter_category} 
            ${region ? filter_region : ''}
            GROUP BY charger_records_tb.id 
        ) AS AAA
        GROUP BY
        AAA.station_id
        ORDER BY
        totalAmountKwh DESC
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

 //   console.log('totalAmountKwhAllStationsThisMonth::::::', totalAmountKwhAllStationsThisMonth)
    
    const totalKwhAllDayThisMonth = []; 
   
    
    const totalKwhPerDay = await models.sequelize.query(
      `
        SELECT DATE(AAA.data_day) AS day, ROUND((SUM(COALESCE(AAA.daycharge_amount, 0) - COALESCE(AAA.dayignore_amount, 0)))/1000,2) AS total_kwh
        FROM(
            SELECT charger_records_tb.data_day, charger_records_tb.daycharge_amount, charger_records_tb.dayignore_amount
            FROM 
            charger_records_tb 
            ${join_area_branch4} 
            WHERE 
            MONTH(charger_records_tb.data_day) = MONTH(CURDATE()) 
              AND YEAR(charger_records_tb.data_day) = YEAR(CURDATE()) 
              ${filter_category} 
              ${region ? filter_region : ''} 
            GROUP BY charger_records_tb.id 
        ) AS AAA
        GROUP BY DAY(AAA.data_day) 
        ORDER BY day
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

 //   console.log('totalKwhPerDay:::::',totalKwhPerDay)

    const totalKwhPerDayMap = new Map();
    for (const item of totalKwhPerDay) {
      totalKwhPerDayMap.set(item.day, item.total_kwh);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const perDay = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const total_kwh = totalKwhPerDayMap.get(perDay) || 0;
      totalKwhAllDayThisMonth.push({
        day: perDay,
        total_kwh,
      });
    }

    const totalKwhAllMonthThisYear = []; 
   
    const totalKwhPerMonth = await models.sequelize.query(
      `
        SELECT MONTH(AAA.data_day) AS month, ROUND((SUM(COALESCE(AAA.daycharge_amount, 0) - COALESCE(AAA.dayignore_amount, 0)))/1000,2) AS total_kwh
        FROM(
            SELECT charger_records_tb.data_day, charger_records_tb.daycharge_amount, charger_records_tb.dayignore_amount
            FROM 
            charger_records_tb 
            ${join_area_branch4} 
          WHERE 
            YEAR(charger_records_tb.data_day) = YEAR(CURDATE()) 
            ${filter_category} 
            ${region ? filter_region : ''} 
            GROUP BY charger_records_tb.id 
        ) AS AAA
        GROUP BY MONTH(AAA.data_day), YEAR(AAA.data_day)
        ORDER BY month
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

 //   console.log('totalKwhPerMonth:::::',totalKwhPerMonth);

    const totalKwhPerMonthMap = new Map();
    for (const item of totalKwhPerMonth) {
      totalKwhPerMonthMap.set(item.month, item.total_kwh);
    }

    for (let month = 1; month <= 12; month++) {
      const total_kwh = totalKwhPerMonthMap.get(month) || 0;
      totalKwhAllMonthThisYear.push({
        month,
        total_kwh,
      });
    }

    const totalPaymentAllDayThisMonth = [];
 

    const totalPaymentPerDay = await models.sequelize.query(
      `
        SELECT DATE(AAA.data_day) AS day, ROUND((SUM(COALESCE(AAA.sales_amount, 0))),2) AS totalPayment
        FROM(
            SELECT charger_records_tb.data_day, charger_records_tb.sales_amount 
            FROM 
            charger_records_tb 
            ${join_area_branch4} 
            WHERE 
            MONTH(charger_records_tb.data_day) = MONTH(CURDATE()) 
              AND YEAR(charger_records_tb.data_day) = YEAR(CURDATE()) 
              ${filter_category} 
              ${region ? filter_region : ''} 
            GROUP BY charger_records_tb.id 
        ) AS AAA
        GROUP BY DAY(AAA.data_day) 
        ORDER BY day
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    

    const totalPaymentPerDayMap = new Map();
    for (const item of totalPaymentPerDay) {
      totalPaymentPerDayMap.set(item.day, item.totalPayment);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const perDay = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const totalPayment = totalPaymentPerDayMap.get(perDay) || 0;
      totalPaymentAllDayThisMonth.push({
        day: perDay,
        totalPayment,
      });
    }

    const totalPaymentAllMonthThisYear = []; 

    const totalPaymentPerMonth = await models.sequelize.query(
      `
        SELECT MONTH(AAA.data_day) AS month, ROUND((SUM(COALESCE(AAA.sales_amount, 0))),2) AS totalPayment
        FROM(
            SELECT charger_records_tb.data_day, charger_records_tb.sales_amount 
            FROM 
            charger_records_tb 
            ${join_area_branch4} 
          WHERE 
            YEAR(charger_records_tb.data_day) = YEAR(CURDATE()) 
            ${filter_category} 
            ${region ? filter_region : ''} 
            GROUP BY charger_records_tb.id 
        ) AS AAA
        GROUP BY MONTH(AAA.data_day), YEAR(AAA.data_day)
        ORDER BY month
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const totalPaymentPerMonthMap = new Map();
    for (const item of totalPaymentPerMonth) {
      totalPaymentPerMonthMap.set(item.month, item.totalPayment);
    }

    for (let month = 1; month <= 12; month++) {
      const totalPayment = totalPaymentPerMonthMap.get(month) || 0;
      totalPaymentAllMonthThisYear.push({
        month,
        totalPayment,
      });
    }


    const totalAllState = await models.sequelize.query(
      `
      SELECT 
        COUNT(*) AS cnt 
      FROM 
        sb_charger_states AS cst 
        ${join_area_branch5} 
      WHERE  
          cst.deletedAt IS NULL 
          ${filter_category} 
          ${region ? filter_region : ''}  
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    ); 

    const totalAllStateReadyAvailable = await models.sequelize.query(
      `
      SELECT 
        COUNT(*) AS cnt 
      FROM 
        sb_charger_states AS cst 
        ${join_area_branch5} 
      WHERE  
          cst.deletedAt IS NULL 
          AND cst.cs_charging_state IN ('ready', 'available') 
          ${filter_category} 
          ${region ? filter_region : ''}  
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    ); 
 

    const totalAllStateChargingFinishing = await models.sequelize.query(
      `
      SELECT 
        COUNT(*) AS cnt 
      FROM 
        sb_charger_states AS cst 
        ${join_area_branch5} 
      WHERE  
          cst.deletedAt IS NULL 
          AND cst.cs_charging_state IN ('charging', 'finishing') 
          ${filter_category} 
          ${region ? filter_region : ''}  
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );
  

    const totalAllStateOffline = await models.sequelize.query(
      `
      SELECT 
        COUNT(*) AS cnt 
      FROM 
        sb_charger_states AS cst 
        ${join_area_branch5} 
      WHERE  
          cst.deletedAt IS NULL 
          AND (cst.cs_charging_state = 'offline' OR cst.cs_charging_state IS NULL) 
          ${filter_category} 
          ${region ? filter_region : ''}  
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );  

    return _response.status(HTTP_STATUS_CODE.OK).json({
      totalPaymentThisMonth: totalPaymentThisMonth[0].totalPayment || 0,
      totalKwhThisMonth: parseFloat((calcTotalThisMonth[0]['totalKwh'] / 1000).toFixed(2)) || 0,
      totalCountThisMonth: totalCountThisMonth[0]['totalCount'] || 0,
      totalPaymentLastMonth: totalPaymentLastMonth[0].totalPayment || 0,
      totalKwhLastMonth: parseFloat((calcTotalLastMonth[0]['totalKwh'] / 1000).toFixed(2)) || 0,
      totalCountLastMonth: totalCountLastMonth[0]['totalCount'] || 0,
      totalPaymentToday: totalPaymentToday[0].totalPayment || 0,
      totalKwhToday: parseFloat((calcTotalToday[0]['totalKwh'] / 1000).toFixed(2)) || 0,
      totalCountToday: totalCountToday[0]['totalCount'] || 0,
      totalPaymentYesterday: totalPaymentYesterday[0].totalPayment || 0,
      totalKwhYesterday: parseFloat((calcTotalYesterday[0]['totalKwh'] / 1000).toFixed(2)) || 0,
      totalCountYesterday: totalCountYesterday[0]['totalCount'] || 0,
      increaseKwhThisMonth: formatPercent(increaseKwhThisMonth) || 0,
      increasePaymentThisMonth: formatPercent(increasePaymentThisMonth) || 0,
      increaseKwhToday: formatPercent(increaseKwhToday) || 0,
      increasePaymentToday: formatPercent(increasePaymentToday) || 0,
      totalAmountKwhAllStationsToday: totalAmountKwhAllStationsToday || [],
      totalAmountKwhAllStationsThisMonth: totalAmountKwhAllStationsThisMonth || [],
      totalPaymentAllDayThisMonth,
      totalPaymentAllMonthThisYear,
      totalKwhAllDayThisMonth,
      totalKwhAllMonthThisYear,
      totalAllState: totalAllState[0]['cnt'] || 0,
      totalAllStateReadyAvailable: totalAllStateReadyAvailable[0]['cnt'] || 0,
      totalAllStateChargingFinishing: totalAllStateChargingFinishing[0]['cnt'] || 0,
      totalAllStateOffline: totalAllStateOffline[0]['cnt'] || 0,
      startDate,
      endDate,
      startDateMonthLastMonth,
      endDateMonthLastMonth,
      oneDayAgo: today,
      twoDayAgo: yesterday,
      currentMonth,
      currentYear,
    });
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  _response.error.unknown(_error.toString());
  next(_error);
}

function formatPercent(num) {
  if (!num) {
    return 0;
  }
  return num.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).replace('.0', '');
}
