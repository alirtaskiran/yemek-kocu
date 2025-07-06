import { Router, Request, Response, NextFunction } from 'express';
import { RecipeService } from '../services/recipe.service';
import { CreateRecipeDto } from '../types';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';
import { uploadRecipeImages } from '../middleware/upload.middleware';
import { prisma } from '../database';

const router = Router();
const recipeService = new RecipeService();

// Async handler wrapper
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all recipes (public, with optional auth for personalization)
router.get('/', optionalAuth, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { difficulty, cuisineType, categories, search } = req.query;
    
    const filters = {
      difficulty: difficulty as string,
      cuisineType: cuisineType as string,
      categories: categories ? (categories as string).split(',') : undefined,
      search: search as string
    };

    const result = await recipeService.getRecipes(page, limit, filters);
    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Get recipes error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to retrieve recipes',
        code: 'GET_RECIPES_ERROR'
      }
    });
  }
}));

// Get trending recipes
router.get('/trending', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const recipes = await recipeService.getTrendingRecipes(page, limit);
    res.json({
      success: true,
      data: recipes,
      message: 'Trending recipes retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get trending recipes error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to retrieve trending recipes',
        code: 'GET_TRENDING_RECIPES_ERROR'
      }
    });
  }
}));

// Get random recipes - "Bugün ne yemek yapsam?" özelliği
router.get('/random', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const count = parseInt(req.query.count as string) || 5;
    const { difficulty, cuisineType, maxPrepTime } = req.query;
    
    const filters = {
      difficulty: difficulty as string,
      cuisineType: cuisineType as string,
      maxPrepTime: maxPrepTime ? parseInt(maxPrepTime as string) : undefined
    };

    const recipes = await recipeService.getRandomRecipes(count, filters);

    res.json({
      success: true,
      data: recipes,
      message: 'Random recipes retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get random recipes error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to retrieve random recipes',
        code: 'GET_RANDOM_RECIPES_ERROR'
      }
    });
  }
}));

// Get recipe by ID (public)
router.get('/:id', optionalAuth, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.headers.authorization ? 
      (req as any).user?.id : undefined; // Optional user for like status

    const recipe = await recipeService.getRecipeById(id, userId);
    
    if (!recipe) {
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
      return;
    }

    res.json({
      success: true,
      data: recipe,
      message: 'Recipe retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get recipe error:', error);
    if (error.message === 'Recipe not found') {
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to retrieve recipe',
          code: 'GET_RECIPE_ERROR'
        }
      });
    }
  }
}));

// Create new recipe (authenticated)
  router.post('/', authenticateToken, uploadRecipeImages, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const recipeData: CreateRecipeDto = req.body;

    const recipe = await recipeService.createRecipe(userId, recipeData);
    
    res.status(201).json({
      success: true,
      data: recipe,
      message: 'Recipe created successfully'
    });
  } catch (error: any) {
    console.error('Create recipe error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to create recipe',
        code: 'CREATE_RECIPE_ERROR'
      }
    });
  }
});

// Get user's own recipes (authenticated)
router.get('/user/me', authenticateToken, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await recipeService.getUserRecipes(userId, page, limit);
    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Get user recipes error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to retrieve user recipes',
        code: 'GET_USER_RECIPES_ERROR'
      }
    });
  }
});

// Update recipe (authenticated, owner only)
  router.put('/:id', authenticateToken, uploadRecipeImages, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    const updatedRecipe = await recipeService.updateRecipe(id, userId, req.body);
    res.json({
      success: true,
      data: updatedRecipe,
      message: 'Recipe updated successfully'
    });
  } catch (error: any) {
    console.error('Update recipe error:', error);
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to update recipe',
          code: 'UPDATE_RECIPE_ERROR'
        }
      });
    }
  }
});

// Delete recipe (authenticated, owner only)
router.delete('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    await recipeService.deleteRecipe(id, userId);
    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete recipe error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to delete recipe',
          code: 'DELETE_RECIPE_ERROR'
        }
      });
  }
});

