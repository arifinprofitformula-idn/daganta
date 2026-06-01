const BLOCKED_HEADER_PARTS = [
  'authorization',
  'cookie',
  'set-cookie',
  'api-key',
  'apikey',
  'secret',
  'token',
  'signature',
];

const MAX_HEADER_VALUE_LENGTH = 160;

export function sanitizeWebhookHeaders(headers: Headers) {
  const sanitized: Record<string, string> = {};

  headers.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();
    const shouldDrop = BLOCKED_HEADER_PARTS.some((blockedPart) => normalizedKey.includes(blockedPart));

    if (shouldDrop) return;

    sanitized[normalizedKey] =
      value.length > MAX_HEADER_VALUE_LENGTH ? `${value.slice(0, MAX_HEADER_VALUE_LENGTH)}...` : value;
  });

  return sanitized;
}
