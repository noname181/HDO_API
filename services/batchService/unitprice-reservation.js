
'use strict'; 
const models = require('../../models');
const Sequelize = require('sequelize');  
const sendUnitPrice = require('../../controllers/webAdminControllers/ocpp/sendUnitPrice');

 
async function processUnitPriceReservation() { 
  try { 
    const result = await models.sb_unitprice_change_reservation.findAll({
        where: Sequelize.literal(`(date BETWEEN DATE_FORMAT(NOW() - INTERVAL 2 MINUTE, '%Y%m%d%H%i') AND DATE_FORMAT(NOW(), '%Y%m%d%H%i')) AND excutedYN = 'N'`),
        include: [
            {
              model: models.sb_charger,
              as: 'charger',
            },
            {
              model: models.UnitPriceSet,
              as: 'unitPriceSet',
            },
          ],
      });

      let array_chg_id = [];   

      await Promise.all(result.map(async (item) => { 
        // console.log('item.dataValues::::', item.dataValues)
        if (item.charger.chg_id && 
            ((item.priceOption === 'N' && item.fixedPrice && item.charger.chg_unit_price != item.fixedPrice) || 
            (item.priceOption === 'Y' && item.floatingPrice && item.unitPriceSet.id && item.charger.upSetId != item.floatingPrice))) {
            //make cannot update if charger is using, not 'available'
            const { count: totalCountChannel, rows: allChannel } = await models.sb_charger_state.findAndCountAll({
                where: {
                    chg_id: item.charger.chg_id,
                },
            });
            const countAllChannelAvailable = allChannel.filter((channel) => channel.cs_charging_state === 'available').length;

            if (totalCountChannel > 0 && totalCountChannel != countAllChannelAvailable) { 
                const currentDate = new Date();
                const formattedDate = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
                await models.sb_unitprice_change_pending.create({
                    chg_id: item.charger.chg_id,
                    usePreset: item.priceOption,
                    ucp_insert_dt: formattedDate,
                    upSetId: item.floatingPrice || null,
                    chg_unit_price: item.fixedPrice || null,
                    change_reservation_id: item.id,
                })
            } else {
                await models.sb_unitprice_change_reservation.update(
                {
                    excutedYN: 'Y',
                },
                {
                    where: {
                        id: item.id,
                    },
                });
                await models.sb_charger.update(
                {
                    usePreset: item.priceOption,
                    upSetId: item.floatingPrice || null,
                    chg_unit_price: item.fixedPrice || null,
                },
                {
                    where: {
                        chg_id: item.charger.chg_id,
                    },
                });
                array_chg_id.push(item.charger.chg_id); 
            } 
        }
    })); 
    if (array_chg_id && array_chg_id.length > 0) {
        await sendUnitPrice(array_chg_id);
    }   
  } catch (e) {
    console.log('ErrorProcessUnitPriceReservation', e);
  }
}

module.exports = {
  processUnitPriceReservation
}
