import fs from "fs";
import path from "path";
import ts from "typescript";

type ParsedValue = string | number | boolean | null | ParsedValue[] | { [key: string]: ParsedValue };

interface ParsedField {
  name: string;
  tsType: string | null;
  mongooseType: ParsedValue | null;
  required: boolean;
  unique: boolean;
  default: ParsedValue | null;
  ref: string | null;
  enum: ParsedValue | null;
  isArray: boolean;
  rawOptions: { [key: string]: ParsedValue } | null;
}

interface ParsedIndex {
  columns: string[];
  options: { [key: string]: ParsedValue } | null;
  rawExpression: string;
}

interface ParsedRelation {
  type: string;
  targetCollection: string | null;
  sourceFields: string[];
  targetFields: string[];
  via?: string;
}

interface ParsedCollection {
  name: string;
  filePath: string;
  collectionName: string | null;
  schemaDecorator: { [key: string]: ParsedValue } | null;
  fields: ParsedField[];
  indexes: ParsedIndex[];
  relations: ParsedRelation[];
}

interface ParsedEnum {
  name: string;
  values: ParsedValue[];
}

const projectRoot = path.resolve(__dirname, "..");
const srcDir = path.join(projectRoot, "src");
const modelsDir = path.join(srcDir, "models");
const enumsDir = path.join(srcDir, "common", "enums");
const outputPath = path.join(projectRoot, "docs", "current-model-map.json");

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

function ensureDocsDir(): void {
  const docsDir = path.dirname(outputPath);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
}

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

function createSourceFile(filePath: string, content: string): ts.SourceFile {
  return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function getNodeText(source: ts.SourceFile, node: ts.Node): string {
  return node.getText(source);
}

function parseExpression(source: ts.SourceFile, expression: ts.Expression): ParsedValue {
  if (!expression) {
    return null;
  }

  switch (expression.kind) {
    case ts.SyntaxKind.TrueKeyword:
      return true;
    case ts.SyntaxKind.FalseKeyword:
      return false;
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
      return (expression as ts.StringLiteral).text;
    case ts.SyntaxKind.NumericLiteral:
      return Number((expression as ts.NumericLiteral).text);
    case ts.SyntaxKind.NullKeyword:
      return null;
    case ts.SyntaxKind.ObjectLiteralExpression:
      return parseObjectLiteral(source, expression as ts.ObjectLiteralExpression);
    case ts.SyntaxKind.ArrayLiteralExpression:
      return (expression as ts.ArrayLiteralExpression).elements.map((el) => parseExpression(source, el as ts.Expression));
    default:
      return getNodeText(source, expression);
  }
}

function parseObjectLiteral(
  source: ts.SourceFile,
  literal: ts.ObjectLiteralExpression,
): {
  [key: string]: ParsedValue;
} {
  const result: { [key: string]: ParsedValue } = {};
  literal.properties.forEach((prop) => {
    if (ts.isPropertyAssignment(prop)) {
      const key = getPropertyName(prop.name, source);
      if (key) {
        result[key] = parseExpression(source, prop.initializer);
      }
    } else if (ts.isShorthandPropertyAssignment(prop)) {
      const key = getPropertyName(prop.name, source);
      if (key) {
        result[key] = key;
      }
    } else if (ts.isSpreadAssignment(prop)) {
      const key = `...${getNodeText(source, prop.expression)}`;
      result[key] = parseExpression(source, prop.expression);
    }
  });
  return result;
}

function getPropertyName(name: ts.PropertyName, source: ts.SourceFile): string | null {
  if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)) {
    return name.text;
  }
  if (ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  if (ts.isComputedPropertyName(name)) {
    return getNodeText(source, name.expression);
  }
  return null;
}

type DecoratorList = readonly ts.Decorator[] | undefined;

function getDecorators(node: ts.Node): DecoratorList {
  const legacyDecorators = (node as ts.Node & { decorators?: ts.NodeArray<ts.Decorator> }).decorators;
  if (legacyDecorators) {
    return legacyDecorators;
  }
  if (ts.canHaveDecorators(node)) {
    return ts.getDecorators(node) ?? undefined;
  }
  return undefined;
}

function getDecoratorByName(decorators: DecoratorList, name: string, source: ts.SourceFile): ts.CallExpression | null {
  if (!decorators) {
    return null;
  }
  for (const decorator of decorators) {
    const expression = decorator.expression;
    if (ts.isCallExpression(expression)) {
      const decoratorIdentifier = expression.expression;
      if (ts.isIdentifier(decoratorIdentifier) && decoratorIdentifier.text === name) {
        return expression;
      }
      if (ts.isPropertyAccessExpression(decoratorIdentifier) && decoratorIdentifier.name.text === name) {
        return expression;
      }
    }
  }
  return null;
}

