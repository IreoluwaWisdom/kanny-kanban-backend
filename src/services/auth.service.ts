import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import prisma from '../config/database';
import { getFirebaseAdmin } from '../config/firebase';
import { RefreshToken } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async signup(email: string, password: string, name: string) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar || undefined,
      },
      ...tokens,
    };
  }

  async firebaseAuth(idToken: string) {
    const admin = getFirebaseAdmin();
    if (!admin) {
      throw new Error('Firebase Admin is not configured. Please set FIREBASE_SERVICE_ACCOUNT environment variable.');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid: firebaseId, email } = decodedToken as { uid: string; email?: string; email_verified?: boolean };
      if (!email) throw new Error('Email not provided by Firebase');
      if (decodedToken && (decodedToken as any).email_verified === false) {
        throw new Error('Please verify your email before signing in');
      }

      // Try to fetch additional profile data
      let firebaseUser: import('firebase-admin').auth.UserRecord | null = null;
      try {
        firebaseUser = await admin.auth().getUser(firebaseId);
      } catch {
        firebaseUser = null;
      }

      const name = firebaseUser?.displayName || email.split('@')[0];
      const picture = firebaseUser?.photoURL || null;

      // Find or create user
      let user = await prisma.user.findFirst({
        where: { OR: [{ email }, { googleId: firebaseId }] },
        select: { id: true, email: true, name: true, avatar: true, googleId: true, createdAt: true },
      });

      if (user) {
        // Ensure googleId/avatar are synced
        if (!user.googleId || (picture && picture !== user.avatar)) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: firebaseId,
              avatar: picture ?? user.avatar,
              name: user.name || name,
            },
            select: { id: true, email: true, name: true, avatar: true, googleId: true, createdAt: true },
          });
        }
      } else {
        user = await prisma.user.create({
          data: { email, name, googleId: firebaseId, avatar: picture },
          select: { id: true, email: true, name: true, avatar: true, googleId: true, createdAt: true },
        });
      }

      const tokens = await this.generateTokens(user!.id);
      return {
        user: { id: user!.id, email: user!.email, name: user!.name, avatar: user!.avatar || undefined },
        ...tokens,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Firebase authentication failed');
    }
  }
  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user has password
    if (!user.password) {
      throw new Error("This account doesn't have a password set.");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar || undefined,
      },
      ...tokens,
    };
  }

  // Google/Firebase authentication removed

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string; tokenId: string };

      // Verify token exists in database
      const tokenRecord = await prisma.refreshToken.findUnique({
        where: { id: decoded.tokenId },
        include: { user: true },
      });

      if (!tokenRecord || tokenRecord.userId !== decoded.userId) {
        throw new Error('Invalid refresh token');
      }

      if (tokenRecord.expiresAt < new Date()) {
        // Token expired, delete it
        await prisma.refreshToken.delete({
          where: { id: decoded.tokenId },
        });
        throw new Error('Refresh token expired');
      }

      // Generate new tokens
      return await this.generateTokens(decoded.userId);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      throw error;
    }
  }

  private async generateTokens(userId: string): Promise<AuthTokens> {
    // Generate access token
    const accessToken = jwt.sign(
      { userId },
      JWT_SECRET as Secret,
      { expiresIn: JWT_ACCESS_EXPIRES_IN } as SignOptions
    );

    // Generate refresh token
    const refreshTokenId = require('crypto').randomBytes(32).toString('hex');
    const refreshToken = jwt.sign(
      { userId, tokenId: refreshTokenId },
      JWT_REFRESH_SECRET as Secret,
      { expiresIn: JWT_REFRESH_EXPIRES_IN } as SignOptions
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        id: refreshTokenId,
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { tokenId: string; userId: string };
      await prisma.refreshToken.deleteMany({
        where: {
          userId: decoded.userId,
          id: decoded.tokenId,
        },
      });
    } catch (error) {
      // Ignore errors on logout
      console.error('Error during logout:', error);
    }
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

export default new AuthService();
