export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('880') && digits.length >= 13) {
    digits = '0' + digits.slice(3);
  }
  if (digits.startsWith('1') && digits.length === 10) {
    digits = '0' + digits;
  }
  return digits;
}

export function isValidBDPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^01[3-9]\d{8}$/.test(normalized);
}
