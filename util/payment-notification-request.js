"use strict";
// This code is generated by https://app.quicktype.io
// To parse this data:
//
//   import { Convert, PaymentNotificationRequest } from "./file";
//
//   const paymentNotificationRequest = Convert.toPaymentNotificationRequest(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Convert = void 0;
// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
class Convert {
    static toPaymentNotificationRequest(json) {
        return cast(JSON.parse(json), r('PaymentNotificationRequest'));
    }
    static paymentNotificationRequestToJson(value) {
        return JSON.stringify(uncast(value, r('PaymentNotificationRequest')), null, 2);
    }
}
exports.Convert = Convert;
function invalidValue(typ, val, key, parent = '') {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}
function prettyTypeName(typ) {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        }
        else {
            return `one of [${typ
                .map((a) => {
                return prettyTypeName(a);
            })
                .join(', ')}]`;
        }
    }
    else if (typeof typ === 'object' && typ.literal !== undefined) {
        return typ.literal;
    }
    else {
        return typeof typ;
    }
}
function jsonToJSProps(typ) {
    if (typ.jsonToJS === undefined) {
        const map = {};
        typ.props.forEach((p) => (map[p.json] = { key: p.js, typ: p.typ }));
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}
function jsToJSONProps(typ) {
    if (typ.jsToJSON === undefined) {
        const map = {};
        typ.props.forEach((p) => (map[p.js] = { key: p.json, typ: p.typ }));
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}
function transform(val, typ, getProps, key = '', parent = '') {
    function transformPrimitive(typ, val) {
        if (typeof typ === typeof val)
            return val;
        return invalidValue(typ, val, key, parent);
    }
    function transformUnion(typs, val) {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            }
            catch (error) {
                console.log('error: ', error);
            }
        }
        return invalidValue(typs, val, key, parent);
    }
    function transformEnum(cases, val) {
        if (cases.indexOf(val) !== -1)
            return val;
        return invalidValue(cases.map((a) => {
            return l(a);
        }), val, key, parent);
    }
    function transformArray(typ, val) {
        // val must be an array with no invalid elements
        if (!Array.isArray(val))
            return invalidValue(l('array'), val, key, parent);
        return val.map((el) => transform(el, typ, getProps));
    }
    function transformDate(val) {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l('Date'), val, key, parent);
        }
        return d;
    }
    function transformObject(props, additional, val) {
        if (val === null || typeof val !== 'object' || Array.isArray(val)) {
            return invalidValue(l(ref || 'object'), val, key, parent);
        }
        const result = {};
        Object.getOwnPropertyNames(props).forEach((key) => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach((key) => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }
    if (typ === 'any')
        return val;
    if (typ === null) {
        if (val === null)
            return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false)
        return invalidValue(typ, val, key, parent);
    let ref = undefined;
    while (typeof typ === 'object' && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ))
        return transformEnum(typ, val);
    if (typeof typ === 'object') {
        return typ.hasOwnProperty('unionMembers')
            ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty('arrayItems')
                ? transformArray(typ.arrayItems, val)
                : typ.hasOwnProperty('props')
                    ? transformObject(getProps(typ), typ.additional, val)
                    : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== 'number')
        return transformDate(val);
    return transformPrimitive(typ, val);
}
function cast(val, typ) {
    return transform(val, typ, jsonToJSProps);
}
function uncast(val, typ) {
    return transform(val, typ, jsToJSONProps);
}
function l(typ) {
    return { literal: typ };
}
function a(typ) {
    return { arrayItems: typ };
}
function u(...typs) {
    return { unionMembers: typs };
}
function o(props, additional) {
    return { props, additional };
}
function m(additional) {
    return { props: [], additional };
}
function r(name) {
    return { ref: name };
}
const typeMap = {
    PaymentNotificationRequest: o([
        { json: 'res_cd', js: 'res_cd', typ: '' },
        { json: 'res_msg', js: 'res_msg', typ: '' },
        { json: 'cno', js: 'cno', typ: '' },
        { json: 'order_no', js: 'order_no', typ: '' },
        { json: 'amount', js: 'amount', typ: '' },
        { json: 'auth_no', js: 'auth_no', typ: u(undefined, '') },
        { json: 'tran_date', js: 'tran_date', typ: '' },
        { json: 'card_no', js: 'card_no', typ: u(undefined, '') },
        { json: 'issuer_cd', js: 'issuer_cd', typ: u(undefined, '') },
        { json: 'issuer_nm', js: 'issuer_nm', typ: u(undefined, '') },
        { json: 'acquirer_cd', js: 'acquirer_cd', typ: u(undefined, '') },
        { json: 'acquirer_nm', js: 'acquirer_nm', typ: u(undefined, '') },
        { json: 'noint', js: 'noint', typ: u(undefined, '') },
        { json: 'install_period', js: 'install_period', typ: u(undefined, '') },
        { json: 'used_pnt', js: 'used_pnt', typ: u(undefined, '') },
        { json: 'escrow_yn', js: 'escrow_yn', typ: '' },
        { json: 'complex_yn', js: 'complex_yn', typ: u(undefined, '') },
        { json: 'stat_cd', js: 'stat_cd', typ: '' },
        { json: 'stat_msg', js: 'stat_msg', typ: '' },
        { json: 'van_tid', js: 'van_tid', typ: u(undefined, '') },
        { json: 'van_sno', js: 'van_sno', typ: u(undefined, '') },
        { json: 'pay_type', js: 'pay_type', typ: '' },
        { json: 'memb_id', js: 'memb_id', typ: '' },
        { json: 'noti_type', js: 'noti_type', typ: '' },
        { json: 'part_cancel_yn', js: 'part_cancel_yn', typ: u(undefined, '') },
        { json: 'memb_gubun', js: 'memb_gubun', typ: u(undefined, '') },
        { json: 'card_gubun', js: 'card_gubun', typ: u(undefined, '') },
        { json: 'card_biz_gubun', js: 'card_biz_gubun', typ: u(undefined, '') },
        { json: 'cpon_flag', js: 'cpon_flag', typ: u(undefined, '') },
        { json: 'cardno_hash', js: 'cardno_hash', typ: u(undefined, '') },
        { json: 'sub_card_cd', js: 'sub_card_cd', typ: u(undefined, '') },
        { json: 'bk_pay_yn', js: 'bk_pay_yn', typ: '' },
        { json: 'remain_pnt', js: 'remain_pnt', typ: u(undefined, '') },
        { json: 'accrue_pnt', js: 'accrue_pnt', typ: u(undefined, '') },
        { json: 'canc_date', js: 'canc_date', typ: u(undefined, '') },
        { json: 'mgr_amt', js: 'mgr_amt', typ: u(undefined, '') },
        { json: 'mgr_card_amt', js: 'mgr_card_amt', typ: u(undefined, '') },
        { json: 'mgr_cpon_amt', js: 'mgr_cpon_amt', typ: u(undefined, '') },
        { json: 'mgr_seqno', js: 'mgr_seqno', typ: u(undefined, '') },
        { json: 'mgr_req_msg', js: 'mgr_req_msg', typ: u(undefined, '') },
        { json: 'day_rem_pnt', js: 'day_rem_pnt', typ: u(undefined, '') },
        { json: 'month_rem_pnt', js: 'month_rem_pnt', typ: u(undefined, '') },
        { json: 'day_rem_cnt', js: 'day_rem_cnt', typ: u(undefined, '') },
    ], false),
};
