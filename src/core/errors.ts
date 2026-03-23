export const ExitCode = {
  OK: 0,
  VALIDATION: 2,
  EVALUATION: 3,
  OUTPUT: 4,
} as const;

export type ExitCode = (typeof ExitCode)[keyof typeof ExitCode];
