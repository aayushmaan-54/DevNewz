/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { JWTExpired, JWTInvalid } from 'jose/errors';


const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN!;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  domain: process.env.NODE_ENV === 'production'
    ? process.env.COOKIE_DOMAIN
    : undefined,
};



export async function hashPassword(plainPassword: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const iterations = 100000;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(plainPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-512' },
    key,
    512
  );

  return `${iterations}:${Buffer.from(salt).toString('hex')}:${Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, '0')).join('')
    }`;
}


export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  const parts = hashedPassword.split(':');
  if (parts.length !== 3) throw new Error('Invalid hash format');

  const [iterationsStr, saltHex, storedHash] = parts;
  const salt = Uint8Array.from(Buffer.from(saltHex, 'hex'));

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(plainPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: parseInt(iterationsStr), hash: 'SHA-512' },
    key,
    512
  );

  return storedHash === Array.from(new Uint8Array(derived))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}


export const generateAccessToken = async (userId: string, username: string) => {
  const secret = new TextEncoder().encode(JWT_SECRET);

  const expirationTime = JWT_EXPIRES_IN;

  const token = await new SignJWT({
    userId,
    username
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secret);

  const expiryTime = Date.now() + 60 * 24 * 60 * 60 * 1000; // 60 days in milliseconds

  return { token, expiryTime };
};


export const setAuthCookie = async (token: string, expiryTime: number, username: string) => {
  const maxAge = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    ...COOKIE_OPTIONS,
    maxAge
  });

  cookieStore.set('username', username, {
    ...COOKIE_OPTIONS,
    maxAge
  });
};


export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
      { algorithms: ['HS256'] },
    );
    return payload;
  } catch (error) {
    if (error instanceof JWTExpired) throw new Error('Token expired');
    if (error instanceof JWTInvalid) throw new Error('Invalid token');
    throw new Error('Authentication failed');
  }
};


export const clearAuthCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
};


export const getAuthCookie = async () => {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value;
};


export const decodedAuthToken = async () => {
  const token = await getAuthCookie();

  if (!token) {
    throw new Error("Unauthorized");
  }

  try {
    const decoded = await verifyToken(token);
    return decoded;
  } catch (err: any) {
    throw new Error('Invalid token: ', err.message);
  }
}


export const generateResetPasswordToken = async (): Promise<string> => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};


export const hashResetPasswordToken = async (token: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};


export const generateRandomString = (length: number): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  let result = '';

  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }

  return result;
};


export const generateRandomCredentials = () => {
  const USERNAME_LENGTH = 8;
  const PASSWORD_LENGTH = 16;

  return {
    username: generateRandomString(USERNAME_LENGTH),
    password: generateRandomString(PASSWORD_LENGTH)
  };
}