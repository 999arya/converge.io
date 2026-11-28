/**
 * Temporary development controls.
 *
 * Replay is enabled while the game is being tested. When the production rules
 * are locked in, set DEV_REPLAY_ENABLED to false and STAGE1_ATTEMPT_CAP to 3.
 */
export const DEV_REPLAY_ENABLED = true;

/** null means unlimited attempts. Set to 3 when the production cap is enabled. */
export const STAGE1_ATTEMPT_CAP: number | null = null;