function parseSchemaDecorator(source: ts.SourceFile, decorators: DecoratorList): { [key: string]: ParsedValue } | null {
  const decoratorCall = getDecoratorByName(decorators, "Schema", source);
  if (!decoratorCall) {
    return null;
  }
  if (!decoratorCall.arguments.length) {
    return {};
  }
  const arg = decoratorCall.arguments[0];
  if (!ts.isObjectLiteralExpression(arg)) {
    return {
      __raw: getNodeText(source, arg),
    } as unknown as { [key: string]: ParsedValue };
  }
  return parseObjectLiteral(source, arg);
}

function parsePropDecorator(source: ts.SourceFile, decorators: DecoratorList): { [key: string]: ParsedValue } | null {
  const decoratorCall = getDecoratorByName(decorators, "Prop", source);
  if (!decoratorCall) {
    return null;
  }
  if (!decoratorCall.arguments.length) {
    return {};
  }
  const arg = decoratorCall.arguments[0];
  if (ts.isObjectLiteralExpression(arg)) {
    return parseObjectLiteral(source, arg);
  }
  return {
    __raw: getNodeText(source, arg),
  } as unknown as { [key: string]: ParsedValue };
}

function toSnakeCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

function defaultCollectionName(className: string): string {
  const snake = toSnakeCase(className);
  if (!snake) {
    return className.toLowerCase();
  }
  if (snake.endsWith("s")) {
    return snake;
  }
  return `${snake}s`;
}

function parseFields(source: ts.SourceFile, classNode: ts.ClassDeclaration): ParsedField[] {
  const fields: ParsedField[] = [];
  classNode.members.forEach((member) => {
    if (!ts.isPropertyDeclaration(member) || !member.name) {
      return;
    }
    const name = getPropertyName(member.name, source);
    if (!name) {
      return;
    }
    const propOptions = parsePropDecorator(source, getDecorators(member));
    const tsType = member.type ? getNodeText(source, member.type) : null;
    const mongooseType = propOptions && "type" in propOptions ? propOptions.type : null;
    const required = Boolean(propOptions && propOptions.required === true);
    const unique = Boolean(propOptions && propOptions.unique === true);
    const defaultValue = propOptions && "default" in propOptions ? propOptions.default : null;
    const ref = propOptions && typeof propOptions.ref === "string" ? propOptions.ref : null;
    const enumValue = propOptions && "enum" in propOptions ? propOptions.enum : null;
    const hasArrayTsType = !!member.type && ts.isArrayTypeNode(member.type);
    const isArray = Array.isArray(mongooseType) || hasArrayTsType;
    fields.push({
      name,
      tsType,
      mongooseType,
      required,
      unique,
      default: defaultValue,
      ref,
      enum: enumValue,
      isArray,
      rawOptions: propOptions,
    });
  });
  return fields;
}

function parseIndexes(source: ts.SourceFile, schemaIdentifier: string, schemaName: string): ParsedIndex[] {
  const indexes: ParsedIndex[] = [];
  source.forEachChild((node) => {
    if (!ts.isExpressionStatement(node)) {
      return;
    }
    if (!ts.isCallExpression(node.expression)) {
      return;
    }
    const call = node.expression;
    if (!ts.isPropertyAccessExpression(call.expression)) {
      return;
    }
    const propertyAccess = call.expression;
    if (!ts.isIdentifier(propertyAccess.expression)) {
      return;
    }
    if (propertyAccess.expression.text !== schemaIdentifier || propertyAccess.name.text !== "index") {
      return;
    }
    const [fieldsArg, optionsArg] = call.arguments;
    const columns: string[] = [];
    if (fieldsArg && ts.isObjectLiteralExpression(fieldsArg)) {
      fieldsArg.properties.forEach((prop) => {
        if (ts.isPropertyAssignment(prop)) {
          const key = getPropertyName(prop.name, source);
          const value = parseExpression(source, prop.initializer);
          if (key) {
            columns.push(`${key}: ${value}`);
          }
        }
      });
    } else if (fieldsArg) {
      columns.push(getNodeText(source, fieldsArg));
    }
    let options: { [key: string]: ParsedValue } | null = null;
    if (optionsArg && ts.isObjectLiteralExpression(optionsArg)) {
      options = parseObjectLiteral(source, optionsArg);
    }
    indexes.push({
      columns,
      options,
      rawExpression: printer.printNode(ts.EmitHint.Unspecified, call, source),
    });
  });
  return indexes;
}

