/// <reference types="vite/client" />
import { jwtDecode } from 'jwt-decode';
import { AuthUser, GoogleAuthConfig } from '../types';

const LOCAL_USER_KEY = 'minimalist_todo_google_user';
const LOCAL_GOOGLE_CLIENT_ID_KEY = 'minimalist_todo_google_client_id';

const DEFAULT_GOOGLE_CLIENT_ID = '744033084576-074mfbs3k9vqsmd4rjlmmuf26gcinqnt.apps.googleusercontent.com';
const envGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;

export function getStoredGoogleClientId(): string {
  try {
    const saved = localStorage.getItem(LOCAL_GOOGLE_CLIENT_ID_KEY);
    if (saved) return saved.trim();
  } catch (e) {
    console.error('Failed to load Google Client ID', e);
  }
  return (envGoogleClientId || DEFAULT_GOOGLE_CLIENT_ID).trim();
}

export function saveStoredGoogleClientId(clientId: string): void {
  try {
    localStorage.setItem(LOCAL_GOOGLE_CLIENT_ID_KEY, clientId.trim());
  } catch (e) {
    console.error('Failed to save Google Client ID', e);
  }
}

export function getStoredAuthUser(): AuthUser | null {
  try {
    const saved = localStorage.getItem(LOCAL_USER_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to read auth user', e);
  }
  return null;
}

export function saveStoredAuthUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
    // Dispatch custom event for reactive UI updates across components
    window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: user }));
  } catch (e) {
    console.error('Failed to store auth user', e);
  }
}

export interface GoogleJwtPayload {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
}

/**
 * Handle successful Google OAuth credential response (Passport / Google Identity Services)
 */
export function handleGoogleCredentialResponse(credentialResponse: { credential?: string }): {
  user: AuthUser | null;
  error: Error | null;
} {
  try {
    if (!credentialResponse?.credential) {
      return { user: null, error: new Error('No Google credentials token received') };
    }

    const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential);
    if (!decoded || !decoded.email) {
      return { user: null, error: new Error('Invalid Google credential payload') };
    }

    const authUser: AuthUser = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name || decoded.given_name || decoded.email.split('@')[0],
      picture: decoded.picture,
      provider: 'google',
    };

    saveStoredAuthUser(authUser);
    return { user: authUser, error: null };
  } catch (err: any) {
    console.error('Failed to decode Google JWT credential', err);
    return { user: null, error: new Error(err.message || 'Failed to authenticate with Google') };
  }
}

/**
 * Sign out Google user
 */
export function signOutUser(): void {
  saveStoredAuthUser(null);
}
