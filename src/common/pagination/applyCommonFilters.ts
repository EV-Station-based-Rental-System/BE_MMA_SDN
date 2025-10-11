import { FilterField } from '../utils/type';

export function applyCommonFiltersMongo(pipeline: any[], filters: Record<string, any>, fieldMapping: Record<string, FilterField>) {
  const matchStage: Record<string, any> = {};
  const orConditions: any[] = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;

    const config = fieldMapping[key];
    if (!config) continue;

    const { field, type, customWhere } = config;

    // Nếu có customWhere thì cho phép nó thêm điều kiện vào pipeline
    if (customWhere) {
      const result = customWhere(value);
      if (Array.isArray(result)) {
        orConditions.push(...result);
      }
      continue;
    }

    // --- Default filter ---
    switch (type) {
      case 'string':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        matchStage[field] = { $regex: value, $options: 'i' };
        break;

      case 'number':
        matchStage[field] = Number(value);
        break;

      case 'boolean':
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          matchStage[field] = ['true', '1', 'yes'].includes(lower);
        } else {
          matchStage[field] = Boolean(value);
        }
        break;

      case 'date':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        matchStage[field] = new Date(value);
        break;

      default:
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        matchStage[field] = value;
        break;
    }
  }

  if (Object.keys(matchStage).length > 0 || orConditions.length > 0) {
    const combined: Record<string, any> = {};

    if (Object.keys(matchStage).length > 0) combined.$and = [matchStage];
    if (orConditions.length > 0) combined.$or = orConditions;

    pipeline.push({ $match: combined });
  }
}
