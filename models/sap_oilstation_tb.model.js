const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class sap_oilstation_tb extends Model {
    static associate(models) {}
  }
  sap_oilstation_tb.init(
    {
      stn_stn_seq: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '',
        defaultValue: '0',
      },
      stn_stn_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '사업장 ID',
        defaultValue: '0',
      },
      stn_val_end_ymd: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '유효종료일지',
        defaultValue: '0',
      },
      stn_val_st_ymd: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '유효종료일지',
        defaultValue: '0',
      },
      stn_stn_gubun: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '사업장구분',
        defaultValue: '0',
      },
      stn_cust_no: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '사업장고객번호',
        defaultValue: '0',
      },
      stn_stn_nm: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '사업장명',
        defaultValue: '0',
      },
      stn_stn_short_nm: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '사업장약명',
        defaultValue: '0',
      },
      stn_zip_cd: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '사업장고객번호',
        defaultValue: '0',
      },
      stn_addr: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '주소 ',
        defaultValue: '0',
      },
      stn_dtl_addr: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '상세주소',
        defaultValue: '0',
      },
      stn_tel_no: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '전화번호',
        defaultValue: '0',
      },
      stn_fax_no: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '팩스번호',
        defaultValue: '0',
      },
      stn_biz_no: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '사업자등록번호',
        defaultValue: '0',
      },
      stn_boss_nm: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '대표자명',
        defaultValue: '0',
      },
      stn_biz_kind_nm: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '업종명',
        defaultValue: '0',
      },
      stn_line_nm: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '종목명',
        defaultValue: '0',
      },
      stn_own_styl_gubun: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '운영형태구분',
        defaultValue: '0',
      },
      stn_sales_st_ymd: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '영업시작일자',
        defaultValue: '0',
      },
      stn_sales_end_ymd: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '영업종료일자',
        defaultValue: '0',
      },
      stn_biz_aprv_ymd: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '사업승인일자',
        defaultValue: '0',
      },
      stn_comp_gubun: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '회사구분',
        defaultValue: '0',
      },
      stn_strg_cd: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '저장소코드',
        defaultValue: '0',
      },
      stn_assgn_dept_cd: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '소속부서코드',
        defaultValue: '0',
      },
      stn_assgn_area_gubun: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '소속지역구분',
        defaultValue: '0',
      },
      stn_rep_trans_area_gubun: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '대표수송지역구분',
        defaultValue: '0',
      },
      stn_rep_sales_ch_consti_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '대표영업담당구성원ID',
        defaultValue: '0',
      },
      stn_cost_ct: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '코스트센터',
        defaultValue: '0',
      },
      stn_pal_ct: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '손익센터',
        defaultValue: '0',
      },
      stn_jnsn_gubun: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '정산구분',
        defaultValue: '0',
      },
      stn_regant_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '등록자ID',
        defaultValue: '0',
      },
      stn_reg_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '등록일시',
        defaultValue: null,
      },
      stn_upder_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '수장자ID',
        defaultValue: '0',
      },
      stn_upd_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '수정일시',
        defaultValue: null,
      },
      stn_erp_if_gubun: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'ERP 전송구분',
        defaultValue: '0',
      },
      stn_erp_if_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'ERP 전송일시',
        defaultValue: null,
      },
      stn_updn_gubun: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'ERP 전송일시',
        defaultValue: '0',
      },
      stn_updn_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '송수신일시',
        defaultValue: null,
      },
      stn_erp_if_emsg: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'ERP전송오류메시지',
        defaultValue: '0',
      },
      stn_erp_stn_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'ERP사업장ID',
        defaultValue: '0',
      },
      stn_fos_if_yn: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'FOS 전송여부',
        defaultValue: '0',
      },
      stn_ipgm_bank_cd: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '입금은행코드',
        defaultValue: '0',
      },
      stn_chld_acct_no: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '자계좌번호',
        defaultValue: '0',
      },
      stn_hc_no: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '자동차부탄판매여부',
        defaultValue: '0',
      },
      stn_carbt_sale_yn: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '사업장고객번호',
        defaultValue: '0',
      },
      stn_cls_appl_hm: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '마감적용시간정보',
        defaultValue: '0',
      },
      stn_rep_trans_area_seq: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '마감적용시간정보',
        defaultValue: '0',
      },
      stn_cr_jsyb: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '=',
        defaultValue: '0',
      },
      stn_cr_date: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '',
        defaultValue: '0',
      },
    },
    {
      sequelize,
      modelName: 'sap_oilstation_tb',
      tableName: 'sap_oilstation_tb',
      timestamps: false,
      paranoid: false,
    }
  );

  return sap_oilstation_tb;
};
