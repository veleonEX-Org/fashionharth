import { randomBytes } from "crypto";
import { z } from "zod";
import { pool } from "../database/pool.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import type { PublicUser, User } from "../models/user.js";
import { toPublicUser } from "../models/user.js";
import { env } from "../config/env.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./emailService.js";
import { createCustomer, updateCustomer } from "./customerService.js";

const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required.")
    .max(100, "First name must be less than 100 characters."),
  lastName: z
    .string()
    .min(1, "Last name is required.")
    .max(100, "Last name must be less than 100 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long."),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export async function registerUser(input: unknown): Promise<string> {
  const data = registerSchema.parse(input);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [data.email]
    );
    if (existing.rows.length > 0) {
      const error = new Error("Email is already in use.");
      (error as any).statusCode = 400;
      throw error;
    }

    const passwordHash = await hashPassword(data.password);
    const verificationToken = randomBytes(32).toString("hex");

    // Check if a customer already exists with this email
    const existingCustomer = await client.query(
      "SELECT id FROM customers WHERE email = $1",
      [data.email]
    );

    const customerId = existingCustomer.rows.length > 0 ? existingCustomer.rows[0].id : null;

    const result = await client.query(
      `
        INSERT INTO users (first_name, last_name, email, password_hash, role, is_email_verified, email_verification_token, customer_id)
        VALUES ($1, $2, $3, $4, $5, false, $6, $7)
        RETURNING id
      `,
      [
        data.firstName,
        data.lastName,
        data.email,
        passwordHash,
        "user",
        verificationToken,
        customerId
      ]
    );

    const userId = result.rows[0].id;

    // If customer existed, link it back to the user
    if (customerId) {
      await client.query(
        "UPDATE customers SET user_id = $1 WHERE id = $2",
        [userId, customerId]
      );
    }

    await client.query("COMMIT");

    // Send verification email (outside transaction)
    try {
      await sendVerificationEmail(data.email, verificationToken);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      console.log(`Email verification link: ${env.appUrl}/verify-email?token=${verificationToken}`);
    }

    return verificationToken;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function loginUser(
  input: unknown
): Promise<{ user: PublicUser; accessToken: string; refreshToken: string }> {
  const data = loginSchema.parse(input);

  const result = await pool.query<User & { phone: string | null; dob: Date | null }>(
    `
      SELECT u.*, c.phone, c.dob
      FROM users u
      LEFT JOIN customers c ON u.customer_id = c.id
      WHERE u.email = $1
    `,
    [data.email]
  );
  const user = result.rows[0];

  if (!user) {
    const error = new Error("Invalid email or password.");
    (error as any).statusCode = 401;
    throw error;
  }

  const isValid = await comparePassword(data.password, user.password_hash);
  if (!isValid) {
    const error = new Error("Invalid email or password.");
    (error as any).statusCode = 401;
    throw error;
  }

  if (!user.is_email_verified) {
    const error = new Error("Please verify your email before logging in.");
    (error as any).statusCode = 403;
    throw error;
  }

  if (user.status === "disabled") {
    const error = new Error("Your account has been disabled. Please contact the administrator.");
    (error as any).statusCode = 403;
    throw error;
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id, user.role);

  await pool.query(
    "UPDATE users SET refresh_token = $1, updated_at = NOW() WHERE id = $2",
    [refreshToken, user.id]
  );

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
  };
}

export async function refreshTokens(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const payload = verifyRefreshToken(refreshToken);

  const result = await pool.query<User & { phone: string | null; dob: Date | null }>(
    `
      SELECT u.*, c.phone, c.dob
      FROM users u
      LEFT JOIN customers c ON u.customer_id = c.id
      WHERE u.id = $1
    `,
    [payload.sub]
  );
  const user = result.rows[0];

  if (!user || user.refresh_token !== refreshToken) {
    const error = new Error("Invalid refresh token.");
    (error as any).statusCode = 401;
    throw error;
  }

  const newAccessToken = signAccessToken(user.id, user.role);
  const newRefreshToken = signRefreshToken(user.id, user.role);

  await pool.query(
    "UPDATE users SET refresh_token = $1, updated_at = NOW() WHERE id = $2",
    [newRefreshToken, user.id]
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function verifyEmail(token: string): Promise<void> {
  const result = await pool.query<User>(
    "SELECT * FROM users WHERE email_verification_token = $1",
    [token]
  );
  const user = result.rows[0];

  if (!user) {
    const error = new Error("Invalid verification token.");
    (error as any).statusCode = 400;
    throw error;
  }

  await pool.query(
    `
      UPDATE users
      SET is_email_verified = true,
          email_verification_token = NULL,
          updated_at = NOW()
      WHERE id = $1
    `,
    [user.id]
  );
}

export async function requestPasswordReset(email: string): Promise<void> {
  const result = await pool.query<User>(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  const user = result.rows[0];

  if (!user) {
    // Do not reveal that the email does not exist.
    return;
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await pool.query(
    `
      UPDATE users
      SET reset_password_token = $1,
          reset_password_expires_at = $2,
          updated_at = NOW()
      WHERE id = $3
    `,
    [token, expiresAt, user.id]
  );

  // Send password reset email
  try {
    await sendPasswordResetEmail(email, token);
  } catch (error) {
    // Log error but don't fail the request
    console.error("Failed to send password reset email:", error);
    // Fallback: log the link for development
    console.log(
      `Password reset link: ${env.appUrl}/reset-password?token=${token}`
    );
  }
}

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long."),
});

export async function resetPassword(
  input: unknown
): Promise<void> {
  const data = resetPasswordSchema.parse(input);
  const { token, password: newPassword } = data;

  const result = await pool.query<User>(
    "SELECT * FROM users WHERE reset_password_token = $1",
    [token]
  );
  const user = result.rows[0];

  if (
    !user ||
    !user.reset_password_expires_at ||
    user.reset_password_expires_at < new Date()
  ) {
    const error = new Error("Reset token is invalid or expired.");
    (error as any).statusCode = 400;
    throw error;
  }

  const passwordHash = await hashPassword(newPassword);

  await pool.query(
    `
      UPDATE users
      SET password_hash = $1,
          reset_password_token = NULL,
          reset_password_expires_at = NULL,
          updated_at = NOW()
      WHERE id = $2
    `,
    [passwordHash, user.id]
  );
}

export async function logoutUser(userId: number): Promise<void> {
  await pool.query(
    "UPDATE users SET refresh_token = NULL, updated_at = NOW() WHERE id = $1",
    [userId]
  );
}

export async function getUserById(id: number): Promise<PublicUser | null> {
  const result = await pool.query<User & { phone: string | null; dob: Date | null }>(
    `
      SELECT u.*, c.phone, c.dob
      FROM users u
      LEFT JOIN customers c ON u.customer_id = c.id
      WHERE u.id = $1
    `,
    [id]
  );
  const user = result.rows[0];
  return user ? toPublicUser(user) : null;
}

const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required.")
    .max(100, "First name must be less than 100 characters."),
  lastName: z
    .string()
    .min(1, "Last name is required.")
    .max(100, "Last name must be less than 100 characters."),
  phone: z.string().optional().nullable(),
  dob: z.string().optional().nullable(),
});

