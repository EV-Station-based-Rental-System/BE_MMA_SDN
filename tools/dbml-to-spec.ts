#!/usr/bin/env ts-node
import { Parser } from "@dbml/core";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

type Primitive = string | number | boolean | null;
type JsonValue = Primitive | JsonValue[] | { [key: string]: JsonValue };

type FieldLike = {
  name: string;
  type?: { type_name?: string | null } | null;
  not_null?: boolean;
  unique?: boolean;
  pk?: boolean;
  dbdefault?: { type?: string | null; value?: unknown } | null;
  note?: string | null;
  increment?: boolean;
  _enum?: { name: string } | null;
};

type TableLike = {
  name: string;
  note?: string | null;
  fields: FieldLike[];
  indexes: Array<{
    name?: string | null;
    unique?: boolean;
    pk?: boolean;
    type?: string | null;
    note?: string | null;
    columns: Array<{ value: string; type?: string | null }>;
  }>;
};

type EndpointLike = {
  tableName: string;
  relation: string;
  fieldNames: string[];
};

type RefLike = {
  endpoints: [EndpointLike, EndpointLike];
  onDelete?: string | null;
};

type SchemaLike = {
  tables: TableLike[];
  enums: Array<{ name: string; values: Array<{ name: string }> }>;
  refs: RefLike[];
};

const SCALAR_SAFE_PATTERN = /^[A-Za-z0-9_\-.]+$/;

function isPrimitive(value: JsonValue): value is Primitive {
  return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function formatScalar(value: Primitive): string {
  if (value === null) {
    return "null";
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value.length === 0) {
    return "''";
  }
  if (SCALAR_SAFE_PATTERN.test(value)) {
    return value;
  }
  return JSON.stringify(value);
}

function toYaml(value: JsonValue, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `${pad}[]`;
    }
    return value
      .map((entry) => {
        if (isPrimitive(entry)) {
          return `${pad}- ${formatScalar(entry)}`;
        }
        const child = toYaml(entry, indent + 1);
        return `${pad}-\n${child}`;
      })
      .join("\n");
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return `${pad}{}`;
    }
    return entries
      .map(([key, entry]) => {
        const keyLine = `${pad}${key}:`;
        if (entry === undefined) {
          return `${keyLine} null`;
        }
        if (isPrimitive(entry)) {
          return `${keyLine} ${formatScalar(entry)}`;
        }
        if (Array.isArray(entry)) {
          if (entry.length === 0) {
            return `${keyLine} []`;
          }
          if (entry.every(isPrimitive)) {
            const serialized = entry.map((item) => formatScalar(item)).join(", ");
            return `${keyLine} [${serialized}]`;
          }
          const child = toYaml(entry, indent + 1);
          return `${keyLine}\n${child}`;
        }
        const childEntries = Object.entries(entry);
        if (childEntries.length === 0) {
          return `${keyLine} {}`;
        }
        const child = toYaml(entry, indent + 1);
        return `${keyLine}\n${child}`;
      })
      .join("\n");
  }
  return `${pad}${formatScalar(value)}`;
}

function normalizeDbmlType(field: FieldLike): string {
  return field.type?.type_name ?? "unknown";
}

function mapDefaultValue(field: FieldLike): Primitive {
  const defaultInfo = field.dbdefault;
  if (!defaultInfo || defaultInfo.value === undefined || defaultInfo.value === null) {
    return null;
  }

  const { type, value } = defaultInfo;
  if (type === "number" && typeof value === "number") {
    return value;
  }
  if (type === "boolean") {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
  }
  if (type === "string" && typeof value === "string") {
    return value;
  }
  if (type === "expression" && typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "now()" || normalized === "current_timestamp") {
      return "Date.now";
    }
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "string") {
    return value;
  }
  return JSON.stringify(value) ?? null;
}

function mapTsType(field: FieldLike): string {
  if (field._enum?.name) {
    return `enum:${field._enum.name}`;
  }
  const raw = normalizeDbmlType(field).toLowerCase();
  if (!raw || raw === "unknown") {
    return "unknown";
  }
  if (raw.includes("int")) {
    if (field.name.endsWith("_id")) {
      return "Types.ObjectId";
    }
    return "number";
  }
  if (raw.includes("numeric") || raw.includes("decimal")) {
    return "Decimal128";
  }
  if (raw.includes("double") || raw.includes("float")) {
    return "number";
  }
  if (raw.includes("char") || raw.includes("text") || raw.includes("inet")) {
    return "string";
  }
  if (raw.includes("time") || raw.includes("date") || raw.includes("timestamp") || raw === "timestamptz") {
    return "Date";
  }
  if (raw === "boolean") {
    return "boolean";
  }
  if (raw === "uuid" || raw === "uniqueidentifier") {
    return "Types.ObjectId";
  }
  return "string";
}

