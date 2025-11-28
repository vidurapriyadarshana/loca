// JWT Payload interface
export interface JwtPayload {
  id: string;
}

// Augment the Express Request object
declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}