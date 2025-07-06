import { prisma } from '../database';
import { CreateRecipeDto, PaginatedResponse } from '../types';

export class RecipeService {
  async createRecipe(userId: string, recipeData: CreateRecipeDto) {
    // Kullanıcının admin olup olmadığını kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });
    
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
        isApproved: true, // Geçici olarak tüm tarifleri onayla (admin sistemi düzeltilecek)
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
      // isApproved: true, // Geçici olarak tüm tarifleri göster
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
      where.prepTime = { lte: filters.maxPrepTime };
    }

    const totalRecipes = await prisma.recipe.count({ where });
    
    if (totalRecipes === 0) {
      return [];
    }

    const randomSkip = Math.floor(Math.random() * Math.max(0, totalRecipes - count));

    const recipes = await prisma.recipe.findMany({
      where,
      skip: randomSkip,
      take: count,
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

    return recipes.map(recipe => this.formatRecipe(recipe));
  }

  // Beğeni sistemi
  async likeRecipe(userId: string, recipeId: string) {
    try {
      // Beğeniyi ekle
      await prisma.recipeLike.create({
        data: {
          userId,
          recipeId,
        }
      });

      // Recipe'in beğeni sayısını güncelle
      const recipe = await prisma.recipe.update({
        where: { id: recipeId },
        data: {
          likesCount: {
            increment: 1
          }
        }
      });

      // Trend skorunu güncelle
      await this.updateTrendingScore(recipeId);

      return { success: true, likesCount: recipe.likesCount };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Recipe already liked');
      }
      throw error;
    }
  }

  async unlikeRecipe(userId: string, recipeId: string) {
    const like = await prisma.recipeLike.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId
        }
      }
    });

    if (!like) {
      throw new Error('Recipe not liked');
    }

    await prisma.recipeLike.delete({
      where: {
        userId_recipeId: {
          userId,
          recipeId
        }
      }
    });

    const recipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        likesCount: {
          decrement: 1
        }
      }
    });

    await this.updateTrendingScore(recipeId);

    return { success: true, likesCount: recipe.likesCount };
  }

  async isRecipeLiked(userId: string, recipeId: string) {
    const like = await prisma.recipeLike.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId
        }
      }
    });

    return !!like;
  }

  // Görüntüleme sistemi
  async viewRecipe(userId: string, recipeId: string) {
    try {
      // Görüntülemeyi ekle (eğer daha önce görüntülenmemişse)
      await prisma.recipeView.create({
        data: {
          userId,
          recipeId,
        }
      });

      // Recipe'in görüntülenme sayısını güncelle
      await prisma.recipe.update({
        where: { id: recipeId },
        data: {
          viewsCount: {
            increment: 1
          }
        }
      });

      // Trend skorunu güncelle
      await this.updateTrendingScore(recipeId);

      return { success: true };
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Zaten görüntülenmiş, sessizce geç
        return { success: true };
      }
      throw error;
    }
  }

  // Trend tarifleri - sadece etkileşim almış tarifler
  async getTrendingRecipes(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const recipes = await prisma.recipe.findMany({
      where: {
        isApproved: true,
        trendingScore: { gt: 0 }  // Sadece trending score'u 0'dan büyük olanlar
      },
      skip,
      take: limit,
      orderBy: [
        { trendingScore: 'desc' },
        { createdAt: 'desc' }
      ],
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

    return recipes.map(recipe => this.formatRecipe(recipe));
  }

  // Trend skoru hesaplama
  async updateTrendingScore(recipeId: string) {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: {
        likesCount: true,
        commentsCount: true,
        viewsCount: true,
        createdAt: true,
      }
    });

    if (!recipe) {
      return;
    }

    // Trend skoru hesaplama algoritması
    const now = new Date();
    const ageInDays = (now.getTime() - recipe.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    // Yaş faktörü (yeni tarifler daha yüksek skor alır)
    const ageFactor = Math.max(0.1, 1 - (ageInDays / 180)); // 180 gün sonra minimum skor (6 ay)
    
    // Etkileşim skoru
    const interactionScore = (recipe.likesCount * 3) + (recipe.commentsCount * 5) + (recipe.viewsCount * 0.1);
    
    // Final trend skoru
    const trendingScore = interactionScore * ageFactor;

    // Trend skorunu güncelle
    await prisma.recipe.update({
      where: { id: recipeId },
      data: { trendingScore }
    });
  }
} 