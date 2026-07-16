const phoneError = 'Введите российский номер в формате +7 (999) 123-45-67';

export type PhoneValidationResult = {
  isValid: boolean;
  error: string;
  formatted: string;
  normalized: string;
};

function getPhoneDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function hasPhoneLetters(value: string) {
  return /[a-zа-яё]/i.test(value);
}

function toRussianMobileDigits(value: string) {
  const digits = getPhoneDigits(value);
  if (!digits) return '';

  if (digits[0] === '8') return `7${digits.slice(1)}`;
  if (digits[0] === '9') return `7${digits}`;
  return digits;
}

export function formatRussianPhone(value: string) {
  const digits = toRussianMobileDigits(value);
  const displayDigits = digits.slice(0, 11);
  const extraDigits = digits.slice(11);
  const national = displayDigits[0] === '7' ? displayDigits.slice(1) : displayDigits;
  const part1 = national.slice(0, 3);
  const part2 = national.slice(3, 6);
  const part3 = national.slice(6, 8);
  const part4 = national.slice(8, 10);

  if (!national) return '';

  let formatted = '+7';
  if (part1) formatted += ` (${part1}`;
  if (part1.length === 3) formatted += ')';
  if (part2) formatted += ` ${part2}`;
  if (part3) formatted += `-${part3}`;
  if (part4) formatted += `-${part4}`;
  if (extraDigits) formatted += extraDigits;

  return formatted;
}

export function validateRussianMobilePhone(value: string): PhoneValidationResult {
  const digits = getPhoneDigits(value);
  const normalizedDigits = toRussianMobileDigits(value);
  const normalized = normalizedDigits.length === 11 ? `+${normalizedDigits}` : '';

  const isValid =
    !hasPhoneLetters(value) &&
    normalizedDigits.length === 11 &&
    digits.length <= 11 &&
    normalizedDigits[0] === '7' &&
    normalizedDigits[1] === '9';

  return {
    isValid,
    error: isValid ? '' : phoneError,
    formatted: formatRussianPhone(value),
    normalized,
  };
}

export function normalizeRussianMobilePhone(value: string) {
  const result = validateRussianMobilePhone(value);
  return result.isValid ? result.normalized : '';
}

export function isRussianMobilePhoneComplete(value: string) {
  return validateRussianMobilePhone(value).isValid;
}
