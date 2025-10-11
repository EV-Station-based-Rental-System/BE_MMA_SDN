import { getSchemaPath, OpenAPIObject } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { ToNumberOptions } from './type';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  const isMatch = await bcrypt.compare(password, hash);
  return isMatch;
};

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head';

export function addBadRequestByPrefix(document: OpenAPIObject, prefix: string) {
  const ref = { $ref: getSchemaPath(ErrorResponseDto) };
  const methods: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];
  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    if (!path.startsWith(prefix)) continue;
    for (const m of methods) {
      const op = (pathItem as Record<HttpMethod, { responses?: Record<string, any> }>)[m];
      if (!op) continue;
      op.responses ??= {};
      op.responses['400'] ??= {
        description: 'Bad Request',
        content: { 'application/json': { schema: ref } },
      };
    }
  }
}

export function toLowerCase(value: string): string {
  return value.toLowerCase();
}

export function trim(value: string): string {
  return value.trim();
}

export function toDate(value: string): Date {
  return new Date(value);
}

export function toBoolean(value: string): boolean {
  value = value.toLowerCase();

  return value === 'true' || value === '1' ? true : false;
}

export function toNumber(value: string, opts: ToNumberOptions = {}): number {
  let newValue: number = Number.parseInt(value || String(opts.default), 10);

  if (Number.isNaN(newValue)) {
    newValue = opts.default ?? 0;
  }

  if (opts.min) {
    if (newValue < opts.min) {
      newValue = opts.min;
    }

    if (typeof opts.max === 'number' && newValue > opts.max) {
      newValue = opts.max;
    }
  }

  return newValue;
}
