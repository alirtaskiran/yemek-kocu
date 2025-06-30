import { prisma } from '../database';
import { CreateRecipeDto, PaginatedResponse } from '../types';

export class RecipeService {
  async createRecipe(userId: string, recipeData: CreateRecipeDto) {
    const recipe = await prisma.recipe.create({
      data: {
        userId,
        title: recipeData.title,
        description: recipeData.description,
        difficulty: recipeData.difficulty,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        servings: recipeData.servings,
        cuisineType: recipeData.cuisineType,
        categories: JSON.stringify(recipeData.categories),
        caloriesPerServing: recipeData.caloriesPerServing,
        nutritionInfo: recipeData.nutritionInfo ? JSON.stringify(recipeData.nutritionInfo) : null,
        ingredients: JSON.stringify(recipeData.ingredients),
        instructions: JSON.stringify(recipeData.instructions),
        images: JSON.stringify(recipeData.images || []),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          }
        },
        _count: {
          select: {
            comments: true,
            userProgresses: true,
          }
        }
      }
    });

    return this.formatRecipe(recipe);
  }

  async getRecipes(page = 1, limit = 10, filters?: {
    difficulty?: string;
    cuisineType?: string;
    categories?: string[];
    search?: string;
  }) {
    const skip = (page - 1) * limit;
    
    const where: any = {
      isApproved: true, // Sadece onaylanmış tarifleri göster
    };

    // Filters
    if (filters?.difficulty) {
      where.difficulty = filters.difficulty;
    }
    
    if (filters?.cuisineType) {
      where.cuisineType = filters.cuisineType;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Categories filter için JSON içinde arama gerekiyor (SQLite için basit string contains)
    if (filters?.categories && filters.categories.length > 0) {
      where.categories = {
        contains: filters.categories[0] // Basit implementation
      };
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profileImage: true,
            }
          },
          _count: {
            select: {
              comments: true,
              userProgresses: true,
            }
          }
        }
      }),
      prisma.recipe.count({ where })
    ]);

    const formattedRecipes = recipes.map(recipe => this.formatRecipe(recipe));

    return {
      data: formattedRecipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    } as PaginatedResponse<any>;
  }

  async getRecipeById(id: string, userId?: string) {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            bio: true,
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profileImage: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // Son 10 yorum
        },
        _count: {
          select: {
            comments: true,
            userProgresses: true,
          }
        }
      }
    });

    if (!recipe) {
      throw new Error('Recipe not found');
    }

    return this.formatRecipe(recipe);
  }

  async getUserRecipes(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              comments: true,
              userProgresses: true,
            }
          }
        }
      }),
      prisma.recipe.count({ where: { userId } })
    ]);

    const formattedRecipes = recipes.map(recipe => this.formatRecipe(recipe));

    return {
      data: formattedRecipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    } as PaginatedResponse<any>;
  }

  async updateRecipe(id: string, userId: string, updateData: Partial<CreateRecipeDto>) {
    // Check if user owns the recipe
    const existingRecipe = await prisma.recipe.findFirst({
      where: { id, userId }
    });

    if (!existingRecipe) {
      throw new Error('Recipe not found or you do not have permission to edit it');
    }

    const updateFields: any = {};

    if (updateData.title) updateFields.title = updateData.title;
    if (updateData.description) updateFields.description = updateData.description;
    if (updateData.difficulty) updateFields.difficulty = updateData.difficulty;
    if (updateData.prepTime) updateFields.prepTime = updateData.prepTime;
    if (updateData.cookTime) updateFields.cookTime = updateData.cookTime;
    if (updateData.servings) updateFields.servings = updateData.servings;
    if (updateData.cuisineType) updateFields.cuisineType = updateData.cuisineType;
    if (updateData.categories) updateFields.categories = JSON.stringify(updateData.categories);
    if (updateData.caloriesPerServing) updateFields.caloriesPerServing = updateData.caloriesPerServing;
    if (updateData.nutritionInfo) updateFields.nutritionInfo = JSON.stringify(updateData.nutritionInfo);
    if (updateData.ingredients) updateFields.ingredients = JSON.stringify(updateData.ingredients);
    if (updateData.instructions) updateFields.instructions = JSON.stringify(updateData.instructions);
    if (updateData.images) updateFields.images = JSON.stringify(updateData.images);

    const recipe = await prisma.recipe.update({
      where: { id },
      data: updateFields,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          }
        },
        _count: {
          select: {
            comments: true,
            userProgresses: true,
          }
        }
      }
    });

    return this.formatRecipe(recipe);
  }

  async deleteRecipe(id: string, userId: string) {
    // Check if user owns the recipe
    const existingRecipe = await prisma.recipe.findFirst({
      where: { id, userId }
    });

    if (!existingRecipe) {
      throw new Error('Recipe not found or you do not have permission to delete it');
    }

    await prisma.recipe.delete({
      where: { id }
    });

    return { message: 'Recipe deleted successfully' };
  }

  // Format recipe for response (parse JSON fields)
  private formatRecipe(recipe: any) {
    return {
      ...recipe,
      categories: JSON.parse(recipe.categories || '[]'),
      nutritionInfo: recipe.nutritionInfo ? JSON.parse(recipe.nutritionInfo) : null,
      ingredients: JSON.parse(recipe.ingredients || '[]'),
      instructions: JSON.parse(recipe.instructions || '[]'),
      images: JSON.parse(recipe.images || '[]'),
    };
  }

  // "Bugün ne yemek yapsam?" için rastgele tarif önerisi
  async getRandomRecipes(count = 5, filters?: {
    difficulty?: string;
    cuisineType?: string;
    maxPrepTime?: number;
  }) {
    const where: any = {
      isApproved: true,
    };

    if (filters?.difficulty) {
      where.difficulty = filters.difficulty;
    }
    
    if (filters?.cuisineType) {
      where.cuisineType = filters.cuisineType;
    }

    if (filters?.maxPrepTime) {
      where.prepTime = {
        lte: filters.maxPrepTime
      };
    }

    // SQLite'da RANDOM() kullanarak rastgele seçim
    const recipes = await prisma.$queryRaw`
      SELECT * FROM recipes 
      WHERE isApproved = 1 
      ORDER BY RANDOM() 
      LIMIT ${count}
    ` as any[];

    // Her tarif için detayları al
    const detailedRecipes = await Promise.all(
      recipes.map(recipe => this.getRecipeById(recipe.id))
    );

    return detailedRecipes;
  }
} 