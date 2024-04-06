const models = require('../models');
const sequelize = require('sequelize');

function getFormatDate(date) {
  var year = date.getFullYear();
  var month = 1 + date.getMonth();
  month = month >= 10 ? month : '0' + month; // 10이 넘지 않으면 앞에 0을 붙인다
  var day = date.getDate();
  day = day >= 10 ? day : '0' + day; // 10이 넘지 않으면 앞에 0을 붙인다
  var hours = date.getHours();
  hours = hours >= 10 ? hours : '0' + hours; // 10이 넘지 않으면 앞에 0을 붙인다
  var minutes = date.getMinutes();
  minutes = minutes >= 10 ? minutes : '0' + minutes; // 10이 넘지 않으면 앞에 0을 붙인다
  var seconds = date.getSeconds();
  seconds = seconds >= 10 ? seconds : '0' + seconds; // 10이 넘지 않으면 앞에 0을 붙인다

  // return year + '-' + month + '-' + day;
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} `;
}

function getFormatDateToMinutes(date) {
  var year = date.getFullYear();
  var month = 1 + date.getMonth();
  month = month >= 10 ? month : '0' + month; // 10이 넘지 않으면 앞에 0을 붙인다
  var day = date.getDate();
  day = day >= 10 ? day : '0' + day; // 10이 넘지 않으면 앞에 0을 붙인다
  var hours = date.getHours();
  hours = hours >= 10 ? hours : '0' + hours; // 10이 넘지 않으면 앞에 0을 붙인다
  var minutes = date.getMinutes();
  minutes = minutes >= 10 ? minutes : '0' + minutes; // 10이 넘지 않으면 앞에 0을 붙인다

  // return year + '-' + month + '-' + day;
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function getFormatDateToDays(date) {
  var year = date.getFullYear();
  var month = 1 + date.getMonth();
  month = month >= 10 ? month : '0' + month; // 10이 넘지 않으면 앞에 0을 붙인다
  var day = date.getDate();
  day = day >= 10 ? day : '0' + day; // 10이 넘지 않으면 앞에 0을 붙인다

  // return year + '-' + month + '-' + day;
  return `${year}-${month}-${day}`;
}

function getKoreanDate() {
  const curr = new Date();
  const utc = curr.getTime() + curr.getTimezoneOffset() * 60 * 1000;
  const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
  const kr_curr = new Date(utc + KR_TIME_DIFF);
  return kr_curr;
}

function priceToString(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function phoneFormatter(num) {
  var formatNum = '';
  try {
    if (num.length == 11) {
      formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (num.length == 8) {
      formatNum = num.replace(/(\d{4})(\d{4})/, '$1-$2');
    } else {
      if (num.indexOf('02') == 0) {
        formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
      } else {
        formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
      }
    }
  } catch (e) {
    formatNum = num;
  }
  return formatNum;
}

module.exports = { getFormatDate, getFormatDateToMinutes, getFormatDateToDays, getKoreanDate, priceToString, phoneFormatter };
