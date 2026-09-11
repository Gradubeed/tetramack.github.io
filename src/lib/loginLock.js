export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function isLocked(config) {
  return Boolean(config.lockedUntil && new Date(config.lockedUntil).getTime() > Date.now());
}

export function lockRemainingMinutes(config) {
  if (!isLocked(config)) return 0;
  return Math.ceil((new Date(config.lockedUntil).getTime() - Date.now()) / 60000);
}

/** Prochain état {failedLoginAttempts, lockedUntil} à écrire en base après un échec de connexion. */
export function nextStateAfterFailure(config) {
  const attempts = (config.failedLoginAttempts || 0) + 1;
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    return { failedLoginAttempts: 0, lockedUntil: new Date(Date.now() + LOCK_DURATION_MS) };
  }
  return { failedLoginAttempts: attempts, lockedUntil: null };
}

export const stateAfterSuccess = { failedLoginAttempts: 0, lockedUntil: null };
