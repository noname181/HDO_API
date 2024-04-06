"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIdMask = exports.cardNoMask = exports.nameMask = exports.addressMask = exports.showPhoneNo = exports.formatPhoneNo = exports.phoneNoMask = exports.emailMask = exports.transformByUserType = exports.transformAdminUser = void 0;
const transformAdminUser = (user, isPrivateView = true) => {
    return (0, exports.transformByUserType)(user, isPrivateView);
};
exports.transformAdminUser = transformAdminUser;
const transformByUserType = (user, isPrivateView) => {
    const email = user.email || '';
    const phoneNo = user.phoneNo || '';
    const name = user.name || '';
    const accountId = user.accountId || '';
    const data = {
        hdo: {
            id: user.id || '',
            accountId: isPrivateView ? accountId : (0, exports.userIdMask)(accountId),
            email: isPrivateView ? email : (0, exports.emailMask)(email),
            phoneNo: isPrivateView ? phoneNo : (0, exports.phoneNoMask)(phoneNo),
            name: isPrivateView ? name : (0, exports.nameMask)(name),
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
            accountId: isPrivateView ? accountId : (0, exports.userIdMask)(accountId),
            email: isPrivateView ? email : (0, exports.emailMask)(email),
            phoneNo: isPrivateView ? phoneNo : (0, exports.phoneNoMask)(phoneNo),
            name: isPrivateView ? name : (0, exports.nameMask)(name),
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
            accountId: isPrivateView ? accountId : (0, exports.userIdMask)(accountId),
            email: isPrivateView ? email : (0, exports.emailMask)(email),
            phoneNo: isPrivateView ? phoneNo : (0, exports.phoneNoMask)(phoneNo),
            name: isPrivateView ? name : (0, exports.nameMask)(name),
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
exports.transformByUserType = transformByUserType;
const emailMask = (email) => {
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
exports.emailMask = emailMask;
const phoneNoMask = (phoneNo) => {
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
exports.phoneNoMask = phoneNoMask;
const formatPhoneNo = (phoneNo) => {
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
exports.formatPhoneNo = formatPhoneNo;
const showPhoneNo = (phoneNo) => {
    if (!phoneNo) {
        return '';
    }
    return phoneNo.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
};
exports.showPhoneNo = showPhoneNo;
const addressMask = (address) => {
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
    }
    else {
        return address;
    }
};
exports.addressMask = addressMask;
const nameMask = (name) => {
    if (!name) {
        return '';
    }
    let str = name.split('');
    str[1] = '*';
    name = str.join('');
    return name;
};
exports.nameMask = nameMask;
const cardNoMask = (cardNo) => {
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
exports.cardNoMask = cardNoMask;
const userIdMask = (userId) => {
    if (!userId) {
        return '';
    }
    return userId.slice(0, -3) + '***';
};
exports.userIdMask = userIdMask;
