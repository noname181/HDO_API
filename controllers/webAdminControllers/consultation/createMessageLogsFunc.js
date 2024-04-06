const models = require('../../../models');

const createMessageLogsFunc = async (
  csId,
  chargerId,
  textMessage,
  phoneNo,
  sendDt,
  returnType,
  messageType,
  phoneCaller
) => {
  try {
    await models.MessageLog.create({
      csId,
      chargerId,
      textMessage,
      phoneNo,
      sendDt,
      returnType,
      messageType,
      phoneCaller,
    });
  } catch (error) {
    throw error;
  }
};

module.exports = { createMessageLogsFunc };
