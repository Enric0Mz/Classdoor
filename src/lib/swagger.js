const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Classdoor API",
    version: "0.1.0",
    description: "API for university reviews and ratings",
  },
  servers: [{ url: "/api/v1", description: "V1 API" }],
  paths: {
    "/universities": {
      get: {
        tags: ["Universities"],
        summary: "List all universities",
        responses: {
          200: {
            description: "A list of universities",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/University" },
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Universities"],
        summary: "Create a university",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "location"],
                properties: {
                  name: { type: "string", example: "MIT" },
                  location: {
                    type: "string",
                    example: "Cambridge, MA",
                  },
                  website: {
                    type: "string",
                    nullable: true,
                    example: "https://mit.edu",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "University created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/University" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          409: {
            description: "University already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/universities/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        tags: ["Universities"],
        summary: "Get a university by ID",
        responses: {
          501: { description: "Not implemented" },
        },
      },
      put: {
        tags: ["Universities"],
        summary: "Update a university",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  location: { type: "string" },
                  website: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          501: { description: "Not implemented" },
        },
      },
      delete: {
        tags: ["Universities"],
        summary: "Delete a university",
        responses: {
          501: { description: "Not implemented" },
        },
      },
    },
    "/reviews": {
      get: {
        tags: ["Reviews"],
        summary: "List all reviews",
        responses: {
          501: { description: "Not implemented" },
        },
      },
      post: {
        tags: ["Reviews"],
        summary: "Create a review",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["rating", "difficultyLevel", "universityId"],
                properties: {
                  rating: { type: "integer", minimum: 1, maximum: 5 },
                  comment: { type: "string", nullable: true },
                  difficultyLevel: {
                    type: "integer",
                    minimum: 1,
                    maximum: 5,
                  },
                  universityId: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: {
          501: { description: "Not implemented" },
        },
      },
    },
    "/reviews/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        tags: ["Reviews"],
        summary: "Get a review by ID",
        responses: {
          501: { description: "Not implemented" },
        },
      },
      put: {
        tags: ["Reviews"],
        summary: "Update a review",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  rating: { type: "integer", minimum: 1, maximum: 5 },
                  comment: { type: "string", nullable: true },
                  difficultyLevel: {
                    type: "integer",
                    minimum: 1,
                    maximum: 5,
                  },
                },
              },
            },
          },
        },
        responses: {
          501: { description: "Not implemented" },
        },
      },
      delete: {
        tags: ["Reviews"],
        summary: "Delete a review",
        responses: {
          501: { description: "Not implemented" },
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List all users",
        responses: {
          501: { description: "Not implemented" },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          501: { description: "Not implemented" },
        },
      },
    },
    "/users/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        tags: ["Users"],
        summary: "Get a user by ID",
        responses: {
          501: { description: "Not implemented" },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Update a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          501: { description: "Not implemented" },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete a user",
        responses: {
          501: { description: "Not implemented" },
        },
      },
    },
  },
  components: {
    schemas: {
      University: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          location: { type: "string" },
          website: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Review: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          rating: { type: "integer" },
          comment: { type: "string", nullable: true },
          difficultyLevel: { type: "integer" },
          universityId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
              statusCode: { type: "integer" },
            },
          },
        },
      },
    },
  },
};

export default swaggerSpec;
