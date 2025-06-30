import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { CreateUserDto, LoginDto } from '../types';
import { authenticateToken } from '../middleware/auth.middleware';
import { prisma } from '../database';

const router = Router();
const authService = new AuthService();

// Async handler wrapper to handle promise rejections
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Register endpoint
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  try {
    const userData: CreateUserDto = req.body;

    // Basic validation
    if (!userData.email || !userData.username || !userData.password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email, username, and password are required',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid email format',
          code: 'INVALID_EMAIL'
        }
      });
    }

    // Password validation
    if (userData.password.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password must be at least 8 characters long',
          code: 'WEAK_PASSWORD'
        }
      });
    }

    const result = await authService.register(userData);

    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully'
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: {
        message: error.message || 'Registration failed',
        code: 'REGISTRATION_ERROR'
      }
    });
  }
}));

// Login endpoint
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  try {
    const loginData: LoginDto = req.body;

    // Basic validation
    if (!loginData.email || !loginData.password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required',
          code: 'MISSING_FIELDS'
        }
      });
    }

    const result = await authService.login(loginData);

    res.json({
      success: true,
      data: result,
      message: 'Login successful'
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: {
        message: error.message || 'Login failed',
        code: 'LOGIN_ERROR'
      }
    });
  }
}));

// Token refresh endpoint (optional - for future use)
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    error: {
      message: 'Token refresh not implemented yet',
      code: 'NOT_IMPLEMENTED'
    }
  });
}));

// Get user profile
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        profileImage: true,
        bio: true,
        totalPoints: true,
        dailyCalories: true,
        createdAt: true,
        _count: {
          select: {
            recipes: true,
            comments: true
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get daily calories
router.get('/daily-calories', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        dailyCalories: true
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        dailyCalories: user.dailyCalories
      }
    });
  } catch (error) {
    console.error('Get daily calories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add calories
router.post('/add-calories', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { calories } = req.body;

    if (!calories || calories <= 0) {
      res.status(400).json({
        success: false,
        message: 'Valid calories amount is required'
      });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        dailyCalories: {
          increment: calories
        }
      },
      select: {
        dailyCalories: true
      }
    });

    res.json({
      success: true,
      data: {
        dailyCalories: user.dailyCalories,
        addedCalories: calories
      },
      message: 'Calories added successfully'
    });
  } catch (error) {
    console.error('Add calories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reset daily calories
router.post('/reset-calories', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyCalories: 0
      }
    });

    res.json({
      success: true,
      message: 'Daily calories reset successfully'
    });
  } catch (error) {
    console.error('Reset calories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router; 