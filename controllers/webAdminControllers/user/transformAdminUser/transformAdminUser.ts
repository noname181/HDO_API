import { USER_TYPE } from '../../../../util/tokenService';

export type UserRole = {
  id: string;
  name: string;
};

export type UserAdminResponse = {
  id: string;
  accountId: string;
  email: string;
  phoneNo: string;
  name: string;
  status: string;
  type: string;
  createdAt: string;
  Org: {
    id: string;
    name: string;
    category: string;
  } | null;
};

export type HDOResponse = UserAdminResponse & {
  dept: string;
  role: UserRole | null;
};

export type EXTERNALResponse = UserAdminResponse & {
  currentAccessDateTime: string;
  verifyEmailSendedAt: string;
  role: UserRole | null;
};

export type MOBILEResponse = UserAdminResponse & {
  isEmailVerified: boolean;
  birth: string;
  gender: string;
  address: string;
  detailAddress: string;
  zipCode: string;
  profileImage: string;
  payMethods: Record<string, any>;
  vehicles: Record<string, any>;
  connectedSns: Record<string, any>;
};

export type TransformResponse = HDOResponse | EXTERNALResponse | MOBILEResponse;

export const transformAdminUser = (user: any, isPrivateView = true): TransformResponse => {
  return transformByUserType(user, isPrivateView);
};

export const transformByUserType = (user: any, isPrivateView: boolean): TransformResponse => {
  const email = user.email || '';
  const phoneNo = user.phoneNo || '';
  const name = user.name || '';
  const accountId = user.accountId || '';

  const data = {
    hdo: {
      id: user.id || '',
      accountId: isPrivateView ? accountId : userIdMask(accountId),
      email: isPrivateView ? email : emailMask(email),
      phoneNo: isPrivateView ? phoneNo : phoneNoMask(phoneNo),
      name: isPrivateView ? name : nameMask(name),
      status: user.status || '',
      type: user.type || '',
      Person: user.SAP_Person
        ? {
            JKW1: user.SAP_Person.JKW1 || '',
            ORG1: user.SAP_Person.ORG1 || '',
            PHONE2: user.SAP_Person.PHONE2 || '',
          }
        : null,
      role: user.Role
        ? {
            id: user.Role.id || '',
            name: user.Role.name || '',
          }
        : null,
      dept: user.dept || '',
      createdAt: user.createdAt || '',
      Org: user.Org
        ? {
            id: user.Org.id || '',
            name: user.Org.name || '',
            category: user.Org.category || '',
          }
        : null,
    },
    org: {
      id: user.id || '',
      accountId: isPrivateView ? accountId : userIdMask(accountId),
      email: isPrivateView ? email : emailMask(email),
      phoneNo: isPrivateView ? phoneNo : phoneNoMask(phoneNo),
      name: isPrivateView ? name : nameMask(name),
      status: user.status || '',
      role: user.Role
        ? {
            id: user.Role.id || '',
            name: user.Role.name || '',
          }
        : null,
      currentAccessDateTime: user.currentAccessDateTime || '',
      verifyEmailSendedAt: user.verifyEmailSendedAt || '',
      type: user.type || '',
      createdAt: user.createdAt || '',
      Org: user.Org
        ? {
            id: user.Org.id || '',
            name: user.Org.name || '',
            category: user.Org.category || '',
          }
        : null,
    },
    mobile: {
      id: user.id || '',
      accountId: isPrivateView ? accountId : userIdMask(accountId),
      email: isPrivateView ? email : emailMask(email),
      phoneNo: isPrivateView ? phoneNo : phoneNoMask(phoneNo),
      name: isPrivateView ? name : nameMask(name),
      status: user.status || '',
      type: user.type || '',
      createdAt: user.createdAt || '',
      payMethods: user.payMethods || null,
      vehicles: user.vehicles || null,
      userOauths: user.userOauths || null,
      connectedSns: user.UserOauth || null,
      isEmailVerified: Boolean(user.isEmailVerified),
      profileImage: user.profileImage || '',
      birth: user.birth || '',
      gender: user.gender || '',
      address: user.address || '',
      detailAddress: user.detailAddress || '',
      zipCode: user.zipCode || '',
      lastOnline: user.lastOnline || '',
      Org: user.Org
        ? {
            id: user.Org.id || '',
            name: user.Org.name || '',
            category: user.Org.category || '',
          }
        : null,
    },
  };

  const userType = user.type.toLowerCase() === 'hdo' ? 'hdo' : user.type.toLowerCase() === 'org' ? 'org' : 'mobile';
  return data[userType] || data.mobile;
};

