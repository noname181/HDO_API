/**
 * Created by SeJin Kim on 2023-08-31
 * OCPP -> Re   quest -> BE
 * 충전기 alias (MAC Adress) 값으로 id 값 조회
 * Query id value with charger alias (MAC Address) value
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { configuration } = require('../../config/config');
const sequelize = require('sequelize');
const { getKoreanDate } = require('../../util/common-util');
const DEEPLINK_URL = configuration()?.deeplinkUrl;

module.exports = {
  path: ['/charger-info-id'],
  method: 'post',
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

const API_URL = configuration()?.apiServerUrl;

//FIXME 데이터 가져오는 프로세스 수정 필요
async function service(_request, _response, next) {
  const chg_alias = _request.body?.chg_alias; // [Table] sb-chargers : [Column] chg_alias
  /*

    */
  // 제대로된 결과를 찾아내든 못찾아내든 빈값이라도 응답은 해줘야 한다.
  let res = null
  try {
    // 신규로직 (11.09)
    const charger = await models.sb_charger.findOne({
      where: {
        chg_alias: chg_alias
      },
      attributes: {
        exclude: ['deletedAt'],
      },
    })

    const DIV_CODE_DEPOSIT = 'PARK_DEPOSIT';
    const DIV_CODE_MEMBER_DISC = 'MEMBER_DISC';
    const DIV_CODE_DEFAULT_UNITPRICE = 'DEFAULT_UNITPRICE';
    const DIV_CODE_CORP_DISC = 'CORP_DISC'

    const [depositRow, memberDiscRow, corpDiscRow, defaultPriceRow] = await Promise.all([
      models.Config.findOne({
        where: {
          divCode: DIV_CODE_DEPOSIT,
        },
      }),
      models.Config.findOne({
        where: {
          divCode: DIV_CODE_MEMBER_DISC,
        },
      }),
      models.Config.findOne({
        where: {
          divCode: DIV_CODE_CORP_DISC,
        },
      }),
      models.Config.findOne({
        where: {
          divCode: DIV_CODE_DEFAULT_UNITPRICE,
        },
      }),
    ]);
    const depositVal = parseInt(depositRow?.cfgVal);
    const memberDiscVal = parseInt(memberDiscRow?.cfgVal);
    const corpDiscVal = parseInt(corpDiscRow?.cfgVal);
    const defaultPrice = parseInt(defaultPriceRow?.cfgVal);
    let unitPrice = defaultPrice;

    if ( charger ) {
      // 충전기를 찾았을때 로직
      // 기본단가 결정
      if (charger?.usePreset === 'N') {
        // 단가 프리셋을 사용하지 않는 경우
        if (charger?.chg_unit_price) {
          // 단가 프리셋을 사용하지 않는데 고정단가가 설정된 경우
          unitPrice = charger?.chg_unit_price
        }
      } else if (charger?.usePreset === 'Y') {
        // 단가 프리셋을 사용하는 경우
        const upSetId = parseInt(charger?.upSetId) || 0;
        if (upSetId !== 0) {
          // 단가 프리셋 옵션이 켜져있고, 실제로 단가프리셋 지정도 되어 있는 경우
          const priceSet = await models.UnitPriceSet.findOne({
            where: {
              id: upSetId,
            },
          });
          if (priceSet) {
            // 실제로 단가 프리셋을 찾은 경우
            const currentHours = moment().tz('Asia/Seoul').hours() + 1;
            unitPrice = priceSet[`unitPrice${currentHours}`]
          }
        }
      }


      // https://evnoilbank.page.link/?link=https://evnoilbank.page.lik?params={}&apn=com.hdoilbank.evnu.dev
      // 562, 484
      // https://evnoilbank.page.link/?link=https://evnoilbank.page.lik?params={}&apn=com.hdoilbank.evnu.dev
      const deeplink = DEEPLINK_URL.replace(
          /params={}*/g,
          encodeURIComponent(`chg_id=${charger.chg_id}&chgs_id=${charger.chgs_id}`)
      );

      const meterInterval = await models.Config.findOne({
        where: {
          divCode: 'METER_INTERVAL',
        },
        attributes: ['cfgVal'],
      });

      const soc = await models.Config.findOne({
        where: {
          divCode: 'DEFAULT_MAX_SOC',
        },
        attributes: ['cfgVal'],
      });

      // 현재 그냥 가장 최신버전의 약관만 내리게 되어 있음.
      // 파일업로드 경로 이거 맞는지 점검 필요함.
      const terms_url = await models.sequelize.query(`
        SELECT fileURL
        FROM FileToChargers
        WHERE newestVersion = 1
        AND division = 'TM'
        AND deletedAt is null
        limit 1
      `,
          {
            type: sequelize.QueryTypes.SELECT,
            raw: true,
          }
      )

      // let termsUrl = 'http://49.50.166.94/uploads/policy.txt'
      let termsUrl = 'https://api-evnu.oilbank.co.kr/download-file/upload/policy.txt'
      const serverUrl = process.env.API_SERVER_URL || 'https://api-evnu.oilbank.co.kr'
      if (terms_url.length > 0) {
        termsUrl = `${serverUrl}/download-file/${terms_url[0]?.fileURL}`
      }

      charger.lastConfigAppliedAt = new Date()
      await charger.save()

      res = {
        chg_id: charger.chg_id,
        chg_charger_id: charger?.chg_charger_id,
        chg_channel: charger?.chg_channel,
        deposit: depositVal,
        nonmember_price: unitPrice ?? 500,
        member_price: unitPrice - memberDiscVal ?? 450,
        corp_price: unitPrice - corpDiscVal ?? 400,
        // terms_url: charger.termsURL,
        terms_url: termsUrl,
        qrcode_url: deeplink.toString(),
        soc: soc?.cfgVal ?? 80,
        meter_interval: meterInterval?.cfgVal ?? 30
      };
    }
  } catch (e) {
    // next(e);
    // 에러가 났다고 응답을 안하거나 작동을 멈추면 안된다.
    console.log(e?.stack)
  } finally {
    console.log('res', res);
    if (!res) {
      _response.json({});
    } else {
      _response.json({ result: res });
    }
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  _response.error.unknown(_error.toString());
  next(_error);
}
