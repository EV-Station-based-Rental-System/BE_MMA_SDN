export function applySortingMongo(
  pipeline: any[],
  sortBy: string | undefined,
  sortOrder: "ASC" | "DESC" | undefined,
  allowedFields: string[],
  defaultField: string,
) {
  const finalSortBy = sortBy && allowedFields.includes(sortBy) ? sortBy : defaultField;
  const finalSortOrder = sortOrder?.toUpperCase() === "ASC" ? 1 : -1;

  const sortStage: Record<string, 1 | -1> = {};
  sortStage[finalSortBy] = finalSortOrder;

  pipeline.push({ $sort: sortStage });
}
