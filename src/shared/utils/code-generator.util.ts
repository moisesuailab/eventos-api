/**
 * Gera código alfanumérico de 6 caracteres
 * Formato: 3 letras + 3 números (ex: ABC123)
 * Sem caracteres ambíguos: 0, O, I, 1, l
 */
export const generateGuestCode = (): string => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '23456789';
  
  let code = '';
  
  // 3 letras
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // 3 números
  for (let i = 0; i < 3; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return code;
};

/**
 * Gera código único com verificação no banco (dentro de um evento)
 */
export const generateUniqueCode = async (
  checkExists: (code: string) => Promise<boolean>
): Promise<string> => {
  let code = generateGuestCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (await checkExists(code) && attempts < maxAttempts) {
    code = generateGuestCode();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique code');
  }

  return code;
};