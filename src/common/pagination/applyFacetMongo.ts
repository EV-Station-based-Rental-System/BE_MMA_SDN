export function applyFacetMongo(pipeline: any[]) {
  const basePipeline: any[] = [];
  const paginationStages: any[] = [];
  for (const stage of pipeline) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (stage.$skip || stage.$limit || stage.$project) {
      paginationStages.push(stage);
    } else {
      basePipeline.push(stage);
    }
  }

  // Xóa hết các phần tử cũ trong pipeline (để thay bằng facet)
  pipeline.length = 0;

  // Thêm vào stage $facet với 2 pipeline riêng biệt
  pipeline.push({
    $facet: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: [...basePipeline, ...paginationStages], // Base + pagination
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      meta: [...basePipeline, { $count: "total" }],
    },
  });
}
