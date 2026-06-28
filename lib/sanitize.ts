import sanitizeHtml from 'sanitize-html';

export function sanitizePlainText(value: string) {
  return sanitizeHtml(value.trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
}

export function sanitizeProductDescription(value: string) {
  return sanitizeHtml(value.trim(), {
    allowedTags: ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li'],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  });
}
