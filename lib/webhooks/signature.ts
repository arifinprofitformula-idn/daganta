import { createHash, createHmac, timingSafeEqual } from 'crypto';

function timingSafeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function validateMidtransSignature(body: string, key: string, receivedSig: string | null): boolean {
  if (!key || !receivedSig) {
    return false;
  }

  const expected = createHash('sha512').update(`${body}${key}`).digest('hex');
  return timingSafeCompare(expected, receivedSig);
}

export function validateXenditSignature(token: string | null, expected: string): boolean {
  if (!token || !expected) {
    return false;
  }

  return timingSafeCompare(token, expected);
}

export function validateTripaySignature(body: string, key: string, receivedSig: string | null): boolean {
  if (!key || !receivedSig) {
    return false;
  }

  const expected = createHmac('sha256', key).update(body).digest('hex');
  return timingSafeCompare(expected, receivedSig);
}
