import { Op } from 'sequelize';

export const getUnpaidPaymentByUserId = async (id: string, models: any) => {
  const userId = isNaN(parseInt(id)) ? 0 : parseInt(id);

  const unpaidClog = await models.sb_charging_log.findOne({
    where: {
      usersNewId: userId,
      payCompletedYn: 'N',
      cl_unplug_datetime: { [Op.ne]: null },
    },
    order: [['cl_id', 'DESC']],
  });

  return unpaidClog;
};
