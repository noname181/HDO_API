/**
 * Created by Sarc bae on 2023-05-22.
 * 사용자 위치 기반 외부 API 충전소 클러스터링 API
 * TODO 추후 환경부 만이 아니라 다른 곳(HDO, 기타 외부 충전소 api) 포함하여 클러스터링 필요
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const Op = sequelize.Op;
var geocluster = require('geocluster');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/charging-stations-cluster'],
  method: 'post',
  checkToken: false, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

// 클러스터 좌표만 받은 상태로, 중심/클러스터 사이즈만 반환
async function service(_request, _response, next) {
  console.log('확인');
  const _standardArray = [
    [1.5, 5.0],
    [1.4, 5.5],
    [1.2, 6.0],
    [1.1, 6.5],
    [1.0, 7.0],
    [0.9, 7.5],
    [0.8, 8.0],
    [0.7, 8.5],
    [0.6, 9.0],
    [0.6, 9.5],
    [0.6, 10.0],
    [0.6, 10.5],
    [0.5, 11.0],
    [0.5, 11.5],
    [0.5, 12.0],
    [0.5, 12.5],
  ];

  const _processLog = [];

  const startTime = new Date();
  // let _id; // 이미 있는 bias에 대해 update용 id
  // let _responseCluster; // 생성 또는 갱신 될 cluser 정보

  // const userId = _request.user.id || _request.user.sub;
  // var bias = _request.query.bias ? _request.query.bias*1 : 10; // 클러스터용 편향수치. 낮을수록 더 많은 클러스터 multiply stdev with this factor, the smaller the more clusters
  // var zoomLv = _request.query.zoom ? _request.query.zoom*1 : 10; // 매핑될 줌 레벨

  // 페이징 정보
  const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 10000;

  // 정렬 정보
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'ASC').toUpperCase();

  // 위치 정보
  const coordinate = {
    latitude: _request.query.lat,
    longitude: _request.query.lng,
  };
  const radius = _request.query.rad;

  // Querying 옵션
  const option = {
    where: {},
    include: [
      // {model: models.UsersNew, as: 'createdBy', attributes: ['id', 'email', 'username', 'photoUrl']},
      // {model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'email', 'username', 'photoUrl']},
      // {model: models.EventEntry, as: 'entry', where: {userId: userId}, required: false},
    ],
    attributes: {
      include: [],
      exclude: [],
    },
    order: [['id', orderByQueryParam]],
    offset: pageNum * rowPerPage,
    limit: rowPerPage, //TODO 아래 Media모델 include와 충돌 임의로 위에 디폴트값으로 사용
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
  }

  try {
    for (let i of _standardArray) {
      const _startTime = new Date();

      const bias = i[0];
      const zoomLv = i[1];

      // 클러스터링 프로세스 시작
      // 충전소 목록 조회
      const { count: totalCount, rows: chargers } = await models.EnvChargeStation.findAndCountAll(option);

      // 좌표 매핑
      const coordinates = await chargers.map((item) => [item.coordinate.longitude, item.coordinate.latitude]);

      // 클러스터링 프로세스
      var clusterResult = geocluster(coordinates, bias);

      // 마커 이미지 사이즈용

      const sizes = clusterResult.map((obj) => obj.elements.length);
      const minValue = Math.min(...sizes);
      const maxValue = Math.max(...sizes);
      const stepSize = -0.01125 * zoomLv + 0.15625;
      const stepCount = 5;
      const _calibrationRatio = 0.75; // 세로 높이 보정값

      // 결과 매핑
      const clusterBody = clusterResult.map((obj) => {
        const { centroid, elements } = obj;

        let radius;
        if (elements.length === minValue) {
          radius = stepSize;
        } else if (elements.length === maxValue) {
          radius = stepSize * stepCount;
        } else {
          radius = (1 + Math.floor((4 * (elements.length - minValue)) / (maxValue - minValue))) * stepSize;
        }

        return {
          bias: bias,
          zoomLevel: zoomLv,
          center: {
            longitude: centroid[0],
            latitude: centroid[1],
          },
          point: [
            centroid[1] - (radius / 2) * _calibrationRatio,
            centroid[0] + radius / 2,
            centroid[1] + (radius / 2) * _calibrationRatio,
            centroid[0] - radius / 2,
          ],
          size: elements.length,
        };
      });
      // 클러스터링 프로세스 끝

      // 데이터 처리 프로세스 시작
      // 위 조건에 대한 기존 데이터 삭제
      await models.ChargingStationCluster.destroy({
        where: { zoomLevel: zoomLv },
      });

      //새로 데이터 저장
      const result = await models.ChargingStationCluster.bulkCreate(clusterBody);

      // !데이터 처리 프로세스 종료
      const _endTime = new Date();
      const _duration = calculateDuration(_startTime, _endTime);

      _processLog.push({
        zoomLv: zoomLv,
        bias: bias,
        clusterCount: clusterBody.length,
        duration: _duration + ' s',
      });
    }

    const endTime = new Date();
    const duration = calculateDuration(startTime, endTime);

    // 조회된 사용자 목록 응답
    await _response.json({
      totalDuration: duration + ' s',
      result: _processLog,
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

// 시간 계산
function calculateDuration(startTime, endTime) {
  const duration = endTime - startTime;
  return duration / 1000;
}
