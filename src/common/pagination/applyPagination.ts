export function applyPaginationMongo(
  pipeline: any[],
  { page, take }: { page: number; take: number },
) {
  const skip = (page - 1) * take;
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: take });
}
