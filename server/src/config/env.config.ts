import { config } from "dotenv";

config({
    path: `.env.${process.env.NODE_ENV || 'development'}.local`
});

// --- Validation ---
const requiredEnvVars = [
    'DB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'SERVER_URL',
    'CLIENT_URL',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
        throw new Error(`FATAL ERROR: Environment variable "${varName}" is not set.`);
    }
}

export const PORT = parseInt(process.env.PORT || '3001', 10);
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const DB_URI = process.env.DB_URI!;

export const JWT_SECRET = process.env.JWT_SECRET!;
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '15m';

export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!; 
export const JWT_REFRESH_EXPIRES_IN: string = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

export const SERVER_URL = process.env.SERVER_URL!;
export const CLIENT_URL = process.env.CLIENT_URL!;

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;