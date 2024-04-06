const Center = {
  type: "object",
  properties: {
    longitude: {
      type: "number",
      example: 127.935665,
    },
    latitude: {
      type: "number",
      example: 127.935665,
    },
  },
};

const StationCluster = {
  type: "object",
  properties: {
    id: {
      type: "string",
      example: "1",
    },
    size: {
      type: "number",
      example: 123,
    },
    point: {
      type: "array",
      example: [1, 2, 3, 4],
    },
    center: Center,
  },
};

const FavoriteChargerStationCluster = {
  type: "object",
  properties: {
    chargerId: {
      type: "number",
      example: "1",
    },
  },
}

module.exports = {
  StationCluster,
  FavoriteChargerStationCluster,
};
