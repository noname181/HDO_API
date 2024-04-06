/**
 * Created by inju on 2023-09-26.
 * emailService
 */
'use strict';
const axios = require('axios');
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');

module.exports = {
    path: ['/easypaySettlement'],
    method: 'post',
    checkToken: false,
    roles: [USER_ROLE.ALL],
    service: service,
    validator: validator,
    errorHandler: errorHandler,
};

async function service(_request, _response, next) {
    const API_URL = 'https://office.easypay.co.kr/mcht/api/DesaMainAction.do';
    // TEST URL
    //const API_URL = 'http://testoffice.easypay.co.kr/mcht/api/DesaMainAction.do';

    const requestData = _request.body;
    console.log(requestData);

    try {
        const response = await axios.post(
            API_URL,
            {
                to_dt: requestData.to_dt,
                desa_id: requestData.desa_id,
                private_key: requestData.private_key,
                data_type: requestData.data_type,
                page_no: requestData.page_no,
            },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                transformRequest: [
                    (data) => {
                        return Object.entries(data)
                            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                            .join('&');
                    },
                ],
            }
        );

        if (requestData.data_type === '01') {
            handleTransactionData(response.data);
        } else if (requestData.data_type === '02') {
            handleSettlementData(response.data);
        }

        _response.json(response.data);
    } catch (error) {
        console.error('API 호출 오류:', error);
        next(error);
    }
}

// 거래내역 데이터 처리 함수
async function handleTransactionData(data) {
    const records = data.split('\n');
    for (let record of records) {
        const values = record.split('|');

        if (values[0] === 'T') {
            await models.TransactHistorySummary.create({
                // TransactHistorySummary 모델에 맞게 데이터 삽입
                recordType: values[0],
                totalRecords: BigInt(values[1]),
                totalPages: BigInt(values[2]),
                currentPage: BigInt(values[3]),
                totalApproved: BigInt(values[4]),
                totalApprovedAmount: BigInt(values[5]),
                totalCancellationCount: BigInt(values[6]),
                totalCancellationAmount: BigInt(values[7]),
                totalPointUsageCount: BigInt(values[8]),
                totalPointUsageAmount: BigInt(values[9]),
                totalPointCancellationCount: BigInt(values[10]),
                totalPointCancellationAmount: BigInt(values[11]),
                totalPointAccumulationCount: BigInt(values[12]),
                totalPointAccumulationAmount: BigInt(values[13]),
                totalPointAccumulationCancellationCount: BigInt(values[14]),
                totalPointAccumulationCancellationAmount: BigInt(values[15]),
                totalVatApproved: BigInt(values[16]),
                totalVatCanceled: BigInt(values[17]),
                totalServiceFeeApproved: BigInt(values[18]),
                totalServiceFeeCanceled: BigInt(values[19]),
                reservedField1: 0,
                reservedField2: 0,
            });
        } else if (values[0] === 'D') {
            await models.TransactHistoryRecord.create({
                // TransactHistoryRecord 모델에 맞게 데이터 삽입
                recordType: values[0], // 'D'
                paymentMethod: values[1],
                merchantId: values[2],
                settlementDueDate: values[3],
                transactionType: values[4],
                transactionDate: parseInt(values[5], 10),
                originalTransactionDate: parseInt(values[6], 10),
                uniqueTransactionId: parseInt(values[7], 10),
                merchantTransactionId: parseInt(values[8], 10),
                issuer: values[9],
                purchaser: values[10],
                approvalNumber: parseInt(values[11], 10),
                transactionAmount: BigInt(values[12]),
                pgFee: BigInt(values[13]),
                additionalFee: BigInt(values[14]),
                totalFee: BigInt(values[15]),
                VAT: BigInt(values[16]),
                settlementAmount: BigInt(values[17]),
                productName: values[18],
                cancellationTransactionNumber: values[19],
            });
        }
    }
}

// 정산 데이터 처리 함수
async function handleSettlementData(data) {
    const records = data.split('\n');
    for (let record of records) {
        const values = record.split('|');

        if (values[0] === 'T') {
            await models.TransactSettlementSummary.create({
                // TransactSettlementSummary 모델에 맞게 데이터 삽입
            });
        } else if (values[0] === 'D') {
            await models.TransactSettlementRecord.create({
                // TransactSettlementRecord 모델에 맞게 데이터 삽입
                recordType: values[0],
                paymentMethod: values[1],
                merchantId: values[2],
                settlementDueDate: values[3],
                transactionType: values[4],
                transactionDate: parseInt(values[5], 10),
                originalTransactionDate: parseInt(values[6], 10),
                uniqueTransactionId: parseInt(values[7], 10),
                merchantTransactionId: parseInt(values[8], 10),
                issuer: values[9],
                purchaser: values[10],
                approvalNumber: parseInt(values[11], 10),
                transactionAmount: BigInt(values[12]),
                pgFee: BigInt(values[13]),
                additionalFee: BigInt(values[14]),
                totalFee: BigInt(values[15]),
                VAT: BigInt(values[16]),
                settlementAmount: BigInt(values[17]),
                productName: values[18],
                cancellationTransactionNumber: values[19],
            });
        }
    }
}

function validator(_request, _response, next) {
    next();
}

function errorHandler(_error, _request, _response, next) {
    console.error(_error);
    _response.status(500).json({ error: '서버 내부 오류' });
}
