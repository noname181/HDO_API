'use strict';

const FIRST_MODEL_NAME = 'Faqs';
const FIRST_COLUMN_NAME = ['title', 'category', 'createdWho', 'updatedWho'];

const SECOND_MODEL_NAME = 'FavoriteChargerStations';
const SECOND_COLUMN_NAME = ['chargerId', 'userId', 'createdWho', 'updatedWho'];

const THIRD_MODEL_NAME = 'FileToChargers';
const THIRD_COLUMN_NAME = ['division', 'newestVersion', 'createdAt', 'deletedAt'];

const FOURTH_MODEL_NAME = 'Inquiries';
const FOURTH_COLUMN_NAME = ['status', 'createdWho', 'updatedWho'];

const FIFTH_MODEL_NAME = 'messageLog';
const FIFTH_COLUMN_NAME = ['phoneNo'];

const SIXTH_MODEL_NAME = 'NoticeModels';
const SIXTH_COLUMN_NAME = ['createdWho', 'updatedWho', 'title'];

const SEVENTH_MODEL_NAME = 'Orgs';
const SEVENTH_COLUMN_NAME = [
  'createdWho',
  'updatedWho',
  'category',
  'fullname',
  'name',
  'bizRegNo',
  'address',
  'contactName',
  'contactPhoneNo',
  'contactEmail',
  'deductType',
  'discountPrice',
  'staticUnitPrice',
  'isPayLater',
  'STN_STN_SEQ',
  'STN_STN_ID',
  'STN_STN_GUBUN',
  'STN_CUST_NO',
  'STN_ASSGN_AREA_GUBUN',
  'STN_COST_CT',
  'STN_PAL_CT',
  'STN_STN_SHORT_NM',
];

const EIGHTH_MODEL_NAME = 'PaymentLogs';
const EIGHTH_COLUMN_NAME = ['orgId', 'userId', 'chgs_id', 'chg_id', 'bookingId'];

const NINTH_MODEL_NAME = 'PaymentNotifications';
const NINTH_COLUMN_NAME = [
  'cno',
  'noti_type',
  'mgr_seqno',
  'card_no',
  'chg_id',
  'order_no',
  'auth_no',
  'tran_date',
  'stat_cd',
  'createdAt',
];

const TENTH_MODEL_NAME = 'PayMethods';
const TENTH_COLUMN_NAME = ['usersNewId', 'orgId'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        for await (const item of FIRST_COLUMN_NAME) {
          await queryInterface.addIndex(FIRST_MODEL_NAME, {
            fields: [item],
            using: 'BTREE',
            transaction: t,
          });
        }

        for await (const item of SECOND_COLUMN_NAME) {
          await queryInterface.addIndex(SECOND_MODEL_NAME, {
            fields: [item],
            using: 'BTREE',
            transaction: t,
          });
        }

        for await (const item of THIRD_COLUMN_NAME) {
          await queryInterface.addIndex(THIRD_MODEL_NAME, {
            fields: [item],
            using: 'BTREE',
            transaction: t,
          });
        }
        for await (const item of FOURTH_COLUMN_NAME) {
          await queryInterface.addIndex(FOURTH_MODEL_NAME, {
            fields: [item],
            using: 'BTREE',
            transaction: t,
          });
        }
        for await (const item of FIFTH_COLUMN_NAME) {
          await queryInterface.addIndex(FIFTH_MODEL_NAME, {
            fields: [item],
            using: 'BTREE',
            transaction: t,
          });
        }
        for await (const item of SIXTH_COLUMN_NAME) {
          await queryInterface.addIndex(SIXTH_MODEL_NAME, {
            fields: [item],
            using: 'BTREE',
            transaction: t,
          });
        }
        for await (const item of SEVENTH_COLUMN_NAME) {
          await queryInterface.addIndex(SEVENTH_MODEL_NAME, {
            fields: [item],
            using: 'BTREE',
            transaction: t,
          });
        }
        for await (const item of EIGHTH_COLUMN_NAME) {
          await queryInterface.addIndex(EIGHTH_MODEL_NAME, {
            fields: [item],
            using: 'BTREE',
            transaction: t,
          });
        }
        for await (const item of NINTH_COLUMN_NAME) {
          await queryInterface.addIndex(NINTH_MODEL_NAME, {
            fields: [item],
            using: 'BTREE',
            transaction: t,
          });
        }
        for await (const item of TENTH_COLUMN_NAME) {
          await queryInterface.addIndex(TENTH_MODEL_NAME, {
            fields: [item],
            using: 'BTREE',
            transaction: t,
          });
        }
      });
    } catch (error) {
      console.log('20231226075258-add_index_for_config_and_coupon_models::up::error:', error);
      return;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      return await queryInterface.sequelize.transaction(async (t) => {
        for await (const item of FIRST_COLUMN_NAME) {
          await queryInterface.removeIndex(FIRST_MODEL_NAME, [item], {
            transaction: t,
          });
        }
        for await (const item of SECOND_COLUMN_NAME) {
          await queryInterface.removeIndex(SECOND_MODEL_NAME, [item], {
            transaction: t,
          });
        }
        for await (const item of THIRD_COLUMN_NAME) {
          await queryInterface.removeIndex(THIRD_MODEL_NAME, [item], {
            transaction: t,
          });
        }
        for await (const item of FOURTH_COLUMN_NAME) {
          await queryInterface.removeIndex(FOURTH_MODEL_NAME, [item], {
            transaction: t,
          });
        }
        for await (const item of FIFTH_COLUMN_NAME) {
          await queryInterface.removeIndex(FIFTH_MODEL_NAME, [item], {
            transaction: t,
          });
        }
        for await (const item of SIXTH_COLUMN_NAME) {
          await queryInterface.removeIndex(SIXTH_MODEL_NAME, [item], {
            transaction: t,
          });
        }
        for await (const item of SEVENTH_COLUMN_NAME) {
          await queryInterface.removeIndex(SEVENTH_MODEL_NAME, [item], {
            transaction: t,
          });
        }
        for await (const item of EIGHTH_COLUMN_NAME) {
          await queryInterface.removeIndex(EIGHTH_MODEL_NAME, [item], {
            transaction: t,
          });
        }
        for await (const item of NINTH_COLUMN_NAME) {
          await queryInterface.removeIndex(NINTH_MODEL_NAME, [item], {
            transaction: t,
          });
        }
        for await (const item of TENTH_COLUMN_NAME) {
          await queryInterface.removeIndex(TENTH_MODEL_NAME, [item], {
            transaction: t,
          });
        }
      });
    } catch (error) {
      console.log('20231226075258-add_index_for_config_and_coupon_models::down::error:', error);
      return;
    }
  },
};
