import type { CliOpts } from '../types.js';
import { loadInput } from '../lib/loadInput.js';
import { validateInput } from '../lib/validateInput.js';
import { ExitCode } from '../core/errors.js';

export async function validateCommand(opts: CliOpts): Promise<number> {
  const input = await loadInput(opts.input);
  const result = await validateInput(input);

  if (!result.valid) {
    console.error(JSON.stringify({ status: 'INVALID', issues: result.issues }, null, 2));
    return ExitCode.VALIDATION;
  }

  console.log('VALID');
  return ExitCode.OK;
}
