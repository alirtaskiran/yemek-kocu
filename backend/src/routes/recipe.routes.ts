import { Router, Request, Response, NextFunction } from 'express';
import { RecipeService } from '../services/recipe.service';
import { CreateRecipeDto } from '../types';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';
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
    const recipe = await recipeService.getRecipeById(id);
    
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
router.post('/', authenticateToken, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const recipe = await recipeService.createRecipe(userId, req.body);
    
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
router.put('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to delete recipe',
          code: 'DELETE_RECIPE_ERROR'
        }
      });
    }
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

export default router; 