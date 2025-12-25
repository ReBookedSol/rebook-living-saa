// Bad words list - common profanities and abusive terms
const BAD_WORDS = [
  // Profanities
  'damn', 'shit', 'crap', 'hell', 'piss', 'ass', 'fuck', 'bitch', 'bastard',
  'arsehole', 'asshole', 'dick', 'cock', 'pussy', 'twat', 'wanker',
  // Slurs and dehumanizing terms
  'retard', 'idiot', 'stupid', 'dumb', 'moron', 'imbecile',
  'slut', 'whore', 'tramp', 'ho',
  // Additional offensive terms
  'cunt', 'prick', 'knob', 'tosser'
];

// Build a map for case-insensitive matching
const BAD_WORDS_MAP = new Map(
  BAD_WORDS.map(word => [word.toLowerCase(), true])
);

export interface ContentModerationResult {
  isClean: boolean;
  flaggedTerms: string[];
  severity: 'low' | 'medium' | 'high';
}

/**
 * Check if content contains vulgar, abusive, or dehumanizing language
 * @param content - The text to moderate
 * @returns Object with moderation results
 */
export function moderateContent(content: string): ContentModerationResult {
  if (!content || content.trim().length === 0) {
    return { isClean: true, flaggedTerms: [], severity: 'low' };
  }

  const lowerContent = content.toLowerCase();
  const words = lowerContent.match(/\b\w+\b/g) || [];
  const flaggedTerms: string[] = [];

  words.forEach(word => {
    if (BAD_WORDS_MAP.has(word) && !flaggedTerms.includes(word)) {
      flaggedTerms.push(word);
    }
  });

  if (flaggedTerms.length === 0) {
    return { isClean: true, flaggedTerms: [], severity: 'low' };
  }

  // Determine severity based on number of flagged terms
  const severity: 'low' | 'medium' | 'high' =
    flaggedTerms.length === 1 ? 'low' :
    flaggedTerms.length <= 3 ? 'medium' :
    'high';

  return {
    isClean: false,
    flaggedTerms,
    severity
  };
}

/**
 * Check if text contains ONLY vulgar/abusive language (no legitimate feedback)
 * Returns true if the content is purely abusive
 */
export function isPurelyAbusive(content: string): boolean {
  const moderation = moderateContent(content);
  if (moderation.isClean) return false;

  // If severity is high and flagged terms are many, likely pure abuse
  return moderation.severity === 'high' && moderation.flaggedTerms.length > 2;
}

/**
 * Flag reason suggestions based on moderation
 */
export function getFlagReason(moderation: ContentModerationResult): string {
  if (moderation.isClean) return '';

  const reasons = [];
  
  if (moderation.severity === 'high') {
    reasons.push('Vulgar language detected');
  } else if (moderation.severity === 'medium') {
    reasons.push('Inappropriate language detected');
  } else {
    reasons.push('Mild profanity detected');
  }

  if (moderation.flaggedTerms.length > 0) {
    reasons.push(`Contains: ${moderation.flaggedTerms.join(', ')}`);
  }

  return reasons.join(' - ');
}
