import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { type Request, type Response, type NextFunction } from "express";
import { storage } from "./storage";
import { signupSchema, loginSchema, type User } from "@shared/schema";

// JWT secret - in production, this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";
const VERIFICATION_TOKEN_EXPIRY_HOURS = 1;

// Generate a secure random verification token
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

// Generate JWT token
export function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Auth middleware - protects routes
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Check for token in Authorization header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") 
      ? authHeader.substring(7)
      : req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
}

// Optional auth middleware - doesn't fail if no token
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") 
      ? authHeader.substring(7)
      : req.cookies?.token;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
        };
      }
    }

    next();
  } catch (error) {
    // Silently continue without auth
    next();
  }
}

// Signup handler
export async function signup(req: Request, res: Response) {
  try {
    // Validate input
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: "Invalid input", 
        details: result.error.errors 
      });
    }

    const { email, password, name } = result.data;

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "User already exists with this email" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate verification token and expiry
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(
      Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
    );

    // Create user (not verified yet)
    const user = await storage.createUser({
      email,
      passwordHash,
      name,
      username: email.split("@")[0], // Default username from email
      avatar: null,
    });

    // Update user with verification token
    await storage.updateUserVerification(user.id, {
      verificationToken,
      verificationExpires,
      emailVerified: false,
    });

    // Return verification info (no token, user cannot log in yet)
    // In production, we would send an email here
    res.json({
      needsVerification: true,
      verifyUrl: `/verify-email?token=${verificationToken}`,
      message: "Account created. Please verify your email to continue.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
}

// Login handler
export async function login(req: Request, res: Response) {
  try {
    // Validate input
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: "Invalid input", 
        details: result.error.errors 
      });
    }

    const { email, password } = result.data;

    // Get user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if email is verified
    // Don't reveal whether password was correct if not verified
    if (!user.emailVerified) {
      return res.status(400).json({ 
        error: "Email not verified",
        needsVerification: true,
        email: user.email,
      });
    }

    // Generate token
    const token = generateToken(user);

    // Return user and token
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        memberSince: user.memberSince,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
}

// Logout handler
export async function logout(req: Request, res: Response) {
  // For JWT, logout is mainly handled client-side by removing the token
  // If using cookies, we would clear them here
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
}

// Get current user
export async function getCurrentUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Fetch full user details
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user stats
    const stats = await storage.getUserStats(user.id);

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      memberSince: user.memberSince,
      stats,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
}

// Verify email handler
export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Token is required" });
    }

    // Find user by verification token
    const user = await storage.getUserByVerificationToken(token);
    
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Check if token has expired
    if (user.verificationExpires && new Date() > user.verificationExpires) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Mark email as verified and clear token
    await storage.updateUserVerification(user.id, {
      emailVerified: true,
      verificationToken: null,
      verificationExpires: null,
    });

    res.json({ 
      verified: true,
      message: "Email verified successfully. You may now log in.",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ error: "Failed to verify email" });
  }
}

// Resend verification email handler (stub)
export async function resendVerification(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user by email
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ 
        message: "If an account exists with this email, a verification link will be sent.",
      });
    }

    if (user.emailVerified) {
      return res.json({ 
        message: "Email is already verified. You can log in.",
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(
      Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
    );

    await storage.updateUserVerification(user.id, {
      verificationToken,
      verificationExpires,
    });

    // In production, send email here
    // For now, return the verification URL
    res.json({ 
      message: "If an account exists with this email, a verification link will be sent.",
      // DEV ONLY: Include the verify URL for testing
      verifyUrl: `/verify-email?token=${verificationToken}`,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Failed to resend verification" });
  }
}

