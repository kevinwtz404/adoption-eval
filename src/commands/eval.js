import { loadInput } from '../lib/loadInput.js';
import { validateInput } from '../lib/validateInput.js';
import { evaluateReadiness } from '../lib/evaluateReadiness.js';
import { writeJson, writeMd } from '../core/output.js';
import { ExitCode } from '../core/errors.js';

export async function evalCommand(opts) {
  const input = await loadInput(opts.input);
  const v = validateInput(input);
  if (!v.valid) return ExitCode.VALIDATION;

  const readiness = opts.readiness ? await loadInput(opts.readiness) : null;
  const score = evaluateReadiness(input, readiness);

  await writeJson(opts.out, 'readiness-score.json', score);
  await writeMd(opts.out, 'readiness-summary.md', `# readiness summary\n\nOverall score: **${score.overall_score}**\n`);
  console.log(`Wrote ${opts.out}/readiness-score.json and readiness-summary.md`);
  return ExitCode.OK;
}
