const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Classdoor API",
    version: "0.1.0",
    description: "API for university reviews and ratings",
  },
  servers: [{ url: "/", description: "V1 API" }],
  paths: {
    "/api/v1/health": {
      get: {
        tags: ["Health"],
        summary: "Check application health",
        description:
          "Returns the overall status of the application, including server uptime and database connectivity.",
        responses: {
          200: {
            description: "Application is healthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Health" },
              },
            },
          },
          503: {
            description: "Application is unhealthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Health" },
              },
            },
          },
        },
      },
    },
    "/api/v1/universities": {
      get: {
        tags: ["Universities"],
        summary: "List all universities",
        parameters: [
          {
            name: "page",
            in: "query",
            required: false,
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", default: 10, maximum: 100 },
            description: "Number of items per page",
          },
        ],
        responses: {
          200: {
            description: "A paginated list of universities",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/University" },
                    },
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
        description:
          "Returns university details, aggregate review stats, and the full list of reviews with author info. Reviews are included in a single query to avoid N+1.",
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
        },
      },
      delete: {
        tags: ["Universities"],
        summary: "Delete a university",
        description: "Requires ADMIN role.",
        security: [{ BearerAuth: [] }],
        responses: {
          501: { description: "Not implemented" },
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
        },
      },
    },
    "/api/v1/reviews": {
      get: {
        tags: ["Reviews"],
        summary: "List all reviews",
        parameters: [
          {
            name: "universityId",
            in: "query",
            required: false,
            schema: { type: "string", format: "uuid" },
            description: "Filter reviews by university ID",
          },
          {
            name: "page",
            in: "query",
            required: false,
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", default: 10, maximum: 100 },
            description: "Number of items per page",
          },
        ],
        responses: {
          200: {
            description: "A paginated list of reviews",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Review" },
                    },
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
        description:
          "Requires authentication. Only registered users can submit reviews.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "rating",
                  "difficultyLevel",
                  "universityId",
                  "comment",
                ],
                properties: {
                  rating: {
                    type: "integer",
                    minimum: 1,
                    maximum: 5,
                    example: 4,
                  },
                  comment: {
                    type: "string",
                    minLength: 10,
                    maxLength: 2000,
                    example: "Great university overall!",
                  },
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
        description:
          "Requires authentication. Only the author can update their own review.",
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
        description:
          "Requires authentication. Only the author can delete their own review.",
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
    "/api/v1/courses": {
      get: {
        tags: ["Courses"],
        summary: "List all courses",
        parameters: [
          {
            name: "page",
            in: "query",
            required: false,
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", default: 10, maximum: 100 },
            description: "Number of items per page",
          },
          {
            name: "category",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter courses by category",
          },
        ],
        responses: {
          200: {
            description: "A paginated list of courses",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Course" },
                    },
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
        tags: ["Courses"],
        summary: "Create a course",
        description: "Requires ADMIN role.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description", "link"],
                properties: {
                  title: { type: "string", example: "Introduction to CS" },
                  description: {
                    type: "string",
                    example: "A beginner course on computer science",
                  },
                  link: {
                    type: "string",
                    example: "https://example.com/cs101",
                  },
                  image: {
                    type: "string",
                    nullable: true,
                    example: "https://example.com/cs101.jpg",
                  },
                  price: {
                    type: "number",
                    format: "float",
                    nullable: true,
                    example: 99.9,
                  },
                  category: {
                    type: "string",
                    nullable: true,
                    example: "Technology",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Course created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Course" },
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
        },
      },
    },
    "/api/v1/courses/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        tags: ["Courses"],
        summary: "Get a course by ID",
        responses: {
          200: {
            description: "Course found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Course" },
              },
            },
          },
          404: {
            description: "Course not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Courses"],
        summary: "Update a course",
        description: "Requires ADMIN role.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  link: { type: "string" },
                  image: { type: "string", nullable: true },
                  price: { type: "number", format: "float", nullable: true },
                  category: { type: "string", nullable: true },
                  active: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Course updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Course" },
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
            description: "Course not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Courses"],
        summary: "Delete a course",
        description: "Requires ADMIN role.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Course deleted",
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
            description: "Course not found",
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
          {
            name: "page",
            in: "query",
            required: false,
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", default: 10, maximum: 100 },
            description: "Number of items per page",
          },
        ],
        responses: {
          200: {
            description: "A paginated list of users",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/User" },
                    },
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
                    description:
                      "8-40 characters. Must include at least one uppercase letter, one lowercase letter, one number, and one symbol.",
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
        tags: ["Sessions"],
        summary: "Log in a user",
        description:
          "Pass your email address or username in the `identifier` field together with `password`.",
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
    "/api/v1/users/refresh": {
      post: {
        tags: ["Sessions"],
        summary: "Refresh access token",
        description:
          "Exchange a valid refresh token for a new access token and a rotated refresh token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: {
                  refreshToken: {
                    type: "string",
                    description:
                      "The refresh token received from login or a previous refresh.",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "New tokens issued",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                      description: "New short-lived access token (JWT).",
                    },
                    refreshToken: {
                      type: "string",
                      description: "New rotated refresh token.",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Refresh token not provided",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Invalid or expired refresh token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/logout": {
      post: {
        tags: ["Sessions"],
        summary: "Log out a user",
        description:
          "Invalidates the provided refresh token so it can no longer be used. Requires a valid access token.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: {
                  refreshToken: {
                    type: "string",
                    description: "The refresh token to invalidate.",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Logged out successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Logged out successfully",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Refresh token not provided",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Invalid refresh token",
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
                    description:
                      "8-40 characters. Must include at least one uppercase letter, one lowercase letter, one number, and one symbol.",
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
      put: {
        tags: ["Users"],
        summary: "Verify account email via token",
        description:
          "Public endpoint. Called automatically by the /verify-email page after a user clicks the link in their inbox. On success the account is marked as emailVerified.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token"],
                properties: {
                  token: {
                    type: "string",
                    format: "uuid",
                    description: "The verification token received by email",
                  },
                },
              },
            },
          },
        },
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
      post: {
        tags: ["Users"],
        summary: "Resend email verification",
        description:
          "Requires authentication. Sends a new verification email to the account's registered email address.",
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
            description:
              "Forbidden: anonymous accounts cannot verify a university email",
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
      post: {
        tags: ["Users"],
        summary: "Verify a university email token",
        description:
          "Public endpoint. Called automatically by the /verify-university-email page after a user clicks the link sent to their university inbox. On success, the user is marked as `verified`.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token"],
                properties: {
                  token: {
                    type: "string",
                    format: "uuid",
                    description: "The verification token received by email",
                  },
                },
              },
            },
          },
        },
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
        summary: "Delete a user by ID",
        description:
          "Requires ADMIN role. Permanently deletes the user account.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "User deleted",
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
      Health: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["healthy", "unhealthy"],
            example: "healthy",
          },
          uptime: {
            type: "integer",
            description: "Server uptime in seconds",
            example: 12345,
          },
          database: {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["healthy", "unhealthy"],
                example: "healthy",
              },
              activeConnections: { type: "integer", example: 5 },
            },
          },
        },
      },
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
          averageRating: {
            type: "number",
            format: "float",
            nullable: true,
            example: 4.3,
          },
          averageDifficultyLevel: {
            type: "number",
            format: "float",
            nullable: true,
            example: 3.5,
          },
          recommendationPercentage: {
            type: "integer",
            nullable: true,
            example: 87,
            description: "Percentage of reviews with rating ≥ 4",
          },
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
            description:
              "Only present in the creation response for unauthenticated reviews.",
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
          role: { type: "string", enum: ["USER", "MODERATOR", "ADMIN"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          token: {
            type: "string",
            description: "Short-lived access token (JWT, 15 min).",
          },
          refreshToken: {
            type: "string",
            description:
              "Long-lived refresh token (7 days). Use POST /api/v1/users/refresh to renew.",
          },
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
      Course: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string" },
          image: { type: "string", nullable: true },
          link: {
            type: "string",
            description: "External affiliate/enrollment URL",
          },
          price: { type: "number", format: "float", nullable: true },
          category: { type: "string", nullable: true },
          active: { type: "boolean" },
          createdBy: { type: "string", format: "uuid", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
};

export default swaggerSpec;
