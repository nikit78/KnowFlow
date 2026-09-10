import { OAuth2Client } from "google-auth-library";

export interface GoogleUserPayload {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}

const getGoogleClientId = (): string => {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not defined");
  }

  return clientId;
};

export const verifyGoogleIdToken = async (
  idToken: string
): Promise<GoogleUserPayload> => {
  if (!idToken || !idToken.trim()) {
    throw new Error("Google ID token is required");
  }

  const client = new OAuth2Client(getGoogleClientId());

  const ticket = await client.verifyIdToken({
    idToken,
    audience: getGoogleClientId(),
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google ID token");
  }

  if (!payload.sub) {
    throw new Error("Google account ID is missing");
  }

  if (!payload.email) {
    throw new Error("Google account email is missing");
  }

  if (!payload.email_verified) {
    throw new Error("Google email is not verified");
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase().trim(),
    name: payload.name?.trim() || "Google User",
    picture: payload.picture,
    emailVerified: payload.email_verified,
  };
};