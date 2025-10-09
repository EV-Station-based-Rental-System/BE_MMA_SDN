import fs from 'fs';
import path from 'path';

type SpecField = {
  name: string;
  dbmlType?: string | null;
  tsType?: string | null;
  required?: boolean;
  unique?: boolean;
  default?: unknown;
  note?: string | null;
  enumName?: string | null;
};

type SpecIndex = {
  name?: string | null;
  type?: string | null;
  unique?: boolean;
  primaryKey?: boolean;
  note?: string | null;
  columns: string[];
};

type SpecRelation = {
  type: string;
  targetCollection: string | null;
  sourceFields: string[];
  targetFields: string[];
  onDelete?: string | null;
};

type SpecCollection = {
  name: string;
  collectionName?: string | null;
  fields: SpecField[];
  indexes: SpecIndex[];
  relations: SpecRelation[];
};

type SpecEnum = {
  name: string;
  values: string[];
};

type ModelSpec = {
  source: string;
  generatedAt: string;
  fixes?: unknown[];
  enums: Record<string, SpecEnum>;
  collections: Record<string, SpecCollection>;
};

type CurrentField = {
  name: string;
  tsType: string | null;
  mongooseType: unknown;
  required: boolean;
  unique: boolean;
  default: unknown;
  ref: string | null;
  enum: unknown;
  isArray: boolean;
};

type CurrentIndex = {
  columns: string[];
  options: Record<string, unknown> | null;
  rawExpression: string;
};

type CurrentRelation = {
  type: string;
  targetCollection: string | null;
  sourceFields: string[];
  targetFields: string[];
};

type CurrentCollection = {
  name: string;
  collectionName: string | null;
  fields: CurrentField[];
  indexes: CurrentIndex[];
  relations: CurrentRelation[];
};

type CurrentEnum = {
  name: string;
  values: string[];
};

type CurrentModelMap = {
  source: string;
  generatedAt: string;
  enums: Record<string, CurrentEnum>;
  collections: Record<string, CurrentCollection>;
};

const projectRoot = path.resolve(__dirname, '..');
const docsDir = path.join(projectRoot, 'docs');
const specPath = path.join(docsDir, 'model-spec.json');
const currentPath = path.join(docsDir, 'current-model-map.json');
const diffPath = path.join(docsDir, 'model-diff.md');

function readJson<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content) as T;
}

function stringifyValue(value: unknown): string {
  if (value === undefined) {
    return 'undefined';
  }
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value);
}

function normalizeColumns(columns: string[]): string {
  return columns.map((column) => column.trim()).sort().join(', ');
}

function normalizeRelationKey(sourceFields: string[], targetCollection: string | null): string {
  const sourceKey = sourceFields.slice().sort().join(',');
  const targetKey = targetCollection ? targetCollection.toLowerCase() : 'null';
  return `${sourceKey}->${targetKey}`;
}

function buildFieldMap<T extends { name: string }>(fields: T[]): Map<string, T> {
  const map = new Map<string, T>();
  fields.forEach((field) => {
    map.set(field.name, field);
  });
  return map;
}

function compareFields(specFields: SpecField[], currentFields: CurrentField[]): string[] {
  const messages: string[] = [];
  const specFieldMap = buildFieldMap(specFields);
  const currentFieldMap = buildFieldMap(currentFields);

  const missingFields = Array.from(specFieldMap.keys()).filter((name) => !currentFieldMap.has(name));
  const extraFields = Array.from(currentFieldMap.keys()).filter((name) => !specFieldMap.has(name));

  if (missingFields.length) {
    messages.push(`- Missing fields: ${missingFields.join(', ')}`);
  }
  if (extraFields.length) {
    messages.push(`- Extra fields: ${extraFields.join(', ')}`);
  }

  const sharedNames = Array.from(specFieldMap.keys()).filter((name) => currentFieldMap.has(name));
  sharedNames.forEach((name) => {
    const specField = specFieldMap.get(name)!;
    const currentField = currentFieldMap.get(name)!;
    const fieldMessages: string[] = [];

    const currentType = currentField.tsType || stringifyValue(currentField.mongooseType);
    if (specField.tsType && specField.tsType !== currentType) {
      fieldMessages.push(`type spec=${specField.tsType} current=${currentType}`);
    }
    if (specField.required !== undefined && specField.required !== currentField.required) {
      fieldMessages.push(`required spec=${specField.required} current=${currentField.required}`);
    }
    if (specField.unique !== undefined && specField.unique !== currentField.unique) {
      fieldMessages.push(`unique spec=${specField.unique} current=${currentField.unique}`);
    }
    const specDefault = stringifyValue(specField.default);
    const currentDefault = stringifyValue(currentField.default);
    if (specDefault !== 'undefined' && specDefault !== currentDefault) {
      fieldMessages.push(`default spec=${specDefault} current=${currentDefault}`);
    }
    if (specField.enumName) {
      const enumValues = Array.isArray(currentField.enum) ? currentField.enum.join(', ') : stringifyValue(currentField.enum);
      if (!enumValues || enumValues === 'undefined') {
        fieldMessages.push(`enum spec=${specField.enumName} current=missing`);
      }
    }

    if (fieldMessages.length) {
      messages.push(`- Field \`${name}\`: ${fieldMessages.join('; ')}`);
    }
  });

  if (!messages.length) {
    messages.push('- Fields: ✅ Matches spec');
  }

  return messages;
}

