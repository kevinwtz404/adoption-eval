import { loadInput } from '../lib/loadInput.js';
import { validateInput } from '../lib/validateInput.js';
import { ExitCode } from '../core/errors.js';

export async function validateCommand(opts) {
  const input = await loadInput(opts.input);
  const result = validateInput(input);

  if (!result.valid) {
    console.error(JSON.stringify({ status: 'INVALID', issues: result.issues }, null, 2));
    return ExitCode.VALIDATION;
  }

  console.log('VALID');
  return ExitCode.OK;
}
