export const formatDOB = (value: string): string => {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;

  return `${digits.slice(0, 2)} / ${digits.slice(2, 4)} / ${digits.slice(4, 8)}`;
};

export const parseDOB = (formatted: string): string => {
  return formatted.replace(/\s/g, '').replace(/\//g, '');
};

export const convertDOBToISO = (formatted: string): string => {
  const cleaned = formatted.replace(/\s/g, '').replace(/\//g, '');

  if (cleaned.length !== 8) return cleaned;

  const month = cleaned.slice(0, 2);
  const day = cleaned.slice(2, 4);
  const year = cleaned.slice(4, 8);

  return `${year}-${month}-${day}`;
};