function compareIndexes(specIndexes: SpecIndex[], currentIndexes: CurrentIndex[]): string[] {
  const messages: string[] = [];
  const specMap = new Map<string, SpecIndex>();
  specIndexes.forEach((index) => {
    specMap.set(normalizeColumns(index.columns), index);
  });
  const currentMap = new Map<string, CurrentIndex>();
  currentIndexes.forEach((index) => {
    currentMap.set(normalizeColumns(index.columns), index);
  });

  const missing = Array.from(specMap.keys()).filter((key) => !currentMap.has(key));
  const extra = Array.from(currentMap.keys()).filter((key) => !specMap.has(key));

  if (missing.length) {
    messages.push(`- Missing indexes: ${missing.join(' | ')}`);
  }
  if (extra.length) {
    messages.push(`- Extra indexes: ${extra.join(' | ')}`);
  }

  const shared = Array.from(specMap.keys()).filter((key) => currentMap.has(key));
  shared.forEach((key) => {
    const specIndex = specMap.get(key)!;
    const currentIndex = currentMap.get(key)!;
    const specUnique = specIndex.unique ?? false;
    const currentUnique = Boolean(currentIndex.options?.unique);
    const diffs: string[] = [];
    if (specUnique !== currentUnique) {
      diffs.push(`unique spec=${specUnique} current=${currentUnique}`);
    }
    if (specIndex.type && specIndex.type !== (currentIndex.options?.type as string | undefined)) {
      diffs.push(`type spec=${specIndex.type} current=${currentIndex.options?.type}`);
    }
    if (specIndex.primaryKey && !currentUnique) {
      diffs.push('primary key missing');
    }
    if (diffs.length) {
      messages.push(`- Index [${key}]: ${diffs.join('; ')}`);
    }
  });

  if (!messages.length) {
    messages.push('- Indexes: ✅ Matches spec');
  }

  return messages;
}

function compareRelations(specRelations: SpecRelation[], currentRelations: CurrentRelation[]): string[] {
  const messages: string[] = [];
  const specMap = new Map<string, SpecRelation>();
  specRelations.forEach((relation) => {
    const key = normalizeRelationKey(relation.sourceFields, relation.targetCollection);
    specMap.set(key, relation);
  });
  const currentMap = new Map<string, CurrentRelation>();
  currentRelations.forEach((relation) => {
    const key = normalizeRelationKey(relation.sourceFields, relation.targetCollection);
    currentMap.set(key, relation);
  });

  const missing = Array.from(specMap.keys()).filter((key) => !currentMap.has(key));
  const extra = Array.from(currentMap.keys()).filter((key) => !specMap.has(key));

  if (missing.length) {
    messages.push(`- Missing relations: ${missing.join(' | ')}`);
  }
  if (extra.length) {
    messages.push(`- Extra relations: ${extra.join(' | ')}`);
  }

  const shared = Array.from(specMap.keys()).filter((key) => currentMap.has(key));
  shared.forEach((key) => {
    const specRelation = specMap.get(key)!;
    const currentRelation = currentMap.get(key)!;
    const diffs: string[] = [];
    const specType = specRelation.type;
    const currentType = currentRelation.type;
    if (specType && currentType && specType !== currentType) {
      diffs.push(`type spec=${specType} current=${currentType}`);
    }
    const specTarget = specRelation.targetCollection ? specRelation.targetCollection.toLowerCase() : null;
    const currentTarget = currentRelation.targetCollection ? currentRelation.targetCollection.toLowerCase() : null;
    if (specTarget !== currentTarget) {
      diffs.push(`target spec=${specTarget ?? 'null'} current=${currentTarget ?? 'null'}`);
    }
    if (specRelation.onDelete && specRelation.onDelete !== 'NO ACTION') {
      diffs.push(`onDelete=${specRelation.onDelete}`);
    }
    if (diffs.length) {
      messages.push(`- Relation [${key}]: ${diffs.join('; ')}`);
    }
  });

  if (!messages.length) {
    messages.push('- Relations: ✅ Matches spec');
  }

  return messages;
}

