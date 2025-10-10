import { getSchemaPath, OpenAPIObject } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { ErrorResponseDto } from '../dto/error-response.dto';

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
