/**
 * Created by Sarc bae on 2023-07-05.
 * 충전소 조회 API - 지도조회용 테스트
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/charge-stations-test'],
  method: 'get',
  checkToken: false, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

// 그냥 쿼리에 따른 조회조건(radius 포함)
async function service(_request, _response, next) {
  // const userId = _request.user.id || _request.user.sub;
  // 페이징 정보
  const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 1000;

  // 정렬 정보
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();

  // 위치 정보
  const coordinate = {
    latitude: _request.query.lat,
    longitude: _request.query.lng,
  };
  const radius = _request.query.rad;

  // Querying 옵션
  const option = {
    // where: {isUse: true},
    include: [
      // {model: models.UsersNew, as: 'createdBy', attributes: ['id', 'email', 'username', 'photoUrl']},
      // {model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'email', 'username', 'photoUrl']},
      // {model: models.EventEntry, as: 'entry', where: {userId: userId}, required: false},
      // {model: models.sb_charger, as: 'chargers', required: false,
      // 	attributes: {
      // 		exclude: ['chgs_id', 'chg_alias', 'chg_sn', 'chg_fw_ver', 'chg_cell_number', 'qrTransDate', 'adVersion', 'termsVersion', 'createdAt', 'updatedAt', 'deletedAt', 'createdWho', 'updatedWho']
      // 	},
      // 	include: [
      // 		{model: models.ChargerModel, as: 'chargerModel', required: false,
      // 			attributes: {
      // 				exclude: ['createdAt', 'updatedAt', 'deletedAt', 'createdWho', 'updatedWho']
      // 			}
      // 		},
      //
      // 	]
      // },
      // {model: models.Org, as: 'org', attributes: {exclude: ['createdWho', 'updatedWho', 'deletedAt']}},
    ],
    attributes: {
      include: ['id', 'statNm', 'addr', 'coordinate'],
      exclude: [
        'statId',
        'chgerType',
        'lat',
        'lng',
        'maxOutput',
        'method',
        'parkingFree',
        'limitYn',
        'limitDetail',
        'note',
        'createdAt',
        'updatedAt',
        'busiId',
        'bnm',
      ],
    },
    order: [['createdAt', orderByQueryParam]],
    offset: pageNum * rowPerPage,
    limit: rowPerPage,
  };

  // 호출한 사용자의 token에서 발췌한 userId가 있다면 해당 사용자에 관련된 정보가 담겨 내려오도록 모델 추가. - 필요시 즐겨찾기 용으로 사용 가능
  // if (userId) {
  // 	option.include.push({model: models.Like, as: 'isLiked', where: {createdWho: userId}, required: false}); // 호출한 사용자가 좋아요를 한 이벤트인지
  // }

  // 위치정보 기준 조회용 Query 옵션 설정
  if (coordinate.latitude && coordinate.longitude) {
    const coordinates = models.sequelize.literal(
      `ST_GeomFromText('POINT(${coordinate.longitude} ${coordinate.latitude})')`
    ); // ※순서주의 longitude latitude 순서임
    const distance = models.sequelize.fn('ST_Distance_Sphere', models.sequelize.literal('coordinate'), coordinates);
    const roundDistance = models.sequelize.fn('Round', distance, 0); // 소수점 0자리로 distance Select Query
    option.attributes.include.push([roundDistance, 'distance']);
    option.order = [[models.sequelize.col('distance'), 'ASC']]; // 정렬을 distance값으로 되도록 수정

    // 반경이 있으면 반경안에 있는 이벤트 좌표만 조회되도록 where조건 변경
    if (radius) {
      option.where = {
        [Op.and]: [
          models.sequelize.literal(
            `Round(ST_Distance_Sphere(coordinate, ST_GeomFromText('POINT(${coordinate.longitude} ${coordinate.latitude})')), 0) <= ${radius}`
          ),
        ],
      };
    }
  } else {
    // lat, lng 쿼리가 안들어오더라도 일정한 타입의 결과를 반환하기 위한 조치
    // option.attributes.include.push([models.sequelize.literal(0), 'distance']);
  }

  try {
    // 위 조건에 대한 사용자 목록 조회(권한 및 사용자 그룹 포함)
    // const {count: totalCount, rows: chargers} = await models.EnvChargeStation.findAndCountAll(option);
    const { count: totalCount, rows: chargerStations } = await models.EnvChargeStation.findAndCountAll(option);

    _response.json({
      status: '200',
      // totalCount: totalCount,
      result: chargerStations,
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
