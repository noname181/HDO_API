const OrganizationCreatePayload = {
  type: "object",
  required: ["accountId", "name"],
  properties: {
    category: {
      type: "string",
      example: "org test 1"
    },
    name: {
      type: "string",
      example: "org test 1"
    },
  }
}

const OrganizationResponse = {
  type: "object",
  properties: {
    result: {
      type: "object",
      properties: {
        category: {
          type: "string",
          example: "org test 1"
        },
        name: {
          type: "string",
          example: "org test 1"
        },
      }
    }
  }
}

const OrganizationUpdatePayload = {
  type: "object",
  properties: {
    result: {
      type: "object",
      properties: {
        haveCarWash: {
          type: "string",
          example: "test"
        }
      }
    }
  }
}

module.exports = {
  OrganizationCreatePayload,
  OrganizationResponse,
  OrganizationUpdatePayload
}