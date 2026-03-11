// Environment configuration
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
