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
          {
            name: "search",
            in: "query",
            required: false,
            schema: { type: "string" },
            description:
              "Search universities by name, abbreviation, location, or course",
          },
          {
            name: "type",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["PUBLIC", "PRIVATE"] },
            description: "Filter by university type",
          },
          {
            name: "state",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter by state abbreviation (e.g., SP, RJ)",
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
                  abbreviation: {
                    type: "string",
                    nullable: true,
                    example: "MIT",
                  },
                  location: {
                    type: "string",
                    example: "Cambridge, MA",
                  },
                  website: {
                    type: "string",
                    nullable: true,
                    example: "https://mit.edu",
                  },
                  images: {
                    type: "array",
                    items: { type: "string" },
                    example: [
                      "https://example.com/mit1.jpg",
                      "https://example.com/mit2.jpg",
                    ],
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
                  domain: {
                    type: "string",
                    nullable: true,
                    description:
                      "Email domain to link to this university (used for student verification)",
                    example: "mit.edu",
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
    "/api/v1/universities/bulk": {
      post: {
        tags: ["Universities"],
        summary: "Bulk create universities",
        description:
          "Creates multiple universities at once, including their email domains. Requires ADMIN role. Duplicate universities (by name) and domains are automatically skipped. Returns the count of newly created universities.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  required: ["name", "location", "type"],
                  properties: {
                    name: { type: "string", example: "MIT" },
                    abbreviation: {
                      type: "string",
                      nullable: true,
                      example: "MIT",
                    },
                    location: {
                      type: "string",
                      example: "Cambridge, MA, USA",
                    },
                    website: {
                      type: "string",
                      nullable: true,
                      example: "https://mit.edu",
                    },
                    images: {
                      type: "array",
                      items: { type: "string" },
                      example: [
                        "https://example.com/mit1.jpg",
                        "https://example.com/mit2.jpg",
                      ],
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
                      example: 0,
                    },
                    domain: {
                      type: "string",
                      nullable: true,
                      description:
                        "Email domain to link to this university (used for student verification)",
                      example: "mit.edu",
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Universities created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    created: {
                      type: "integer",
                      description: "Number of universities created",
                      example: 10,
                    },
                    skipped: {
                      type: "object",
                      properties: {
                        names: {
                          type: "array",
                          items: { type: "string" },
                          description:
                            "Names of universities that were skipped because they already exist",
                          example: ["MIT"],
                        },
                      },
                    },
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
                  abbreviation: { type: "string", nullable: true },
                  location: { type: "string" },
                  website: { type: "string", nullable: true },
                  images: {
                    type: "array",
                    items: { type: "string" },
                  },
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
          200: {
            description: "University deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "University deleted",
                    },
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
            description: "Forbidden: ADMIN role required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
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
        description:
          "Returns only approved reviews. Rejected reviews (offensive, nonsensical, or spam) are hidden from public listings.",
        responses: {
          200: {
            description: "A paginated list of approved reviews",
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
            description:
              "Review created. If the review was rejected by moderation, a `moderation` object is included with the reason.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    review: { $ref: "#/components/schemas/Review" },
                    moderation: {
                      $ref: "#/components/schemas/ModerationResult",
                      description:
                        "Only present when the review is rejected by content moderation.",
                    },
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
    "/api/v1/university-submissions": {
      get: {
        tags: ["University Submissions"],
        summary: "List university submissions",
        description:
          "Returns a paginated list of university submissions. Requires ADMIN or MODERATOR role. Supports filtering by status.",
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
          {
            name: "status",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["PENDING", "APPROVED", "REJECTED"],
            },
            description: "Filter by submission status",
          },
        ],
        responses: {
          200: {
            description: "List of submissions",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/UniversitySubmission",
                      },
                    },
                    pagination: {
                      $ref: "#/components/schemas/Pagination",
                    },
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
        },
      },
      post: {
        tags: ["University Submissions"],
        summary: "Create a university submission",
        description:
          "Allows a verified user to suggest a university to be added. Rate limited to 5 submissions per hour.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "type"],
                properties: {
                  name: { type: "string", description: "University name" },
                  type: {
                    type: "string",
                    enum: ["PUBLIC", "PRIVATE"],
                    description: "University type",
                  },
                  location: {
                    type: "string",
                    nullable: true,
                    description: "State abbreviation (e.g. SP, RJ)",
                  },
                  website: {
                    type: "string",
                    nullable: true,
                    description: "University website URL",
                  },
                  emailDomain: {
                    type: "string",
                    nullable: true,
                    description: "University email domain (e.g. usp.br)",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Submission created",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UniversitySubmission",
                },
              },
            },
          },
          400: {
            description: "Validation error (name or type missing/invalid)",
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
          409: {
            description:
              "University already exists or a pending submission with the same name exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          429: {
            description: "Rate limit exceeded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/v1/university-submissions/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        tags: ["University Submissions"],
        summary: "Get a university submission by ID",
        description: "Requires ADMIN or MODERATOR role.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Submission found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UniversitySubmission",
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
          404: {
            description: "Submission not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/v1/university-submissions/{id}/approve": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      put: {
        tags: ["University Submissions"],
        summary: "Approve a university submission",
        description:
          "Marks a pending submission as approved. Requires ADMIN role. Optionally links the submission to the created university via universityId.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  universityId: {
                    type: "string",
                    format: "uuid",
                    description:
                      "ID of the university created from this submission, for traceability",
                  },
                  emailDomain: {
                    type: "string",
                    nullable: true,
                    description:
                      "Email domain to link to the university (e.g. usp.br). If provided with universityId, creates a UniversityDomain record.",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Submission approved",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UniversitySubmission",
                },
              },
            },
          },
          400: {
            description: "Submission is not in PENDING status",
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
          404: {
            description: "Submission not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/v1/university-submissions/{id}/reject": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      put: {
        tags: ["University Submissions"],
        summary: "Reject a university submission",
        description:
          "Marks a pending submission as rejected with a reason. Requires ADMIN role.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["reason"],
                properties: {
                  reason: {
                    type: "string",
                    description: "Reason for rejecting the submission",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Submission rejected",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UniversitySubmission",
                },
              },
            },
          },
          400: {
            description:
              "Reason is required or submission is not in PENDING status",
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
          404: {
            description: "Submission not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/me/university-submissions": {
      get: {
        tags: ["University Submissions"],
        summary: "List current user's university submissions",
        description:
          "Returns a paginated list of submissions made by the authenticated user.",
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
            description: "List of user's submissions",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/UniversitySubmission",
                      },
                    },
                    pagination: {
                      $ref: "#/components/schemas/Pagination",
                    },
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
    },
    "/api/v1/users/me/reviews": {
      get: {
        tags: ["Reviews"],
        summary: "List current user's reviews",
        description:
          "Returns a paginated list of reviews made by the authenticated user, including all moderation statuses. Each review includes the university name.",
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
            description: "List of user's reviews",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Review" },
                    },
                    pagination: {
                      $ref: "#/components/schemas/Pagination",
                    },
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
    "/api/v1/cron/moderate-reviews": {
      post: {
        tags: ["Cron"],
        summary: "Process pending moderation queue",
        description:
          "Re-runs AI moderation on reviews stuck in PENDING_MODERATION status. Authenticated via CRON_SECRET in the Authorization header. Intended to be called by Vercel Cron Jobs every 5 minutes.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Processing stats",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    processed: {
                      type: "integer",
                      description: "Total pending reviews found",
                    },
                    succeeded: {
                      type: "integer",
                      description: "Reviews successfully moderated",
                    },
                    failed: {
                      type: "integer",
                      description:
                        "Reviews that failed (will retry next cycle)",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Invalid or missing CRON_SECRET",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/google": {
      get: {
        tags: ["Authentication"],
        summary: "Initiate Google OAuth login",
        description:
          "Redirects the user to Google's consent screen. After authorization, Google redirects back to the callback endpoint.",
        responses: {
          302: {
            description: "Redirect to Google OAuth consent screen",
          },
        },
      },
    },
    "/api/v1/auth/google/callback": {
      get: {
        tags: ["Authentication"],
        summary: "Google OAuth callback",
        description:
          "Handles the callback from Google after user authorization. Exchanges the authorization code for tokens, creates or links user accounts, and redirects to the frontend with JWT tokens.",
        parameters: [
          {
            name: "code",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Authorization code from Google",
          },
          {
            name: "state",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "CSRF state parameter for validation",
          },
        ],
        responses: {
          302: {
            description:
              "Redirect to frontend success page with tokens, or to login page on error",
          },
        },
      },
    },
    "/api/v1/external-reviews": {
      get: {
        tags: ["External Reviews"],
        summary: "List external reviews for a university",
        parameters: [
          {
            name: "universityId",
            in: "query",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "University ID to filter external reviews",
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
            description: "Items per page",
          },
        ],
        responses: {
          200: {
            description: "Paginated list of external reviews",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ExternalReview" },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
          400: {
            description: "Missing universityId parameter",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/v1/external-reviews/import": {
      post: {
        tags: ["External Reviews"],
        summary: "Import external reviews from scraper data",
        description:
          "Admin-only endpoint. Accepts an array of university entries with their Google Maps reviews.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  required: ["universityName", "reviews"],
                  properties: {
                    universityName: {
                      type: "string",
                      example: "Universidade de São Paulo",
                    },
                    reviews: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["rating", "url"],
                        properties: {
                          rating: {
                            type: "integer",
                            minimum: 1,
                            maximum: 5,
                          },
                          text: { type: "string" },
                          url: {
                            type: "string",
                            format: "uri",
                            example:
                              "https://maps.google.com/maps/contrib/123/reviews",
                          },
                          date: {
                            type: "string",
                            format: "date",
                            example: "2025-01-15",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Import summary",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    imported: {
                      type: "integer",
                      description: "Number of reviews imported",
                    },
                    skippedUniversities: {
                      type: "array",
                      items: { type: "string" },
                      description: "University names not found in database",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid payload",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          403: {
            description: "Forbidden — admin role required",
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
          abbreviation: { type: "string", nullable: true },
          location: { type: "string" },
          website: { type: "string", nullable: true },
          images: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                url: { type: "string" },
                universityId: { type: "string", format: "uuid" },
                createdAt: { type: "string", format: "date-time" },
              },
            },
          },
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
          moderationStatus: {
            type: "string",
            enum: [
              "APPROVED",
              "PENDING_MODERATION",
              "REJECTED_OFFENSIVE",
              "REJECTED_NONSENSE",
              "REJECTED_OTHER",
            ],
            description:
              "Content moderation status. Reviews with PENDING_MODERATION or any REJECTED status are hidden from public listings.",
          },
          moderationReason: {
            type: "string",
            nullable: true,
            description:
              "User-facing explanation in Portuguese for why the review was rejected.",
          },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ModerationResult: {
        type: "object",
        description:
          "Included in the response when a review is rejected or pending moderation.",
        properties: {
          status: {
            type: "string",
            enum: [
              "PENDING_MODERATION",
              "REJECTED_OFFENSIVE",
              "REJECTED_NONSENSE",
              "REJECTED_OTHER",
            ],
          },
          reason: {
            type: "string",
            description: "User-facing explanation in Portuguese.",
            example:
              "Sua avaliação contém linguagem ofensiva e não pode ser publicada.",
          },
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
          authProvider: {
            type: "string",
            enum: ["local", "google", "local_and_google"],
            example: "local",
            description:
              "How the account was created. 'local' = email/password, 'google' = Google OAuth, 'local_and_google' = both linked.",
          },
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
      UniversitySubmission: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          location: { type: "string", nullable: true },
          type: { type: "string", enum: ["PUBLIC", "PRIVATE"] },
          website: { type: "string", nullable: true },
          emailDomain: {
            type: "string",
            nullable: true,
            description: "University email domain (e.g. usp.br)",
          },
          status: {
            type: "string",
            enum: ["PENDING", "APPROVED", "REJECTED"],
          },
          reason: {
            type: "string",
            nullable: true,
            description:
              "Rejection reason, present only when status is REJECTED",
          },
          submitterId: { type: "string", format: "uuid" },
          submitter: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "string", format: "uuid" },
              username: { type: "string" },
            },
          },
          reviewedBy: { type: "string", format: "uuid", nullable: true },
          reviewedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ExternalReview: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          rating: { type: "integer", minimum: 1, maximum: 5 },
          textSnippet: {
            type: "string",
            nullable: true,
            description:
              "First ~100 characters of the review text, truncated at word boundary (LGPD compliance)",
          },
          sourceUrl: {
            type: "string",
            format: "uri",
            description: "Link to the full review on Google Maps",
          },
          source: {
            type: "string",
            enum: ["GOOGLE_MAPS"],
          },
          originalDate: { type: "string", format: "date-time" },
          universityId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ExternalStats: {
        type: "object",
        nullable: true,
        description:
          "Google Maps review statistics. Null when no external reviews exist.",
        properties: {
          averageRating: { type: "number", format: "float", example: 4.2 },
          reviewCount: { type: "integer", example: 15 },
          recommendedCount: { type: "integer", example: 10 },
          source: { type: "string", enum: ["GOOGLE_MAPS"] },
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
