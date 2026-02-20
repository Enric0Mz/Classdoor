const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export function parsePagination(searchParams) {
  const rawPage = parseInt(searchParams.get("page"), 10);
  const rawLimit = parseInt(searchParams.get("limit"), 10);

  const page = rawPage > 0 ? rawPage : DEFAULT_PAGE;
  const limit = rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function paginatedResponse(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}
