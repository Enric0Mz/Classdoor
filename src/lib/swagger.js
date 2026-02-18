const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Classdoor API",
    version: "0.1.0",
    description: "API for university reviews and ratings",
  },
  servers: [{ url: "/", description: "V1 API" }],
  paths: {
    "/api/v1/universities": {
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
        description: "Requires ADMIN role.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "location", "type"],
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
                  image: {
                    type: "string",
                    nullable: true,
                    example: "https://example.com/mit.jpg",
                  },
                  type: {
                    type: "string",
                    enum: ["PUBLIC", "PRIVATE"],
                    example: "PRIVATE",
                  },
                  courses: {
                    type: "array",
                    items: { type: "string" },
                    example: ["Business", "Economics"],
                  },
                  rating: {
                    type: "number",
                    format: "float",
                    nullable: true,
                    example: 4.5,
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
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          403: {
            description: "Forbidden: ADMIN role required",
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
    "/api/v1/universities/{id}": {
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
                  image: { type: "string", nullable: true },
                  type: { type: "string", enum: ["PUBLIC", "PRIVATE"] },
                  courses: { type: "array", items: { type: "string" } },
                  rating: { type: "number", format: "float", nullable: true },
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
    "/api/v1/reviews": {
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
    "/api/v1/reviews/{id}": {
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
    "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "List all users",
        description: "Requires ADMIN or MODERATOR role.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "A list of users",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          403: {
            description: "Forbidden: ADMIN or MODERATOR role required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
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
        tags: ["Users"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                  password: { type: "string", minLength: 8, example: "secret123" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
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
            description: "Email already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/login": {
      post: {
        tags: ["Users"],
        summary: "Log in a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                  password: { type: "string", minLength: 8, example: "secret123" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
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
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/me": {
      put: {
        tags: ["Users"],
        summary: "Update the authenticated user",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "User updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/{id}": {
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
          200: {
            description: "User found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete a user",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "User deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      University: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          location: { type: "string" },
          website: { type: "string", nullable: true },
          image: { type: "string", nullable: true },
          type: { type: "string", enum: ["PUBLIC", "PRIVATE"] },
          courses: { type: "array", items: { type: "string" } },
          rating: { type: "number", format: "float", nullable: true },
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
          role: { type: "string", enum: ["USER", "MODERATOR", "ADMIN"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          token: { type: "string" },
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
