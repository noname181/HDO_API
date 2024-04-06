import { NextFunction, Request, Response } from 'express';
import { USER_TYPE } from '../../../../util/tokenService';
import { HTTP_STATUS_CODE } from '../../../../middleware/newRole.middleware';
import { Op } from 'sequelize';
import isDate from 'validator/lib/isDate';
import { addressMask, emailMask, nameMask, phoneNoMask } from '../../user/transformAdminUser/transformAdminUser';
const models = require('../../../../models');

enum ORG_CATE {
  station = 'STATION',
  contractor = 'CONTRACTOR',
  client = 'CLIENT',
}

type PagingQuery = {
  page?: number;
  rpp?: number;
  odby?: string;
};

type GetOrgsQuery = PagingQuery & {
  name?: string;
  contact?: string;
  cate?: string;
  closed?: string;
  searchKey?: string;
  searchVal?: string;
  startDate?: string;
  endDate?: string;
  area?: string;
  branch?: string;
  division?: string;
};

export async function getOrgsService(request: Request<{}, {}, {}, GetOrgsQuery>, response: Response) {
  const { user: authUser, query } = request;
  const page = Number(query.page) || 1;
  const rpp = Number(query.rpp) || 50;
  const odby = query.odby || 'DESC';

  const user = await models.UsersNew.findByPk(authUser.id);
  const org = await models.Org.findByPk(user.orgId);
  if (authUser.type.toLowerCase() === USER_TYPE.EXTERNAL && org?.category === 'AS') {
    const dbQuery = getOrgsDBQuery(query, org.id);

    const { totalCount, result } = await getOrgs(dbQuery, page, rpp, odby);
    return response.status(HTTP_STATUS_CODE.OK).json({ totalCount, result });
  }

  if (authUser.type.toLowerCase() === USER_TYPE.EXTERNAL && org?.category === 'CS') {
    const dbQuery = getOrgsDBQuery(query, 0, 'CS');

    const { totalCount, result } = await getOrgs(dbQuery, page, rpp, odby);
    return response.status(HTTP_STATUS_CODE.OK).json({ totalCount, result });
  }

  const dbQuery = getOrgsDBQuery(query);
  const { totalCount, result } = await getOrgs(dbQuery, page, rpp, odby);
  return response.status(HTTP_STATUS_CODE.OK).json({ totalCount, result });
}

