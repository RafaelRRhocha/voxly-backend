import { Request, Response, NextFunction } from 'express';

interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'email' | 'number';
  minLength?: number;
  maxLength?: number;
}

export const validateRequest = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    
    for (const rule of rules) {
      const value = req.body[rule.field];
      
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field} is required`);
        continue;
      }
      
      if (value !== undefined && value !== null && value !== '') {
        if (rule.type === 'string' && typeof value !== 'string') {
          errors.push(`${rule.field} must be a string`);
        }
        
        if (rule.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push(`${rule.field} must be a valid email`);
          }
        }
        
        if (rule.type === 'number' && typeof value !== 'number') {
          errors.push(`${rule.field} must be a number`);
        }
        
        if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
          errors.push(`${rule.field} must be at least ${rule.minLength} characters long`);
        }
        
        if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
          errors.push(`${rule.field} must be at most ${rule.maxLength} characters long`);
        }
      }
    }
    
    if (errors.length > 0) {
      res.status(400).json({ error: errors.join(', ') });
      return;
    }
    
    next();
  };
};

export const validateLogin = validateRequest([
  { field: 'email', required: true, type: 'email' },
  { field: 'password', required: true, type: 'string', minLength: 1 }
]);

export const validateRegister = validateRequest([
  { field: 'email', required: true, type: 'email' },
  { field: 'password', required: true, type: 'string', minLength: 6 },
  { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 }
]);

export const validateRefreshToken = validateRequest([
  { field: 'email', required: true, type: 'email' }
]);

export const validateForgotPassword = validateRequest([
  { field: 'email', required: true, type: 'email' }
]);

export const validateResetPassword = validateRequest([
  { field: 'token', required: true, type: 'string', minLength: 1 },
  { field: 'password', required: true, type: 'string', minLength: 6 }
]);

export const validateUpdateProfile = validateRequest([
  { field: 'name', required: false, type: 'string', minLength: 2, maxLength: 100 },
  { field: 'email', required: false, type: 'email' },
  { field: 'password', required: false, type: 'string', minLength: 6 }
]);