function compareEnums(specEnums: Record<string, SpecEnum>, currentEnums: Record<string, CurrentEnum>): string[] {
  const messages: string[] = [];
  const specNames = Object.keys(specEnums);
  const currentNames = Object.keys(currentEnums);

  const missing = specNames.filter((name) => !currentEnums[name]);
  const extra = currentNames.filter((name) => !specEnums[name]);

  if (missing.length) {
    messages.push(`- Missing enums: ${missing.join(', ')}`);
  }
  if (extra.length) {
    messages.push(`- Extra enums: ${extra.join(', ')}`);
  }

  const shared = specNames.filter((name) => currentEnums[name]);
  shared.forEach((name) => {
    const specValues = new Set(specEnums[name].values);
    const currentValues = new Set(currentEnums[name].values);
    const missingValues = Array.from(specValues).filter((value) => !currentValues.has(value));
    const extraValues = Array.from(currentValues).filter((value) => !specValues.has(value));
    if (missingValues.length || extraValues.length) {
      const parts: string[] = [];
      if (missingValues.length) {
        parts.push(`missing: ${missingValues.join(', ')}`);
      }
      if (extraValues.length) {
        parts.push(`extra: ${extraValues.join(', ')}`);
      }
      messages.push(`- Enum \`${name}\`: ${parts.join('; ')}`);
    }
  });

  if (!messages.length) {
    messages.push('- Enums: ✅ Matches spec');
  }

  return messages;
}

function generateCollectionDiff(
  name: string,
  specCollection: SpecCollection | undefined,
  currentCollection: CurrentCollection | undefined,
): string[] {
  const lines: string[] = [];
  lines.push(`### ${name}`);

  if (!specCollection) {
    lines.push('- Status: ⚠️ Only present in codebase (not defined in DBML)');
    return lines;
  }
  if (!currentCollection) {
    lines.push('- Status: ❌ Missing from codebase');
    return lines;
  }

  const fieldDiffs = compareFields(specCollection.fields, currentCollection.fields);
  const indexDiffs = compareIndexes(specCollection.indexes, currentCollection.indexes);
  const relationDiffs = compareRelations(specCollection.relations, currentCollection.relations);

  lines.push(...fieldDiffs);
  lines.push(...indexDiffs);
  lines.push(...relationDiffs);

  return lines;
}

function buildOverview(
  spec: ModelSpec,
  current: CurrentModelMap,
): { header: string[]; collectionSections: string[] } {
  const lines: string[] = [];
  lines.push('# Model Diff');
  lines.push('');
  lines.push(`- Generated at: ${new Date().toISOString()}`);
  lines.push(`- DBML spec: ${path.relative(projectRoot, specPath)}`);
  lines.push(`- Code map: ${path.relative(projectRoot, currentPath)}`);
  lines.push('');

  lines.push('## Enum Overview');
  lines.push(...compareEnums(spec.enums, current.enums));
  lines.push('');

  const specCollections = Object.keys(spec.collections);
  const currentCollections = Object.keys(current.collections);
  const missingCollections = specCollections.filter((name) => !current.collections[name]);
  const extraCollections = currentCollections.filter((name) => !spec.collections[name]);

  lines.push('## Collections Overview');
  if (missingCollections.length) {
    lines.push(`- Missing collections: ${missingCollections.join(', ')}`);
  }
  if (extraCollections.length) {
    lines.push(`- Extra collections: ${extraCollections.join(', ')}`);
  }
  if (!missingCollections.length && !extraCollections.length) {
    lines.push('- Collections: ✅ All collections accounted for');
  }
  lines.push('');

  const allCollectionNames = Array.from(new Set([...specCollections, ...currentCollections])).sort();
  const collectionSections: string[] = [];
  allCollectionNames.forEach((name) => {
    const section = generateCollectionDiff(name, spec.collections[name], current.collections[name]);
    collectionSections.push(...section, '');
  });

  return { header: lines, collectionSections };
}

function main(): void {
  const spec = readJson<ModelSpec>(specPath);
  const current = readJson<CurrentModelMap>(currentPath);

  const { header, collectionSections } = buildOverview(spec, current);
  const contents = [...header, ...collectionSections].join('\n');
  fs.writeFileSync(diffPath, contents, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Model diff written to ${diffPath}`);
}

main();
