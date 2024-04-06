import axios from 'axios';

export const getGeoCodeFromAddress = async (address: string) => {
  const url = 'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode-js';

  try {
    const { data } = await axios.get(`${url}?query=${address}&X-NCP-APIGW-API-KEY-ID=rb3urd3wxy`);

    if (!data || !data.addresses || !Array.isArray(data.addresses) || data.addresses.length === 0) {
      return {
        longitude: '',
        latitude: '',
      };
    }
    return {
      longitude: data.addresses[0].x || '',
      latitude: data.addresses[0].y || '',
    };
  } catch (error) {
    return {
      longitude: '',
      latitude: '',
    };
  }
};
