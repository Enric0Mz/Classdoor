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
        parameters: [
          { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 }, description: "Page number" },
          { name: "limit", in: "query", required: false, schema: { type: "integer", default: 10, maximum: 100 }, description: "Number of items per page" },
        ],
        responses: {
          200: {
            description: "A paginated list of universities",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/University" } },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
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
        description: "Returns university details, aggregate review stats, and the full list of reviews with author info. Reviews are included in a single query to avoid N+1.",
        responses: {
          200: {
            description: "University found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UniversityDetail" },
              },
            },
          },
          404: {
            description: "University not found",
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
      put: {
        tags: ["Universities"],
        summary: "Update a university",
        description: "Requires ADMIN role.",
        security: [{ BearerAuth: [] }],
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
          401: { description: "Authentication required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          403: { description: "Forbidden: ADMIN role required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Universities"],
        summary: "Delete a university",
        description: "Requires ADMIN role.",
        security: [{ BearerAuth: [] }],
        responses: {
          501: { description: "Not implemented" },
          401: { description: "Authentication required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          403: { description: "Forbidden: ADMIN role required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/v1/reviews": {
      get: {
        tags: ["Reviews"],
        summary: "List all reviews",
        parameters: [
          { name: "universityId", in: "query", required: false, schema: { type: "string", format: "uuid" }, description: "Filter reviews by university ID" },
          { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 }, description: "Page number" },
          { name: "limit", in: "query", required: false, schema: { type: "integer", default: 10, maximum: 100 }, description: "Number of items per page" },
        ],
        responses: {
          200: {
            description: "A paginated list of reviews",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Review" } },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
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
        tags: ["Reviews"],
        summary: "Create a review",
        description: "Requires authentication. Only registered users can submit reviews.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["rating", "difficultyLevel", "universityId"],
                properties: {
                  rating: { type: "integer", minimum: 1, maximum: 5, example: 4 },
                  comment: { type: "string", nullable: true, example: "Great university" },
                  difficultyLevel: {
                    type: "integer",
                    minimum: 1,
                    maximum: 5,
                    example: 3,
                  },
                  universityId: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Review created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    review: { $ref: "#/components/schemas/Review" },
                  },
                },
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
          200: {
            description: "Review found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Review" },
              },
            },
          },
          404: {
            description: "Review not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Reviews"],
        summary: "Update a review",
        description: "Requires authentication. Only the author can update their own review.",
        security: [{ BearerAuth: [] }],
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
          200: {
            description: "Review updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Review" },
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
            description: "Forbidden: not the author of this review",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Review not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Reviews"],
        summary: "Delete a review",
        description: "Requires authentication. Only the author can delete their own review.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Review deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { message: { type: "string" } },
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
            description: "Forbidden: not the author of this review",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Review not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "List all users",
        description: "Requires ADMIN or MODERATOR role.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 }, description: "Page number" },
          { name: "limit", in: "query", required: false, schema: { type: "integer", default: 10, maximum: 100 }, description: "Number of items per page" },
        ],
        responses: {
          200: {
            description: "A paginated list of users",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/User" } },
                    pagination: { $ref: "#/components/schemas/Pagination" },
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
        description:
          "All fields are optional. Omitting `email` and `password` creates an anonymous account with an auto-generated username.",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    nullable: true,
                    example: "user@example.com",
                  },
                  password: {
                    type: "string",
                    minLength: 8,
                    maxLength: 40,
                    nullable: true,
                    example: "Secret1!",
                    description: "8-40 characters. Must include at least one uppercase letter, one lowercase letter, one number, and one symbol.",
                  },
                  username: {
                    type: "string",
                    nullable: true,
                    example: "BravoCapivara347",
                    description: "Optional. Auto-generated if not provided.",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered (email or anonymous)",
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
            description: "Email or username already exists",
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
        description: "Pass your email address or username in the `identifier` field together with `password`.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["identifier", "password"],
                properties: {
                  identifier: {
                    type: "string",
                    example: "user@example.com",
                    description: "Your email address or username.",
                  },
                  password: {
                    type: "string",
                    example: "Secret1!",
                  },
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
      get: {
        tags: ["Users"],
        summary: "Get the authenticated user's profile",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Authenticated user found",
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
        summary: "Delete the authenticated user's account",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Account deleted",
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
        },
      },
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
                  password: {
                    type: "string",
                    minLength: 8,
                    maxLength: 40,
                    description: "8-40 characters. Must include at least one uppercase letter, one lowercase letter, one number, and one symbol.",
                  },
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
    "/api/v1/users/me/email/verify": {
      get: {
        tags: ["Users"],
        summary: "Verify account email via token",
        description: "Public endpoint. Follow the link sent to your email after registration. On success the account is marked as emailVerified.",
        parameters: [
          {
            name: "token",
            in: "query",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "The verification token received by email",
          },
        ],
        responses: {
          200: {
            description: "Email verified successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { message: { type: "string" } },
                },
              },
            },
          },
          400: {
            description: "Missing or expired token",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          404: {
            description: "Token not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Resend email verification",
        description: "Requires authentication. Sends a new verification email to the account's registered email address.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Verification email sent",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { message: { type: "string" } },
                },
              },
            },
          },
          400: {
            description: "Account has no email address",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          401: {
            description: "Authentication required",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/v1/users/me/university-email": {
      post: {
        tags: ["Users"],
        summary: "Submit a university email for verification",
        description:
          "Requires authentication. Not available for anonymous accounts (accounts without a registered email).",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["universityEmail"],
                properties: {
                  universityEmail: {
                    type: "string",
                    format: "email",
                    example: "joao.silva@uni.br",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Verification email sent",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { message: { type: "string" } },
                },
              },
            },
          },
          400: {
            description: "Missing or invalid universityEmail",
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
            description: "Forbidden: anonymous accounts cannot verify a university email",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/me/university-email/verify": {
      get: {
        tags: ["Users"],
        summary: "Verify a university email token",
        description:
          "Public endpoint. Follow the link sent to the university email. On success, the user is marked as `verified`.",
        parameters: [
          {
            name: "token",
            in: "query",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "The verification token received by email",
          },
        ],
        responses: {
          200: {
            description: "University email verified successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { message: { type: "string" } },
                },
              },
            },
          },
          400: {
            description: "Missing token or token expired",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Token not found",
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
        description:
          "Requires authentication. USERs can only fetch their own profile. ADMIN and MODERATOR can fetch any user.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "User found",
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
          403: {
            description: "Forbidden: USER can only access their own profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
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
        summary: "Deactivate a user by ID",
        description: "Requires ADMIN role. Sets the user's active flag to false (soft delete). The user's data is preserved.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "User deactivated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { message: { type: "string" } },
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
            description: "Forbidden: ADMIN role required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
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
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          total: { type: "integer", example: 25 },
          totalPages: { type: "integer", example: 3 },
        },
      },
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
      UniversityStats: {
        type: "object",
        properties: {
          reviewCount: { type: "integer", example: 18 },
          averageRating: { type: "number", format: "float", nullable: true, example: 4.3 },
          averageDifficultyLevel: { type: "number", format: "float", nullable: true, example: 3.5 },
          recommendationPercentage: { type: "integer", nullable: true, example: 87, description: "Percentage of reviews with rating ≥ 4" },
        },
      },
      UniversityDetail: {
        allOf: [
          { $ref: "#/components/schemas/University" },
          {
            type: "object",
            properties: {
              stats: { $ref: "#/components/schemas/UniversityStats" },
              reviews: {
                type: "array",
                items: { $ref: "#/components/schemas/Review" },
              },
            },
          },
        ],
      },
      Review: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          rating: { type: "integer" },
          comment: { type: "string", nullable: true },
          difficultyLevel: { type: "integer" },
          universityId: { type: "string", format: "uuid" },
          authorId: { type: "string", format: "uuid", nullable: true },
          author: {
            nullable: true,
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              username: { type: "string" },
              verified: { type: "boolean" },
            },
          },
          editToken: {
            type: "string",
            format: "uuid",
            nullable: true,
            description: "Only present in the creation response for unauthenticated reviews.",
          },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email", nullable: true },
          username: { type: "string", example: "BravoCapivara347" },
          universityEmail: { type: "string", format: "email", nullable: true },
          verified: { type: "boolean", example: false },
          emailVerified: { type: "boolean", example: false },
          active: { type: "boolean", example: true },
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
