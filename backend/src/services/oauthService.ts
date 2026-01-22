import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import { env } from "../config/env.js";
import { pool } from "../database/pool.js";
import type { PublicUser, User } from "../models/user.js";
import { toPublicUser } from "../models/user.js";
import { hashPassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";

const googleClient = new OAuth2Client(env.googleClientId);

const oauthRequestSchema = z.object({
  idToken: z.string().min(1, "ID token is required."),
});

interface GoogleIdTokenPayload {
  email: string;
  email_verified: boolean;
  given_name?: string;
  family_name?: string;
}

export async function loginWithGoogle(
  input: unknown
): Promise<{ user: PublicUser; accessToken: string; refreshToken: string }> {
  const data = oauthRequestSchema.parse(input);
  const idToken = data.idToken;

  if (!env.googleClientId) {
    const error = new Error("Google OAuth is not configured on the server.");
    (error as any).statusCode = 500;
    throw error;
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.googleClientId
  });

  const payload = ticket.getPayload() as GoogleIdTokenPayload | undefined;

  if (!payload?.email || !payload.email_verified) {
    const error = new Error("Google account email is not verified.");
    (error as any).statusCode = 400;
    throw error;
  }

  const email = payload.email.toLowerCase();
  const firstName = payload.given_name || "Google";
  const lastName = payload.family_name || "User";

  const existing = await pool.query<User>("SELECT * FROM users WHERE email = $1", [
    email
  ]);

  let user: User;

  if (existing.rows.length > 0) {
    user = existing.rows[0];
  } else {
    // Generate a random password hash for OAuth-only users; they do not log in via password.
    const randomPasswordHash = await hashPassword(
      `oauth-${Date.now().toString(36)}-${Math.random().toString(36)}`
    );

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Check if a customer already exists with this email
      const existingCustomer = await client.query(
        "SELECT id FROM customers WHERE email = $1",
        [email]
      );

      const customerId = existingCustomer.rows.length > 0 ? existingCustomer.rows[0].id : null;

      const insert = await client.query<User>(
        `
          INSERT INTO users (first_name, last_name, email, password_hash, role, is_email_verified, customer_id)
          VALUES ($1, $2, $3, $4, $5, true, $6)
          RETURNING *
        `,
        [firstName, lastName, email, randomPasswordHash, "user", customerId]
      );

      user = insert.rows[0];

      // If customer existed, link it back to the user
      if (customerId) {
        await client.query(
          "UPDATE customers SET user_id = $1 WHERE id = $2",
          [user.id, customerId]
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id, user.role);

  await pool.query("UPDATE users SET refresh_token = $1, updated_at = NOW() WHERE id = $2", [
    refreshToken,
    user.id
  ]);

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken
  };
}



