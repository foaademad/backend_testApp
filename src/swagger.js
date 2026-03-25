const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Daily Counter API",
    version: "1.0.0",
    description: "REST API documentation for Daily Counter backend.",
  },
  servers: [
    {
      url: process.env.PUBLIC_API_BASE_URL || "http://localhost:4000",
      description: "Current API server",
    },
  ],
  tags: [
    { name: "Health", description: "Service health endpoints" },
    { name: "Counters", description: "Counter CRUD and mutation endpoints" },
    { name: "Stats", description: "Application-level statistics endpoints" },
  ],
  components: {
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: {},
        },
      },
      Counter: {
        type: "object",
        properties: {
          id: { type: "string", example: "66c8e2e4f6a86c4ddfa637a1" },
          deviceId: { type: "string", example: "device-123" },
          title: { type: "string", example: "Water glasses" },
          icon: { type: "string", example: "water-outline" },
          color: { type: "string", example: "#2563EB" },
          dailyGoal: { type: "integer", minimum: 1, example: 8 },
          currentValue: { type: "integer", minimum: 0, example: 2 },
          isArchived: { type: "boolean", example: false },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CounterHistory: {
        type: "object",
        properties: {
          _id: { type: "string", example: "66c8e2e4f6a86c4ddfa637b9" },
          counterId: { type: "string", example: "66c8e2e4f6a86c4ddfa637a1" },
          deviceId: { type: "string", example: "device-123" },
          date: { type: "string", example: "2026-03-15" },
          value: { type: "integer", minimum: 0, example: 5 },
          goal: { type: "integer", minimum: 1, example: 8 },
          completed: { type: "boolean", example: false },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Stats: {
        type: "object",
        properties: {
          totalCounters: { type: "integer", example: 3 },
          completedToday: { type: "integer", example: 1 },
          totalCountToday: { type: "integer", example: 13 },
        },
      },
      CreateCounterRequest: {
        type: "object",
        required: ["deviceId", "title", "icon", "color", "dailyGoal"],
        properties: {
          deviceId: { type: "string", example: "device-123" },
          title: { type: "string", minLength: 2, maxLength: 50 },
          icon: { type: "string", example: "apps-outline" },
          color: { type: "string", example: "#2563EB" },
          dailyGoal: { type: "integer", minimum: 1, example: 10 },
          currentValue: { type: "integer", minimum: 0, example: 0 },
        },
      },
      UpdateCounterRequest: {
        type: "object",
        required: ["deviceId"],
        properties: {
          deviceId: { type: "string", example: "device-123" },
          title: { type: "string", minLength: 2, maxLength: 50 },
          icon: { type: "string" },
          color: { type: "string" },
          dailyGoal: { type: "integer", minimum: 1 },
          currentValue: { type: "integer", minimum: 0 },
          isArchived: { type: "boolean" },
        },
      },
      MutateCounterRequest: {
        type: "object",
        required: ["deviceId"],
        properties: {
          deviceId: { type: "string", example: "device-123" },
          amount: { type: "integer", minimum: 1, example: 1 },
        },
      },
      ErrorResponse: {
        allOf: [
          { $ref: "#/components/schemas/ApiResponse" },
          {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: { type: "string", example: "Validation error message." },
              data: { type: "object", example: {} },
            },
          },
        ],
      },
    },
    parameters: {
      DeviceIdQuery: {
        name: "deviceId",
        in: "query",
        required: true,
        schema: { type: "string" },
        description: "Unique client device identifier.",
      },
      CounterIdPath: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Counter MongoDB ObjectId.",
      },
      LimitQuery: {
        name: "limit",
        in: "query",
        required: false,
        schema: { type: "integer", minimum: 1, maximum: 100, default: 30 },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check service health",
        responses: {
          200: {
            description: "Service is healthy.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            status: { type: "string", example: "ok" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/counters": {
      post: {
        tags: ["Counters"],
        summary: "Create a counter",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCounterRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Counter created.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/Counter" } },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      get: {
        tags: ["Counters"],
        summary: "Get all counters by device",
        parameters: [{ $ref: "#/components/parameters/DeviceIdQuery" }],
        responses: {
          200: {
            description: "Counters fetched.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Counter" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/counters/{id}": {
      get: {
        tags: ["Counters"],
        summary: "Get counter by id",
        parameters: [
          { $ref: "#/components/parameters/CounterIdPath" },
          { $ref: "#/components/parameters/DeviceIdQuery" },
        ],
        responses: {
          200: {
            description: "Counter fetched.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/Counter" } },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Counters"],
        summary: "Update counter",
        parameters: [{ $ref: "#/components/parameters/CounterIdPath" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCounterRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Counter updated.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/Counter" } },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Counters"],
        summary: "Delete counter",
        parameters: [
          { $ref: "#/components/parameters/CounterIdPath" },
          { $ref: "#/components/parameters/DeviceIdQuery" },
        ],
        responses: {
          200: {
            description: "Counter deleted.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/counters/{id}/increment": {
      patch: {
        tags: ["Counters"],
        summary: "Increment counter value",
        parameters: [{ $ref: "#/components/parameters/CounterIdPath" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MutateCounterRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Counter incremented.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/Counter" } },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/counters/{id}/decrement": {
      patch: {
        tags: ["Counters"],
        summary: "Decrement counter value",
        parameters: [{ $ref: "#/components/parameters/CounterIdPath" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MutateCounterRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Counter decremented.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/Counter" } },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/counters/{id}/reset": {
      patch: {
        tags: ["Counters"],
        summary: "Reset counter value to zero",
        parameters: [{ $ref: "#/components/parameters/CounterIdPath" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MutateCounterRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Counter reset.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/Counter" } },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/counters/{id}/history": {
      get: {
        tags: ["Counters"],
        summary: "Get counter history",
        parameters: [
          { $ref: "#/components/parameters/CounterIdPath" },
          { $ref: "#/components/parameters/DeviceIdQuery" },
          { $ref: "#/components/parameters/LimitQuery" },
        ],
        responses: {
          200: {
            description: "Counter history fetched.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/CounterHistory" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/stats": {
      get: {
        tags: ["Stats"],
        summary: "Get app statistics for a device",
        parameters: [{ $ref: "#/components/parameters/DeviceIdQuery" }],
        responses: {
          200: {
            description: "Stats fetched.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/Stats" } },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerDocument;