function buildRelations(fields: ParsedField[]): ParsedRelation[] {
  const relations: ParsedRelation[] = [];
  fields.forEach((field) => {
    if (field.ref) {
      relations.push({
        type: field.isArray ? "referencesMany" : "referencesOne",
        targetCollection: field.ref,
        sourceFields: [field.name],
        targetFields: [],
      });
    }
  });
  return relations;
}

function parseSchemaFile(filePath: string): ParsedCollection[] {
  const content = readFile(filePath);
  const source = createSourceFile(filePath, content);
  const relativePath = path.relative(projectRoot, filePath).replace(/\\/g, "/");
  const collections: ParsedCollection[] = [];
  const schemaVariableToClass = new Map<string, string>();

  source.forEachChild((node) => {
    if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach((decl) => {
        if (!ts.isVariableDeclaration(decl) || !decl.initializer) {
          return;
        }
        if (!ts.isCallExpression(decl.initializer)) {
          return;
        }
        const callExpression = decl.initializer;
        if (!ts.isPropertyAccessExpression(callExpression.expression) && !ts.isIdentifier(callExpression.expression)) {
          return;
        }
        const expression = callExpression.expression;
        let isSchemaFactoryCall = false;
        if (ts.isPropertyAccessExpression(expression)) {
          isSchemaFactoryCall =
            ts.isIdentifier(expression.expression) && expression.expression.text === "SchemaFactory" && expression.name.text === "createForClass";
        } else if (ts.isIdentifier(expression)) {
          isSchemaFactoryCall = expression.text === "SchemaFactory";
        }
        if (!isSchemaFactoryCall) {
          return;
        }
        const [arg] = callExpression.arguments;
        if (!arg || !ts.isIdentifier(arg)) {
          return;
        }
        const variableName = decl.name && ts.isIdentifier(decl.name) ? decl.name.text : null;
        if (variableName) {
          schemaVariableToClass.set(variableName, arg.text);
        }
      });
    }
  });

  source.forEachChild((node) => {
    if (!ts.isClassDeclaration(node) || !node.name) {
      return;
    }
    const className = node.name.text;
    const schemaDecorator = parseSchemaDecorator(source, getDecorators(node));
    const fields = parseFields(source, node);
    const relations = buildRelations(fields);
    let schemaIdentifier: string | null = null;
    schemaVariableToClass.forEach((value, key) => {
      if (value === className) {
        schemaIdentifier = key;
      }
    });
    const indexes = schemaIdentifier ? parseIndexes(source, schemaIdentifier, className) : [];
    const collectionName =
      schemaDecorator && typeof schemaDecorator["collection"] === "string"
        ? (schemaDecorator["collection"] as string)
        : defaultCollectionName(className);
    collections.push({
      name: className,
      filePath: relativePath,
      collectionName,
      schemaDecorator,
      fields,
      indexes,
      relations,
    });
  });

  return collections;
}

function walkDir(dir: string, predicate: (file: string) => boolean): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath, predicate));
    } else if (entry.isFile() && predicate(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

function parseEnums(): Record<string, ParsedEnum> {
  const result: Record<string, ParsedEnum> = {};
  if (!fs.existsSync(enumsDir)) {
    return result;
  }
  const enumFiles = walkDir(enumsDir, (file) => file.endsWith(".ts"));
  enumFiles.forEach((file) => {
    const content = readFile(file);
    const source = createSourceFile(file, content);
    source.forEachChild((node) => {
      if (ts.isEnumDeclaration(node)) {
        if (!node.name) {
          return;
        }
        const enumName = node.name.text;
        const values: ParsedValue[] = [];
        node.members.forEach((member) => {
          if (member.initializer) {
            values.push(parseExpression(source, member.initializer));
          } else if (member.name) {
            const nameText = getPropertyName(member.name, source);
            if (nameText) {
              values.push(nameText);
            }
          }
        });
        const key = enumName;
        result[key] = {
          name: enumName,
          values,
        };
      }
    });
  });
  return result;
}

function sortObjectKeys<T>(obj: Record<string, T>): Record<string, T> {
  return Object.keys(obj)
    .sort()
    .reduce((acc: Record<string, T>, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

function main(): void {
  ensureDocsDir();
  const schemaFiles = walkDir(modelsDir, (file) => file.endsWith(".schema.ts"));
  const collections: Record<string, ParsedCollection> = {};
  schemaFiles.forEach((file) => {
    const parsedCollections = parseSchemaFile(file);
    parsedCollections.forEach((collection) => {
      const key = collection.collectionName || collection.name;
      collections[key] = collection;
    });
  });

  const enums = parseEnums();

  const output = {
    source: "codebase",
    generatedAt: new Date().toISOString(),
    enums: sortObjectKeys(enums),
    collections: sortObjectKeys(collections),
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
}

main();
