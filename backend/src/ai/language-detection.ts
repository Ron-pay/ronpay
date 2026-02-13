/**
 * Language detection utility for multi-language NLP support
 * Supports: English, Spanish, Portuguese, French
 */

export type SupportedLanguage = 'en' | 'es' | 'pt' | 'fr';

// Common words and patterns for each language
const LANGUAGE_PATTERNS = {
  es: {
    keywords: ['enviar', 'mandar', 'transferir', 'pagar', 'comprar', 'saldo', 'cuenta', 'pesos', 'euros'],
    greetings: ['hola', 'buenos', 'gracias'],
    numbers: ['uno', 'dos', 'tres', 'cien', 'mil'],
  },
  pt: {
    keywords: ['enviar', 'mandar', 'transferir', 'pagar', 'comprar', 'saldo', 'conta', 'reais', 'euros'],
    greetings: ['olá', 'oi', 'bom', 'obrigado'],
    numbers: ['um', 'dois', 'três', 'cem', 'mil'],
  },
  fr: {
    keywords: ['envoyer', 'transférer', 'payer', 'acheter', 'solde', 'compte', 'euros'],
    greetings: ['bonjour', 'salut', 'merci'],
    numbers: ['un', 'deux', 'trois', 'cent', 'mille'],
  },
  en: {
    keywords: ['send', 'transfer', 'pay', 'buy', 'balance', 'account', 'dollars'],
    greetings: ['hello', 'hi', 'thanks'],
    numbers: ['one', 'two', 'three', 'hundred', 'thousand'],
  },
};

/**
 * Detect language from user message
 * @param message User's natural language message
 * @returns Detected language code (defaults to 'en' if uncertain)
 */
export function detectLanguage(message: string): SupportedLanguage {
  const normalizedMessage = message.toLowerCase();
  
  const scores: Record<SupportedLanguage, number> = {
    en: 0,
    es: 0,
    pt: 0,
    fr: 0,
  };

  // Score each language based on keyword matches
  for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    const allWords = [
      ...patterns.keywords,
      ...patterns.greetings,
      ...patterns.numbers,
    ];

    allWords.forEach((word) => {
      if (normalizedMessage.includes(word)) {
        scores[lang as SupportedLanguage] += 1;
      }
    });
  }

  // Find language with highest score
  const detectedLang = (Object.keys(scores) as SupportedLanguage[]).reduce((a, b) =>
    scores[a] > scores[b] ? a : b
  );

  // Return detected language, or default to English if no matches
  return scores[detectedLang] > 0 ? detectedLang : 'en';
}

/**
 * Get currency based on language/region
 */
export function getDefaultCurrency(language: SupportedLanguage): string {
  const currencyMap: Record<SupportedLanguage, string> = {
    en: 'USDm',
    es: 'USDm', // Latin America uses USD or local currencies
    pt: 'BRLm', // Portuguese → Brazilian Real
    fr: 'EURm', // French → Euro
  };

  return currencyMap[language];
}

/**
 * Get example amount format for language
 */
export function getAmountFormat(language: SupportedLanguage, amount: number): string {
  const formats: Record<SupportedLanguage, string> = {
    en: `$${amount}`,
    es: `$${amount}`, // USD or local currency symbol
    pt: `R$ ${amount}`,
    fr: `${amount}€`,
  };

  return formats[language];
}
