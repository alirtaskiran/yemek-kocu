import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../database';
import { config } from '../config';
import { CreateUserDto, LoginDto, JwtPayload } from '../types';

export class AuthService {
  async register(userData: CreateUserDto) {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { username: userData.username }
        ]
      }
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        profileImage: userData.profileImage,
        bio: userData.bio,
        preferences: userData.preferences ? JSON.stringify(userData.preferences) : '{}',
      },
      select: {
        id: true,
        email: true,
        username: true,
        profileImage: true,
        bio: true,
        totalPoints: true,
        dailyCalories: true,
        createdAt: true,
      }
    });

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      user,
      token,
    };
  }

  async login(loginData: LoginDto) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: loginData.email }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  private generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
} 