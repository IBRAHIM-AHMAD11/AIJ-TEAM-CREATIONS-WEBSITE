import { z } from 'zod';
import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';

// 1. Initialize zxcvbn
const options = {
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: { ...zxcvbnCommonPackage.dictionary },
};
const zxcvbn = new ZxcvbnFactory(options);

// 2. Your base schema (checks characters and min-strength)
export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long.' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
  .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one symbol.' })
  .refine((val) => zxcvbn.check(val).score >= 3, {
    message: 'Password is too weak or too common.',
  });

// 3. Helper to map zxcvbn 0-4 score to a 1-10 level
const getSecurityLevel = (score: number): number => {
  const mapping: Record<number, number> = {
    0: 1,  // Risky / Very weak
    1: 3,  // Weak
    2: 5,  // Medium
    3: 8,  // Strong
    4: 10, // Very Strong
  };
  return mapping[score] || 1;
};

// 4. Enhanced Validator Function
const passwordValidator = (password: string) => {
  const result = passwordSchema.safeParse(password);
  
  // Always calculate the zxcvbn score regardless of regex success
  const zxcvbnScore = zxcvbn.check(password).score;
  const securityLevel = getSecurityLevel(zxcvbnScore);

  return {
    success: result.success,
    securityLevel: securityLevel, // Returns 1, 3, 5, 8, or 10
    errorMessage: result.success ? null : result.error.issues[0].message,
  };
};

export default passwordValidator;