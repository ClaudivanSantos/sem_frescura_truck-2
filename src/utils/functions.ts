import { Linking } from "react-native";

export interface IopenInWeb {
  link: string;
}

export const isValidDate = (dateString: string): boolean => {
  // Regex para verificar o formato dd/mm/aaaa
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(regex);

  if (!match) return false; // Se a data não corresponder ao regex, retorna falso

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Verifica se o mês está entre 1 e 12
  if (month < 1 || month > 12) return false;

  // Verifica o número máximo de dias para o mês
  const daysInMonth = new Date(year, month, 0).getDate();

  // Verifica se o dia é válido para o mês
  if (day < 1 || day > daysInMonth) return false;

  // Verifica se o ano é válido (por exemplo, entre 1900 e 2100)
  if (year < 1900 || year > 2100) return false;

  return true;
};

export async function openInWeb({ link }: IopenInWeb) {
  await Linking.openURL(link);
}

export function generateUUID() {
  let d = new Date().getTime();
  let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