export async function updateUserProfile(
  id: number,
  input: unknown
): Promise<PublicUser> {
  const data = profileUpdateSchema.parse(input);
  const { firstName, lastName, phone, dob } = data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Update User basic info
    const userResult = await client.query<User>(
      `
        UPDATE users
        SET first_name = $1,
            last_name = $2,
            updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `,
      [firstName, lastName, id]
    );

    const user = userResult.rows[0];
    if (!user) {
      const error = new Error("User not found.");
      (error as any).statusCode = 404;
      throw error;
    }

    // 2. Handle Customer record for Phone/DOB
    let customerId = user.customer_id;

    if (customerId) {
      // Update existing customer
      await updateCustomer(customerId, {
        name: `${firstName} ${lastName}`,
        phone: phone || undefined,
        dob: dob || undefined,
      }, client);
    } else if (phone || dob) {
      // Create new customer if providing additional info
      const customer = await createCustomer({
        name: `${firstName} ${lastName}`,
        email: user.email,
        phone: phone || undefined,
        dob: dob || undefined,
        userId: user.id,
      }, client);
      customerId = customer.id;
      
      // Don't need to manually update user.customer_id as createCustomer does it
      // But we need to refresh our local user object for the return value
      user.customer_id = customerId;
    }

    await client.query("COMMIT");

    // 3. Return combined data
    // We need to fetch the fresh data to ensure we have the correct phone/dob
    const finalResult = await pool.query<User & { phone: string | null; dob: Date | null }>(
      `
        SELECT u.*, c.phone, c.dob
        FROM users u
        LEFT JOIN customers c ON u.customer_id = c.id
        WHERE u.id = $1
      `,
      [id]
    );

    return toPublicUser(finalResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function resendVerificationEmail(email: string): Promise<string> {
  const result = await pool.query<User>(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  const user = result.rows[0];

  if (!user) {
    const error = new Error("User not found.");
    (error as any).statusCode = 404;
    throw error;
  }

  if (user.is_email_verified) {
    const error = new Error("Email is already verified.");
    (error as any).statusCode = 400;
    throw error;
  }

  const verificationToken = randomBytes(32).toString("hex");

  await pool.query(
    `
      UPDATE users
      SET email_verification_token = $1,
          updated_at = NOW()
      WHERE id = $2
    `,
    [verificationToken, user.id]
  );

  // Send verification email
  try {
    await sendVerificationEmail(email, verificationToken);
  } catch (error) {
    // Log error but don't fail the request
    console.error("Failed to send verification email:", error);
    // Fallback: log the link for development
    console.log(
      `Email verification link: ${env.appUrl}/verify-email?token=${verificationToken}`
    );
  }

  return verificationToken;
}


const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "Password must be at least 8 characters long."),
});

export async function changePassword(
  userId: number,
  input: unknown
): Promise<void> {
  const data = changePasswordSchema.parse(input);
  const { currentPassword, newPassword } = data;

  const result = await pool.query<User>("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);
  const user = result.rows[0];

  if (!user) {
    const error = new Error("User not found.");
    (error as any).statusCode = 404;
    throw error;
  }

  const isValid = await comparePassword(currentPassword, user.password_hash);
  if (!isValid) {
    const error = new Error("Incorrect current password.");
    (error as any).statusCode = 401;
    throw error;
  }

  const newPasswordHash = await hashPassword(newPassword);

  await pool.query(
    "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
    [newPasswordHash, userId]
  );
}