export const emailMask = (email: string) => {
  if (!email) {
    return '';
  }

  // const emailPrefix = email.split('@')[0];
  // const emailDomain = email.split('@')[1];

  // let privatePrefix = emailPrefix.replace(/./g, '*');

  // if (emailPrefix.length > 3) {
  //   privatePrefix = emailPrefix.replace(/...$/g, '***');
  // }

  // return `${privatePrefix}@${emailDomain}`;
  const maskedPrefix = '**';
  const restOfEmail = email.substring(2); // 앞 2자를 제외한 나머지 문자열

  return maskedPrefix + restOfEmail; // 마스킹 처리한 문자열
};

export const phoneNoMask = (phoneNo: string) => {
  if (!phoneNo) {
    return '';
  }

  const normalizePhoneNo = phoneNo.replace(/-/g, '').trim();

  // if (normalizePhoneNo.length !== 11) {
  //   return normalizePhoneNo;
  // }

  const firstPart = '***';
  const secondPart = '****';
  const thirdPart = normalizePhoneNo.substr(7);

  const formattedNumber = `${firstPart}-${secondPart}-${thirdPart}`;

  return formattedNumber;
};

export const formatPhoneNo = (phoneNo: string) => {
  if (!phoneNo) {
    return '';
  }

  switch (phoneNo.length) {
    case 9:
      return `${phoneNo.substring(0, 2)}-${phoneNo.substring(2, 5)}-${phoneNo.substring(5, 9)}`;
    case 10:
      return `${phoneNo.substring(0, 3)}-${phoneNo.substring(3, 6)}-${phoneNo.substring(6, 10)}`;
    case 11:
      return `${phoneNo.substring(0, 3)}-${phoneNo.substring(3, 7)}-${phoneNo.substring(7, 11)}`;
    default:
      return phoneNo;
  }
};

export const showPhoneNo = (phoneNo: string) => {
  if (!phoneNo) {
    return '';
  }

  return phoneNo.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
};

export const addressMask = (address: string) => {
  if (!address) {
    return '';
  }

  const addressParts = address.split(' ');

  if (addressParts.length >= 3) {
    const firstThreeParts = addressParts.slice(0, 3).join(' ');
    const remainingLength = address.length - firstThreeParts.length;
    const replacement = '*'.repeat(remainingLength);
    const maskedAddress = firstThreeParts + ' ' + replacement;
    return maskedAddress;
  } else {
    return address;
  }
};

export const nameMask = (name: string) => {
  if (!name) {
    return '';
  }
  let str = name.split('');
  str[1] = '*';
  name = str.join('');
  return name;
};

export const cardNoMask = (cardNo: string) => {
  if (!cardNo) {
    return '';
  }

  return cardNo;
  //----------------- hide mask card WEP 372
  // const firstPart = cardNo.substring(0, 4);
  // const secondPart = cardNo.substring(4, 8);
  // const thirdPart = cardNo.substring(8, 12);
  // const fourPart = cardNo.substring(12, 16);
  // const regexPattern = /^(.*)(.{1})$/;

  // const maskedNumber = `****-${secondPart}-****-${fourPart.replace(regexPattern, '$1*')}`;

  // return maskedNumber;
  //----------------- hide mask card WEP 372

  //return cardNo.toString().replace(/(\d{4})-(\d{4})-(\d{4})-(\d{3})(\d)$/, '****-$2-****-$4*');
};

export const userIdMask = (userId: string) => {
  if (!userId) {
    return '';
  }

  return userId.slice(0, -3) + '***';
};
