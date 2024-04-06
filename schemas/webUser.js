const WebUserResponse = {
  type: "object",
  properties: {
    status: {
      type: "string",
      example: "200",
    },
    result: {
      type: "object",
      properties: {
        id: {
          type: "string",
          example: "4c42310c-f49f-4c0d-a868-70dd766518fb",
        },
        accountId: {
          type: "string",
          example: "test@test",
        },
        retired: {
          type: "number",
          example: 1,
        },
        dept: {
          type: "string",
          example: "dept test",
        },
        name: {
          type: "string",
          example: "name test",
        },
        currentAccessDateTime: {
          type: "string",
          example: new Date().toISOString(),
        },
        phoneNo: {
          type: "string",
          example: "phoneNo test",
        },
        role: {
          type: "string",
          example: "VIEWER"
        },
        orgId: {
          type: "number",
          example: 2,
        },
        createdAt: {
          type: "string",
          example: new Date().toISOString(),
        },
        updatedAt: {
          type: "string",
          example: new Date().toISOString(),
        }
      }
    }
  },
};

const UpdateWebUserPayload = {
  ...WebUserResponse.properties.result,
}

const HdoUserRegisterPayload = {
  type: "object",
  required: ["accountId", "password", "dept", "name", "phoneNo", "role", "orgId", "password"],
  properties: {
    accountId: {
      type: "string",
      example: "test@test",
    },
    dept: {
      type: "string",
      example: "dept test",
    },
    name: {
      type: "string",
      example: "name test",
    },
    phoneNo: {
      type: "string",
      example: "phoneNo test",
    },
    role: {
      type: "string",
      example: "VIEWER"
    },
    orgId: {
      type: "number",
      example: 2,
    },
    password: {
      type: "string",
      example: "test@test123"
    }
  }
}

const HdoUserUpdatePayload = {
  type: "object",
  properties: {
    email: {
      type: "string",
      example: "test@test"
    },
    password: {
      type: "string",
      example: "test@test123"
    }
  }
}

const ExternalUserRegisterConfirmPayload = {
  type: "object",
  required: ["accountId", "regId", "password"],
  properties: {
    accountId: {
      type: "string",
      example: "test@test"
    },
    regId: {
      type: "string",
      example: "1"
    },
    password: {
      type: "string",
      example: "test@test123"
    }
  }
}

const ExternalUserRegisterPayload = {
  type: "object",
  required: ["accountId", "name", "orgId", "phoneNo"],
  properties: {
    accountId: {
      type: "string",
      example: "test@test"
    },
    name: {
      type: "string",
      example: "test@test"
    },
    orgId: {
      type: "string",
      example: "1"
    },
    phoneNo: {
      type: "string",
      example: "1343423423"
    },
  }
}

module.exports = {
  WebUserResponse,
  UpdateWebUserPayload,
  HdoUserRegisterPayload,
  HdoUserUpdatePayload,
  ExternalUserRegisterConfirmPayload,
  ExternalUserRegisterPayload,
}