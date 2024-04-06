const SaveResponse = {
  type: "object",
  properties: {
    result: {
      type: "string",
      example: 'success or fail',
    },
    message: {
      type: "string",
      example: '성공적으로 등록되었습니다. or 이미 연동된 간편로그인 정보가 존재합니다.',
    },
  },
};

module.exports = {
  SaveResponse,
};
