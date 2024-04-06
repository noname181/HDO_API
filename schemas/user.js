const MobileUser = {
  type: "object",
  properties: {
    id: {
      type: "string",
      example: "9g22310c-f49f-4c0d-a868-70dd766518fb",
    },
    name: {
      type: "string",
      example: "Mobile User",
    },
    accountId: {
      type: "string",
      example: "test1@test.com",
    },
    orgId: {
      type: "integer",
      example: 3,
    },
  },
};

const CreatedWho = {
  type: "object",
  properties: {
    id: {
      type: "string",
      example: "4c42310c-f49f-4c0d-a868-70dd766518fb",
    },
    name: {
      type: "string",
      example: "Test",
    },
    accountId: {
      type: "string",
      example: "test@test.com",
    },
    retired: {
      type: "boolean",
      example: true,
    },
    orgId: {
      type: "integer",
      example: 2,
    },
  },
};

const SignInPayload = {
  type: "object",
  required: ["accountId", "password"],
  properties: {
    accountId: {
      type: "string",
      example: "test@test",
    },
    password: {
      type: "string",
      example: "test@test123",
    },
  },
};

const SignUpPayload = {
  type: "object",
  required: ["accountId", "password", "pass"],
  properties: {
    accountId: {
      type: "string",
      example: "test@test",
    },
    pass: {
      type: "object",
      properties: {
        name: {
          type: "string",
          example: "test",
        },
        phoneNo: {
          type: "string",
          example: "464679798",
        },
      },
    },
    password: {
      type: "string",
      example: "test@test123",
    },
  },
};

const UpdateUserPayload = {
  type: "object",
  required: [],
  properties: {
    accountId: {
      type: "string",
      example: "test@test",
    },
    status: {
      type: "string",
      example: "SLEEP",
    },
    membershipNo: {
      type: "string",
      example: "2",
    },
    idVerified: {
      type: "number",
      example: 1,
    },
    pwdChgRequired: {
      type: "number",
      example: 1,
    },
    name: {
      type: "string",
      example: "test updated",
    },
    phoneNo: {
      type: "string",
      example: "453453453",
    },
    email: {
      type: "string",
      example: "test updated",
    },
    deviceId: {
      type: "string",
      example: "342344534534",
    },
    userAgreements: {
      type: "string",
      example: "test",
    },
    currentAccessDateTime: {
      type: "string",
      example: new Date().toISOString(),
    },
  },
};

const SignUpUserBiz = {
  type: "object",
  required: ["accountId", "password", "name", "orgId", "password", "phoneNo"],
  properties: {
    accountId: {
      type: "string",
      example: "test@test",
    },
    name: {
      type: "string",
      example: "test name",
    },
    orgId: {
      type: "string",
      example: "test orgId",
    },
    password: {
      type: "string",
      example: "test@test123",
    },
    phoneNo: {
      type: "string",
      example: "test phoneNo",
    },
  },
};

const UserResponseWithAuth = {
  type: "object",
  properties: {
    id: {
      type: "string",
      example: "970945dd-10a8-43d6-a933-f55c95a9f670",
    },
    accountId: {
      type: "string",
      example: "lhhoang5",
    },
    status: {
      type: "string",
      example: "ACTIVE",
    },
    nfcMembershipNo: {
      type: "number",
      example: null,
    },
    physicalCardNo: {
      type: "number",
      example: null,
    },
    idVerified: {
      type: "boolean",
      example: true,
    },
    pwdChgRequired: {
      type: "boolean",
      example: false,
    },
    name: {
      type: "string",
      example: "Pew3vXyxrMTWzGuyUW5ceA==",
    },
    phoneNo: {
      type: "string",
      example: "Pew3vXyxrMTWzGuyUW5ceA==",
    },
    email: {
      type: "string",
      example: null,
    },
    subsDCPrice: {
      type: "number",
      example: 0,
    },
    deviceId: {
      type: "number",
      example: null,
    },
    userAgreements: {
      type: "string",
      example: null,
    },
    haveUnpaid: {
      type: "boolean",
      example: false,
    },
    currentAccessDateTime: {
      type: "string",
      example: "2023-08-16 11:45:09",
    },
    createdAt: {
      type: "string",
      example: "2023-08-16 11:45:09",
    },
    updatedAt: {
      type: "string",
      example: "2023-08-16 11:45:09",
    },
    orgId: {
      type: "number",
      example: 1,
    },
    accessToken: {
      type: "string",
      example:
        "eyJraWQiOiJwNEtzVXNCR3ZENmluSzVqZTQrRWY5Tm9xNXdEUzQzXC92eHZrM3hYblhZOD0iLCJhbGciOiJSUzI1NiJ9",
    },
    refreshToken: {
      type: "string",
      example:
        "eyJraWQiOiJwNEtzVXNCR3ZENmluSzVqZTQrRWY5Tm9xNXdEUzQzXC92eHZrM3hYblhZOD0iLCJhbGciOiJSUzI1NiJ9",
    },
  },
};

const UserResponse = {
  type: "object",
  properties: {
    id: {
      type: "string",
      example: "970945dd-10a8-43d6-a933-f55c95a9f670",
    },
    accountId: {
      type: "string",
      example: "lhhoang5",
    },
    status: {
      type: "string",
      example: "ACTIVE",
    },
    nfcMembershipNo: {
      type: "number",
      example: null,
    },
    physicalCardNo: {
      type: "number",
      example: null,
    },
    idVerified: {
      type: "boolean",
      example: true,
    },
    pwdChgRequired: {
      type: "boolean",
      example: false,
    },
    name: {
      type: "string",
      example: "Pew3vXyxrMTWzGuyUW5ceA==",
    },
    phoneNo: {
      type: "string",
      example: "Pew3vXyxrMTWzGuyUW5ceA==",
    },
    email: {
      type: "string",
      example: null,
    },
    subsDCPrice: {
      type: "number",
      example: 0,
    },
    deviceId: {
      type: "number",
      example: null,
    },
    userAgreements: {
      type: "string",
      example: null,
    },
    haveUnpaid: {
      type: "boolean",
      example: false,
    },
    currentAccessDateTime: {
      type: "string",
      example: "2023-08-16 11:45:09",
    },
    createdAt: {
      type: "string",
      example: "2023-08-16 11:45:09",
    },
    updatedAt: {
      type: "string",
      example: "2023-08-16 11:45:09",
    },
    orgId: {
      type: "number",
      example: 1,
    },
  },
};

module.exports = {
  MobileUser,
  CreatedWho,
  SignInPayload,
  SignUpPayload,
  UpdateUserPayload,
  SignUpUserBiz,
  UserResponseWithAuth,
  UserResponse,
};
