/** 8–32 characters with at least one digit, one lowercase and one uppercase letter (ABP default policy). */
export const passwordPattern = /^(?=.{8,32}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*()]+$/;

const lower = 'abcdefghijkmnopqrstuvwxyz';
const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const digits = '23456789';
const all = lower + upper + digits;

export function isValidPassword(value: unknown): boolean {
    return typeof value === 'string' && passwordPattern.test(value);
}

/** Uniform random index below `max`, using rejection sampling to avoid modulo bias. */
function randomIndex(max: number, random: Crypto): number {
    const limit = Math.floor(256 / max) * max;
    const buffer = new Uint8Array(1);
    for (;;) {
        random.getRandomValues(buffer);
        if (buffer[0] < limit) return buffer[0] % max;
    }
}

/**
 * Generates a password that satisfies `passwordPattern` using the Web Crypto API.
 * Look-alike characters (0/O, 1/l/I) are excluded so the password can be read out safely.
 */
export function generatePassword(length = 12, random: Crypto = globalThis.crypto): string {
    if (length < 8 || length > 32) throw new RangeError('Password length must be between 8 and 32');
    const pick = (set: string) => set[randomIndex(set.length, random)];
    const chars = [pick(lower), pick(upper), pick(digits)];
    while (chars.length < length) chars.push(pick(all));
    for (let i = chars.length - 1; i > 0; i--) {
        const j = randomIndex(i + 1, random);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
}
