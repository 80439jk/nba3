export const generateTransactionId = (): string => {
  return crypto.randomUUID();
};
