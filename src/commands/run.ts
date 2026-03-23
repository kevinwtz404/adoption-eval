import type { CliOpts, ReadinessProfile } from '../types.js';
import { loadInput } from '../lib/loadInput.js';
import { validateInput } from '../lib/validateInput.js';
import { runAssessment } from '../lib/runAssessment.js';
import { writeJson, writeMd } from '../core/output.js';
import { ExitCode } from '../core/errors.js';

export async function runCommand(opts: CliOpts): Promise<number> {
  const input = await loadInput(opts.input);
  const v = await validateInput(input);
  if (!v.valid) return ExitCode.VALIDATION;

  const readiness: ReadinessProfile | null = opts.readiness
    ? (await loadInput(opts.readiness) as unknown as ReadinessProfile)
    : null;
  const result = runAssessment(input, readiness);

  await writeJson(opts.out, 'opportunity-map.json', result.map);
  await writeJson(opts.out, 'readiness-score.json', result.eval);
  if (result.qualification) {
    await writeJson(opts.out, 'qualification-score.json', result.qualification);
  }
  await writeJson(opts.out, 'actions-next-30-days.json', { actions: result.actions_next_30_days });
  await writeMd(
    opts.out,
    'actions-next-30-days.md',
    `# actions next 30 days\n\n${result.actions_next_30_days.map((a, i) => `${i + 1}. ${a}`).join('\n')}`
  );

  console.log(`Wrote run outputs to ${opts.out}`);
  return ExitCode.OK;
}
