'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Orgs', 'category', {
      type: Sequelize.DataTypes.ENUM,
      allowNull: false,
      values: [
        'DEF',
        'HDO',
        'STT_DIR',
        'STT_FRN',
        'CS',
        'AS',
        'BIZ',
        'ALLNC',
        'GRP',
        'RF_CARD',
        'EV_DIV',
        'NON',
        'X1',
        'A1',
        'ETC',
      ],
      defaultValue: 'DEF',
      comment:
        '소속구분(일반이용자(DEF), 현대오일뱅크(HDO), 직영 충전소(STT_DIR), 자영 충전소(STT_FRN), CS, AS, 법인(BIZ), 협력사(ALLNC), 그룹(GRP), 파킹스루(RF_CARD), 비회원(NON), 기타(ETC)',
    },);
  },

  async down(queryInterface, Sequelize) {
     await queryInterface.changeColumn('Orgs', 'category', {
      type: Sequelize.DataTypes.ENUM,
      allowNull: false,
      values: [
        'DEF',
        'HDO',
        'STT_DIR',
        'STT_FRN',
        'CS',
        'AS',
        'BIZ',
        'ALLNC',
        'GRP',
        'RF_CARD',
        'EV_DIV',
        'NON',
        'X1',
        'A1', 
      ],
      defaultValue: 'DEF',
      comment:
        '소속구분(일반이용자(DEF), 현대오일뱅크(HDO), 직영 충전소(STT_DIR), 자영 충전소(STT_FRN), CS, AS, 법인(BIZ), 협력사(ALLNC), 그룹(GRP), 파킹스루(RF_CARD), 비회원(NON)',
    },);
  },
};