// Start cooking recipe (track progress)
router.post('/:id/start-cooking', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Check if recipe exists
    const recipe = await recipeService.getRecipeById(id);
    if (!recipe) {
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
      return;
    }

    // Create or update user progress
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_recipeId: {
          userId,
          recipeId: id
        }
      },
      update: {
        completionStatus: 'in_progress',
        startedAt: new Date()
      },
      create: {
        userId,
        recipeId: id,
        completionStatus: 'in_progress'
      }
    });

    // TODO: Implement push notifications when needed

    res.json({
      success: true,
      data: progress,
      message: 'Cooking started successfully'
    });
  } catch (error) {
    console.error('Start cooking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Complete cooking and mark if ate the meal
router.post('/:id/complete-cooking', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { didEat, caloriesConsumed } = req.body;

    // Update user progress
    const progress = await prisma.userProgress.update({
      where: {
        userId_recipeId: {
          userId,
          recipeId: id
        }
      },
      data: {
        completionStatus: 'completed',
        didEat: didEat || false,
        completedAt: new Date()
      }
    });

    // If user ate the meal and calories provided, add to daily calories
    if (didEat && caloriesConsumed && caloriesConsumed > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          dailyCalories: {
            increment: caloriesConsumed
          }
        }
      });
    }

    res.json({
      success: true,
      data: progress,
      message: 'Cooking completed successfully'
    });
  } catch (error) {
    console.error('Complete cooking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mark that user ate the meal (separate from cooking completion)
router.post('/:id/ate-meal', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { caloriesConsumed } = req.body;

    // Update user progress
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_recipeId: {
          userId,
          recipeId: id
        }
      },
      update: {
        didEat: true
      },
      create: {
        userId,
        recipeId: id,
        completionStatus: 'completed',
        didEat: true
      }
    });

    // Add calories to daily total
    if (caloriesConsumed && caloriesConsumed > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          dailyCalories: {
            increment: caloriesConsumed
          }
        }
      });
    }

    res.json({
      success: true,
      data: progress,
      message: 'Meal consumption recorded successfully'
    });
  } catch (error) {
    console.error('Ate meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Toggle like on recipe (authenticated)
router.post('/:id/like', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id }
    });

    if (!recipe) {
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
      return;
    }

    // Check if user already liked this recipe
    const existingLike = await prisma.recipeLike.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId: id
        }
      }
    });

    let isLiked = false;
    let likesCount = 0;

    if (existingLike) {
      // Unlike - remove like
      await prisma.recipeLike.delete({
        where: {
          userId_recipeId: {
            userId,
            recipeId: id
          }
        }
      });
      isLiked = false;
    } else {
      // Like - add like
      await prisma.recipeLike.create({
        data: {
          userId,
          recipeId: id
        }
      });
      isLiked = true;
    }

    // Get updated likes count
    likesCount = await prisma.recipeLike.count({
      where: { recipeId: id }
    });

    // Update recipe's likesCount
    await prisma.recipe.update({
      where: { id },
      data: { likesCount }
    });

    // Update trending score
    await recipeService.updateTrendingScore(id);

    res.json({
      success: true,
      data: {
        isLiked,
        likesCount
      },
      message: isLiked ? 'Recipe liked successfully' : 'Recipe unliked successfully'
    });
  } catch (error: any) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to toggle like',
        code: 'TOGGLE_LIKE_ERROR'
      }
    });
  }
}));

// Get recipe likes (public)
router.get('/:id/likes', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const likes = await prisma.recipeLike.findMany({
      where: { recipeId: id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.recipeLike.count({
      where: { recipeId: id }
    });

    res.json({
      success: true,
      data: likes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      message: 'Recipe likes retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get recipe likes error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to retrieve recipe likes',
        code: 'GET_RECIPE_LIKES_ERROR'
      }
    });
  }
}));

// Add comment to recipe (authenticated)
router.post('/:id/comments', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
      return;
    }

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id }
    });

    if (!recipe) {
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
      return;
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId,
        recipeId: id
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    // Update recipe's commentsCount
    const commentsCount = await prisma.comment.count({
      where: { recipeId: id }
    });

    await prisma.recipe.update({
      where: { id },
      data: { commentsCount }
    });

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully'
    });
  } catch (error: any) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to add comment',
        code: 'ADD_COMMENT_ERROR'
      }
    });
  }
}));

// Get recipe comments (public)
router.get('/:id/comments', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const comments = await prisma.comment.findMany({
      where: { recipeId: id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.comment.count({
      where: { recipeId: id }
    });

    res.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      message: 'Recipe comments retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get recipe comments error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to retrieve recipe comments',
        code: 'GET_RECIPE_COMMENTS_ERROR'
      }
    });
  }
}));

// View recipe (requires auth)
router.post('/:id/view', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const result = await recipeService.viewRecipe(userId, id);
    res.json(result);
  } catch (error) {
    console.error('View recipe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's recipes (requires auth)
router.get('/user/my-recipes', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await recipeService.getUserRecipes(userId, page, limit);
    res.json(result);
  } catch (error) {
    console.error('Get user recipes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 