const models = require('../../models');
var geocluster = require('geocluster');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const lat = 37.7749; // 예시 중심 위도
const lng = -122.4194; // 예시 중심 경도
const radius = 10000; // 10km 반경

async function createStationLocationCluster() {
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
  const startTime = new Date();

  try {
    const _selectStartTime = new Date();

    // 충전소 목록 조회
    // const chargers = await models.EnvChargeStation.findAll({
    //   attributes: ['coordinate'],
    //   limit: 100,
    // });

    const chargers = await models.EnvChargeStation.findAll({
      attributes: {
        include: [
          [
            // ST_Distance_Sphere를 사용하여 중심좌표와의 거리를 계산합니다.
            Sequelize.literal(`ST_Distance_Sphere(POINT(${lng}, ${lat}), POINT(lng, lat))`),
            'distance',
          ],
        ],
      },
      where: Sequelize.literal(`ST_Distance_Sphere(POINT(${lng}, ${lat}), POINT(lng, lat)) <= ${radius}`),
      limit: 100,
      order: Sequelize.literal('distance ASC'), // 가장 가까운 좌표부터 정렬
    });

    const _selectEndTime = new Date();
    const tiemSelect = calculateDuration(_selectStartTime, _selectEndTime);
    console.log('조회 시간 : ', tiemSelect);
    console.log('데이터 수 확인 ', chargers.length);

    const coordinates = chargers.map((item) => [item.coordinate.longitude, item.coordinate.latitude]);

    const _processLog = [];

    const clusterPromises = _standardArray.map(async (i) => {
      const _startTime = new Date();
      const bias = i[0];
      const zoomLv = i[1];

      const clusterStartTime = new Date();
      console.log('클러스터링 조회 시작 : ', clusterStartTime);
      // 클러스터링 프로세스
      const clusterResult = geocluster(coordinates, bias);

      const clusterEndTime = new Date();
      console.log('클러스터링 조회 종료 : ', clusterEndTime);
      const tiemCluster = calculateDuration(clusterStartTime, clusterEndTime);
      console.log('클러스터링 종료 시간 : ', tiemCluster);

      // 마커 이미지 사이즈용

      const sizes = clusterResult.map((obj) => obj.elements.length);
      const minValue = Math.min(...sizes);
      const maxValue = Math.max(...sizes);
      const stepSize = -0.01125 * zoomLv + 0.15625;
      const stepCount = 5;
      const _calibrationRatio = 0.75; // 세로 높이 보정값

      const startResultMappingTime = new Date();
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
      const endResultMappingTime = new Date();
      const resultMappingTime = calculateDuration(startResultMappingTime, endResultMappingTime);
      console.log('매핑 완료 시간 : ', resultMappingTime);

      await models.ChargingStationCluster.destroy({
        where: { zoomLevel: zoomLv },
      });

      // !데이터 처리 프로세스 종료
      const _endTime = new Date();
      const _duration = calculateDuration(_startTime, _endTime);

      _processLog.push({
        zoomLv: zoomLv,
        bias: bias,
        clusterCount: clusterBody.length,
        duration: _duration + ' s',
      });

      const _createStartTime = new Date();
      const resultCreate = models.ChargingStationCluster.bulkCreate(clusterBody);
      const _createEndTime = new Date();

      const tiemCreate = calculateDuration(_createStartTime, _createEndTime);

      console.log('createTime: ', tiemCreate);

      console.log('완료 : ', _processLog);
      return resultCreate;
    });

    await Promise.all(clusterPromises);

    const endTime = new Date();
    const duration = calculateDuration(startTime, endTime);
    console.log('완료 시간 : ', duration);
  } catch (e) {
    console.log(e);
    next(e);
  }
}

// 시간 계산
function calculateDuration(startTime, endTime) {
  const duration = endTime - startTime;
  return duration / 1000;
}

module.exports = {
  createStationLocationCluster,
};
