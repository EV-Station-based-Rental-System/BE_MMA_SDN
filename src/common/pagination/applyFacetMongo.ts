

export function applyFacetMongo(pipeline: any[]) {

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const clonedPipeline = [...pipeline];

  // Xóa hết các phần tử cũ trong pipeline (để thay bằng facet)
  pipeline.length = 0;

  // Thêm vào stage $facet
  pipeline.push({
    $facet: {
      data: clonedPipeline,
      meta: [{ $count: 'total' }],
    },
  });
}
