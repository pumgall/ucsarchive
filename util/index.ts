import crypto from 'crypto';

export function delay(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
}

export function hash(s: string): string {
    return crypto.createHash('sha256').update(s).digest('hex');
}