function makeFieldSpec(field: FieldLike) {
  return {
    name: field.name,
    dbmlType: normalizeDbmlType(field),
    tsType: mapTsType(field),
    required: Boolean(field.not_null || field.pk),
    unique: Boolean(field.unique || field.pk),
    primaryKey: Boolean(field.pk),
    autoIncrement: Boolean(field.increment),
    default: mapDefaultValue(field),
    note: field.note ?? null,
    enumName: field._enum?.name ?? null,
  };
}

function makeIndexSpec(index: TableLike["indexes"][number]) {
  return {
    name: index.name ?? null,
    type: index.type ?? null,
    unique: Boolean(index.unique || index.pk),
    primaryKey: Boolean(index.pk),
    note: index.note ?? null,
    columns: index.columns.map((column) => column.value),
  };
}

function relationTypeForEndpoint(relation: string, otherRelation: string): "hasMany" | "belongsTo" | "hasOne" | "manyToMany" {
  if (relation === "*" && otherRelation === "*") {
    return "manyToMany";
  }
  if (relation === "*" && otherRelation === "1") {
    return "belongsTo";
  }
  if (relation === "1" && otherRelation === "*") {
    return "hasMany";
  }
  return "hasOne";
}

function buildRelations(schema: SchemaLike) {
  const relationMap = new Map<
    string,
    Array<{
      type: string;
      targetCollection: string;
      sourceFields: string[];
      targetFields: string[];
      onDelete: string | null;
    }>
  >();

  const ensure = (key: string) => {
    if (!relationMap.has(key)) {
      relationMap.set(key, []);
    }
    return relationMap.get(key)!;
  };

  for (const ref of schema.refs) {
    const [left, right] = ref.endpoints;
    const leftType = relationTypeForEndpoint(left.relation, right.relation);
    const rightType = relationTypeForEndpoint(right.relation, left.relation);
    const onDelete = ref.onDelete ?? null;

    ensure(left.tableName).push({
      type: leftType,
      targetCollection: right.tableName,
      sourceFields: left.fieldNames ?? [],
      targetFields: right.fieldNames ?? [],
      onDelete,
    });

    ensure(right.tableName).push({
      type: rightType,
      targetCollection: left.tableName,
      sourceFields: right.fieldNames ?? [],
      targetFields: left.fieldNames ?? [],
      onDelete,
    });
  }

  return relationMap;
}

async function main() {
  const dbmlPathArg = process.argv[2] ?? process.env.DBML_PATH ?? "DB.dbml";
  const dbmlPath = path.resolve(process.cwd(), dbmlPathArg);
  const parser = new Parser();
  const content = await readFile(dbmlPath, "utf8");
  const database = parser.parse(content, "dbml");
  const rawSchema = database.schemas?.[0];

  if (!rawSchema) {
    throw new Error("No schema found in DBML file.");
  }

  const schema = rawSchema as unknown as SchemaLike;

  const relations = buildRelations(schema);

  const collections = schema.tables
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((table) => {
      const fields = table.fields.map(makeFieldSpec);
      const indexes = table.indexes?.map(makeIndexSpec) ?? [];
      const relationsForTable = relations.get(table.name) ?? [];
      return [
        table.name,
        {
          tableName: table.name,
          collectionName: table.name,
          note: table.note ?? null,
          fields,
          indexes,
          relations: relationsForTable,
        },
      ] as const;
    });

  const enums = schema.enums
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (enumDef) =>
        [
          enumDef.name,
          {
            name: enumDef.name,
            values: enumDef.values.map((value) => value.name),
          },
        ] as const,
    );

  const spec: JsonValue = {
    source: path.relative(process.cwd(), dbmlPath),
    generatedAt: new Date().toISOString(),
    fixes: [],
    enums: Object.fromEntries(enums),
    collections: Object.fromEntries(collections),
  };

  const docsDir = path.resolve(process.cwd(), "docs");
  await mkdir(docsDir, { recursive: true });

  const jsonPath = path.join(docsDir, "model-spec.json");
  const yamlPath = path.join(docsDir, "model-spec.yml");

  await writeFile(jsonPath, `${JSON.stringify(spec, null, 2)}\n`);
  await writeFile(yamlPath, `${toYaml(spec)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