const getOrgs = async (dbQuery: Record<string, any>[], page: number, rpp: number, odby: string) => {
  const offset = (page - 1) * rpp;
  let options = {
    where: {
      [Op.and]: dbQuery,
    },
    attributes: [
      'id',
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
      'payMethodId',
      'isPayLater',
      'isLocked',
      'billingDate',
      'closed',
      'area',
      'branch',
      'haveCarWash',
      'haveCVS',
      'STN_STN_SEQ',
      'STN_STN_ID',
      'STN_STN_GUBUN',
      'STN_CUST_NO',
      'STN_ASSGN_AREA_GUBUN',
      'STN_COST_CT',
      'STN_PAL_CT',
      'STN_STN_SHORT_NM',
      'erp',
      'createdAt',
      'updatedAt',
      [
        models.sequelize.literal(
          `(SELECT descInfo FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1)`
        ),
        'branchName',
      ],
      [
        models.sequelize.literal(
          "(SELECT upperDivCode FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1)"
        ),
        'areaName',
      ],
    ],
    offset,
    limit: rpp,
    order: [['id', odby]],
    include: [
      { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      {
        model: models.sb_charging_station,
        as: 'chargingStation',
        attributes: ['chgs_id'],
      },
    ],
  };

  try {
    // 위 조건에 대한 사용자 목록 조회(권한 및 사용자 그룹 포함)
    const { count: totalCount, rows: orgsData } = await models.Org.findAndCountAll(options);
    const orgs = [];
    for (let item of orgsData) {
      const newItem = { ...item.dataValues };
      const privateView = false;
      if (!privateView) {
        const address = addressMask(item.address);
        const phoneNo = phoneNoMask(item.contactPhoneNo);
        const email = emailMask(item.contactEmail);
        const name = nameMask(item.contactName);
        newItem.address = address;
        newItem.contactPhoneNo = phoneNo;
        newItem.contactEmail = email;
        newItem.contactName = name;
      }

      orgs.push({ ...newItem });
    }

    // 조회된 사용자 목록 응답
    return {
      totalCount: totalCount,
      result: orgs,
    };
  } catch (e) {
    console.log('file: getOrgs.service.ts:164 ~ getOrgs ~ e:', e);

    return {
      totalCount: 0,
      result: [],
    };
  }
};

const getOrgsDBQuery = (query: GetOrgsQuery, orgId = 0, orgType = '') => {
  const cate = Object.values(ORG_CATE).find((item) => item === query.cate?.toUpperCase()) || ORG_CATE.client;
  const area = query.area !== undefined ? parseInt(query.area.toString()) : 0;
  const branch = query.branch !== undefined ? parseInt(query.branch.toString()) : 0;
  const startDate = dateTransformer(query.startDate);
  const endDate = dateTransformer(query.endDate);
  const closed = query.closed?.toLowerCase() || 'all';
  const allowSearchKey = [
    'fullname',
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

  const cateQuery = cateTransformer(cate);
  const dbQuery: Record<string, any>[] = [
    {
      category: {
        [Op.in]: cateQuery,
      },
    },
  ];

  if (orgId) {
    dbQuery.push({ id: orgId });
  }

  if (orgType && orgType === 'CS') {
    dbQuery.push({ category: 'CS' });
  }

  if (query.name) {
    dbQuery.push({ name: { [Op.like]: `%${query.name}%` } });
  }

  if (query.contact) {
    dbQuery.push({ contactName: { [Op.like]: `%${query.contact}%` } });
  }

  if (query.area) {
    dbQuery.push(
      models.sequelize.literal(
        `(SELECT upperDivCode FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1) = '${query.area}' `
      )
    );
  }

  if (query.branch !== undefined && !isNaN(branch)) {
    dbQuery.push({ branch });
  }

  if (startDate) {
    dbQuery.push({ createdAt: { [Op.gte]: startDate } });
  }

  if (endDate) {
    endDate.setUTCHours(23, 59, 59, 999);
    dbQuery.push({ createdAt: { [Op.lte]: endDate } });
  }

  if (closed === 'true' || closed === 'false') {
    const closedQuery = closedTransformer(closed);
    dbQuery.push({ closed: closedQuery });
  }

  if (query.division) {
    dbQuery.push({ category: query.division });
  }

  if (!query.searchVal) {
    return dbQuery;
  }

  if (query.searchKey) {
    const searchKeyQuery = searchKeyTransformer(query.searchKey, allowSearchKey);
    dbQuery.push({ [searchKeyQuery]: { [Op.like]: `%${query.searchVal}%` } });

    return dbQuery;
  }

  const searchKeyQuery = searchValQueryBuilder(query.searchVal, allowSearchKey);
  dbQuery.push({ [Op.or]: searchKeyQuery });

  return dbQuery;
};

const cateTransformer = (cate: ORG_CATE): string[] => {
  const cateValue: Record<ORG_CATE, string[]> = {
    [ORG_CATE.station]: ['A1', 'X1'],
    [ORG_CATE.contractor]: ['CS', 'AS', 'RF_CARD', 'ETC'],
    [ORG_CATE.client]: ['ALLNC', 'GRP', 'BIZ'],
  };

  return cateValue[cate] || cateValue.CLIENT;
};

const dateTransformer = (date = ''): Date | undefined => {
  const newDate = new Date(date);

  if (date && !isNaN(newDate.getTime())) {
    return newDate;
  }
};

const closedTransformer = (closed: 'true' | 'false'): boolean => {
  return closed === 'true' ? true : false;
};

const searchKeyTransformer = (searchKey: string, allowSearchKey: string[]): string => {
  return allowSearchKey.find((item) => item.toLowerCase() === searchKey.toLowerCase()) || allowSearchKey[0];
};

const searchValQueryBuilder = (searchVal: string, allowSearchKey: string[]) => {
  return allowSearchKey.map((item) => ({ [item]: { [Op.like]: `%${searchVal}%` } }));
};
