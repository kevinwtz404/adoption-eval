import Ajv, { type ValidateFunction, type ErrorObject } from 'ajv';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { ValidationResult } from '../types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, '../../schemas/workflow-input.schema.json');

let cachedValidate: ValidateFunction | null = null;

async function getValidator(): Promise<ValidateFunction> {
  if (cachedValidate) return cachedValidate;
  const raw = await fs.readFile(schemaPath, 'utf8');
  const schema = JSON.parse(raw);
  const ajv = new Ajv.default({ allErrors: true });
  cachedValidate = ajv.compile(schema);
  return cachedValidate;
}

export async function validateInput(data: unknown): Promise<ValidationResult> {
  const validate = await getValidator();
  const valid = validate(data) as boolean;

  if (valid) return { valid: true, issues: [] };

  const issues = (validate.errors || []).map((err: ErrorObject) => {
    const path = err.instancePath || '/';
    const msg = err.message || 'unknown error';
    return `${path}: ${msg}`;
  });

  return { valid: false, issues };
}
