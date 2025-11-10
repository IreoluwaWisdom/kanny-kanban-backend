import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ message: 'Email, password, and name are required' });
      }

      const result = await authService.signup(email, password, name);

      // Set refresh token in HTTP-only cookie (cross-site compatible in production)
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Signup failed',
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const result = await authService.login(email, password);

      // Set refresh token in HTTP-only cookie (cross-site compatible in production)
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      res.status(401).json({
        message: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
      }

      const tokens = await authService.refreshToken(refreshToken);

      // Set new refresh token in HTTP-only cookie (cross-site compatible in production)
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        accessToken: tokens.accessToken,
      });
    } catch (error) {
      res.status(401).json({
        message: error instanceof Error ? error.message : 'Token refresh failed',
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      // Clear cookie using same attributes to ensure removal in browsers
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
      });
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Logout failed',
      });
    }
  }

  async me(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const user = await authService.getUserById(userId);
      res.json(user);
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : 'User not found',
      });
    }
  }
}

export default new AuthController();
