import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { CreateUserDto, LoginDto } from '../types';
import { authenticateToken } from '../middleware/auth.middleware';
import { uploadProfileImage } from '../middleware/upload.middleware';
import { prisma } from '../database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

const router = Router();
const authService = new AuthService();

// Async handler wrapper to handle promise rejections
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Register endpoint
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Email, username, and password are required',
          code: 'MISSING_FIELDS'
        }
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          message: 'User with this email or username already exists',
          code: 'USER_EXISTS'
        }
      });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        profileImage: true,
        bio: true,
        totalPoints: true,
        dailyCalories: true,
        dailyCalorieGoal: true,
        age: true,
        gender: true,
        height: true,
        weight: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        username: user.username 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      }
    });
  }
}));

// Login endpoint
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required',
          code: 'MISSING_FIELDS'
        }
      });
      return;
    }

    // Find user by email with all necessary fields
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        profileImage: true,
        bio: true,
        totalPoints: true,
        dailyCalories: true,
        dailyCalorieGoal: true,
        age: true,
        gender: true,
        height: true,
        weight: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'LOGIN_ERROR'
        }
      });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'LOGIN_ERROR'
        }
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        username: user.username 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'SERVER_ERROR'
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

// Update calorie goal
router.put('/calorie-goal', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { calorieGoal } = req.body;

    if (!calorieGoal || calorieGoal < 800 || calorieGoal > 5000) {
      res.status(400).json({
        success: false,
        message: 'Calorie goal must be between 800 and 5000'
      });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        dailyCalorieGoal: calorieGoal
      },
      select: {
        dailyCalorieGoal: true
      }
    });

    res.json({
      success: true,
      data: {
        dailyCalorieGoal: user.dailyCalorieGoal
      },
      message: 'Calorie goal updated successfully'
    });
  } catch (error) {
    console.error('Update calorie goal error:', error);
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

// Update user profile
router.put('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { username, bio, age, gender, height, weight } = req.body;

    // Check if username is taken by another user
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          id: { not: userId }
        }
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'Username is already taken'
        });
        return;
      }
    }

    // Validate data
    if (age && (age < 13 || age > 120)) {
      res.status(400).json({
        success: false,
        message: 'Age must be between 13 and 120'
      });
      return;
    }

    if (height && (height < 100 || height > 250)) {
      res.status(400).json({
        success: false,
        message: 'Height must be between 100 and 250 cm'
      });
      return;
    }

    if (weight && (weight < 30 || weight > 300)) {
      res.status(400).json({
        success: false,
        message: 'Weight must be between 30 and 300 kg'
      });
      return;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
        ...(age && { age }),
        ...(gender && { gender }),
        ...(height && { height }),
        ...(weight && { weight })
      },
      select: {
        id: true,
        email: true,
        username: true,
        profileImage: true,
        bio: true,
        totalPoints: true,
        dailyCalories: true,
        dailyCalorieGoal: true,
        age: true,
        gender: true,
        height: true,
        weight: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;

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
        dailyCalorieGoal: true,
        age: true,
        gender: true,
        height: true,
        weight: true,
        createdAt: true,
        _count: {
          select: {
            recipes: true,
            comments: true,
          },
        },
      },
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
      data: user,
      message: 'User profile retrieved successfully'
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Upload profile image
router.post('/upload-profile-image', authenticateToken, (req: Request, res: Response) => {
  uploadProfileImage(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      res.status(400).json({
        success: false,
        message: err.message || 'File upload failed'
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
      return;
    }

    try {
      const userId = (req as any).user.userId;
      const filename = req.file.filename;
      const imageUrl = `/uploads/profiles/${filename}`;

      // Get current user to delete old profile image
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { profileImage: true }
      });

      // Delete old profile image if exists
      if (currentUser?.profileImage) {
        const oldImagePath = path.join(process.cwd(), 'uploads', 'profiles', path.basename(currentUser.profileImage));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Update user profile image
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { profileImage: imageUrl },
        select: {
          id: true,
          email: true,
          username: true,
          profileImage: true,
          bio: true,
          totalPoints: true,
          dailyCalories: true,
          dailyCalorieGoal: true,
          age: true,
          gender: true,
          height: true,
          weight: true,
          createdAt: true
        }
      });

      res.json({
        success: true,
        data: {
          user: updatedUser,
          imageUrl
        },
        message: 'Profile image uploaded successfully'
      });
    } catch (error) {
      console.error('Database update error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });
});

export default router; 