import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { prisma } from '../database';

const router = Router();

// Get user's families
router.get('/my-families', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const families = await prisma.family.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profileImage: true
              }
            }
          }
        },
        mealVotes: {
          where: {
            isActive: true
          },
          include: {
            options: {
              include: {
                recipe: {
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    difficulty: true,
                    prepTime: true,
                    cookTime: true,
                    images: true
                  }
                }
              }
            },
            votes: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true
                  }
                }
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: families
    });
  } catch (error) {
    console.error('Get my families error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create family
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, dietaryRestrictions } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Family name is required'
      });
      return;
    }

    const family = await prisma.family.create({
      data: {
        name,
        adminUserId: userId,
        dietaryRestrictions: JSON.stringify(dietaryRestrictions || [])
      }
    });

    // Add creator as family member
    await prisma.familyMember.create({
      data: {
        familyId: family.id,
        userId,
        role: 'admin'
      }
    });

    // Fetch the complete family with members
    const completeFamily = await prisma.family.findUnique({
      where: { id: family.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profileImage: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: completeFamily,
      message: 'Family created successfully'
    });
  } catch (error) {
    console.error('Create family error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get family details
router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Check if user is member of this family
    const membership = await prisma.familyMember.findFirst({
      where: {
        familyId: id,
        userId
      }
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        message: 'You are not a member of this family'
      });
      return;
    }

    const family = await prisma.family.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profileImage: true
              }
            }
          }
        },
        mealVotes: {
          where: {
            isActive: true
          },
          include: {
            options: true,
            votes: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!family) {
      res.status(404).json({
        success: false,
        message: 'Family not found'
      });
      return;
    }

    res.json({
      success: true,
      data: family
    });
  } catch (error) {
    console.error('Get family error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete family (admin only)
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Check if user is admin of this family
    const family = await prisma.family.findFirst({
      where: {
        id,
        adminUserId: userId
      }
    });

    if (!family) {
      res.status(403).json({
        success: false,
        message: 'Only family admin can delete the family'
      });
      return;
    }

    console.log(`Deleting family with ID: ${id} by user: ${userId}`);
    
    // Delete family (cascade will delete members and votes)
    const deletedFamily = await prisma.family.delete({
      where: { id }
    });

    console.log('Family deleted successfully:', deletedFamily);

    res.json({
      success: true,
      message: 'Family deleted successfully'
    });
  } catch (error) {
    console.error('Delete family error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Send family invitation
router.post('/:id/invitations', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { email, username } = req.body;

    if (!email && !username) {
      res.status(400).json({
        success: false,
        message: 'Email or username is required'
      });
      return;
    }

    // Check if user is admin of this family
    const family = await prisma.family.findFirst({
      where: {
        id,
        adminUserId: userId
      }
    });

    if (!family) {
      res.status(403).json({
        success: false,
        message: 'Only family admin can send invitations'
      });
      return;
    }

    // Find user by email or username
    const userToInvite = await prisma.user.findFirst({
      where: email ? { email } : { username }
    });

    if (!userToInvite) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if user is already a member
    const existingMember = await prisma.familyMember.findFirst({
      where: {
        familyId: id,
        userId: userToInvite.id
      }
    });

    if (existingMember) {
      res.status(400).json({
        success: false,
        message: 'User is already a family member'
      });
      return;
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.familyInvitation.findFirst({
      where: {
        familyId: id,
        OR: [
          { invitedEmail: userToInvite.email },
          { invitedUsername: userToInvite.username }
        ],
        status: 'pending'
      }
    });

    if (existingInvitation) {
      res.status(400).json({
        success: false,
        message: 'Invitation already sent to this user'
      });
      return;
    }

    const invitation = await prisma.familyInvitation.create({
      data: {
        familyId: id,
        inviterUserId: userId,
        invitedEmail: userToInvite.email,
        invitedUsername: userToInvite.username,
        status: 'pending'
      },
      include: {
        family: {
          select: {
            id: true,
            name: true
          }
        },
        inviter: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: invitation,
      message: 'Invitation sent successfully'
    });
  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's pending invitations
router.get('/invitations/pending', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const invitations = await prisma.familyInvitation.findMany({
      where: {
        OR: [
          { invitedEmail: user.email },
          { invitedUsername: user.username }
        ],
        status: 'pending'
      },
      include: {
        family: {
          select: {
            id: true,
            name: true
          }
        },
        inviter: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: invitations
    });
  } catch (error) {
    console.error('Get pending invitations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Accept/Reject family invitation
router.patch('/invitations/:invitationId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { invitationId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    if (!action || !['accept', 'reject'].includes(action)) {
      res.status(400).json({
        success: false,
        message: 'Action must be either "accept" or "reject"'
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Find invitation
    const invitation = await prisma.familyInvitation.findFirst({
      where: {
        id: invitationId,
        OR: [
          { invitedEmail: user.email },
          { invitedUsername: user.username }
        ],
        status: 'pending'
      }
    });

    if (!invitation) {
      res.status(404).json({
        success: false,
        message: 'Invitation not found or already processed'
      });
      return;
    }

    if (action === 'accept') {
      // Check if user is already a member (race condition check)
      const existingMember = await prisma.familyMember.findFirst({
        where: {
          familyId: invitation.familyId,
          userId
        }
      });

      if (existingMember) {
        // Update invitation status but don't create duplicate member
        await prisma.familyInvitation.update({
          where: { id: invitationId },
          data: { status: 'accepted' }
        });

        res.status(400).json({
          success: false,
          message: 'You are already a member of this family'
        });
        return;
      }

      // Create family member and update invitation in transaction
      const result = await prisma.$transaction([
        prisma.familyMember.create({
          data: {
            familyId: invitation.familyId,
            userId,
            role: 'member'
          }
        }),
        prisma.familyInvitation.update({
          where: { id: invitationId },
          data: { status: 'accepted' }
        })
      ]);

      res.json({
        success: true,
        data: {
          member: result[0],
          invitation: result[1]
        },
        message: 'Invitation accepted successfully'
      });
    } else {
      // Reject invitation
      const updatedInvitation = await prisma.familyInvitation.update({
        where: { id: invitationId },
        data: { status: 'rejected' }
      });

      res.json({
        success: true,
        data: updatedInvitation,
        message: 'Invitation rejected'
      });
    }
  } catch (error) {
    console.error('Process invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create meal vote - "Bu akşam ne yesek?" özelliği
router.post('/:id/meal-vote', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { question, recipeIds } = req.body;

    if (!question || !recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Question and recipe options are required'
      });
      return;
    }

    // Check if user is member of this family
    const membership = await prisma.familyMember.findFirst({
      where: {
        familyId: id,
        userId
      }
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        message: 'You are not a member of this family'
      });
      return;
    }

    // Create meal vote
    const mealVote = await prisma.mealVote.create({
      data: {
        familyId: id,
        title: question,
        description: `Meal vote created by user ${userId}`,
        endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 saat sonra expire
        isActive: true
      }
    });

    // Create vote options
    const options = await Promise.all(
      recipeIds.map((recipeId: string) =>
        prisma.mealVoteOption.create({
          data: {
            mealVoteId: mealVote.id,
            recipeId
          },
          include: {
            recipe: {
              select: {
                id: true,
                title: true,
                description: true,
                difficulty: true,
                prepTime: true,
                cookTime: true,
                images: true
              }
            }
          }
        })
      )
    );

    res.status(201).json({
      success: true,
      data: {
        ...mealVote,
        options
      },
      message: 'Meal vote created successfully'
    });
  } catch (error) {
    console.error('Create meal vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Vote on meal
router.post('/:id/meal-votes/:voteId/vote', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id, voteId } = req.params;
    const { optionId } = req.body;

    if (!optionId) {
      res.status(400).json({
        success: false,
        message: 'Vote option is required'
      });
      return;
    }

    // Check if user is member of this family
    const membership = await prisma.familyMember.findFirst({
      where: {
        familyId: id,
        userId
      }
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        message: 'You are not a member of this family'
      });
      return;
    }

    // Check if vote exists and is active
    const mealVote = await prisma.mealVote.findFirst({
      where: {
        id: voteId,
        familyId: id,
        isActive: true,
        endsAt: {
          gt: new Date()
        }
      }
    });

    if (!mealVote) {
      res.status(404).json({
        success: false,
        message: 'Vote not found or expired'
      });
      return;
    }

    // Check if option exists
    const option = await prisma.mealVoteOption.findFirst({
      where: {
        id: optionId,
        mealVoteId: voteId
      }
    });

    if (!option) {
      res.status(404).json({
        success: false,
        message: 'Vote option not found'
      });
      return;
    }

    // Upsert user vote (update if exists, create if not)
    const userVote = await prisma.userMealVote.upsert({
      where: {
        userId_voteId: {
          userId,
          voteId
        }
      },
      update: {
        optionId
      },
      create: {
        userId,
        voteId,
        optionId
      }
    });

    res.json({
      success: true,
      data: userVote,
      message: 'Vote submitted successfully'
    });
  } catch (error) {
    console.error('Submit vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get meal votes
router.get('/:id/meal-votes', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Check if user is member of this family
    const membership = await prisma.familyMember.findFirst({
      where: {
        familyId: id,
        userId
      }
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        message: 'You are not a member of this family'
      });
      return;
    }

    const mealVotes = await prisma.mealVote.findMany({
      where: {
        familyId: id
      },
      include: {
        options: {
          include: {
            recipe: {
              select: {
                id: true,
                title: true,
                description: true,
                difficulty: true,
                prepTime: true,
                cookTime: true,
                images: true
              }
            },
            _count: {
              select: {
                votes: true
              }
            }
          }
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: mealVotes
    });
  } catch (error) {
    console.error('Get meal votes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Leave family
router.delete('/:id/leave', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Check if user is member of this family
    const membership = await prisma.familyMember.findFirst({
      where: {
        familyId: id,
        userId
      }
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        message: 'You are not a member of this family'
      });
      return;
    }

    // Check if user is admin - admin cannot leave, must delete family instead
    const family = await prisma.family.findUnique({
      where: { id }
    });

    if (family?.adminUserId === userId) {
      res.status(400).json({
        success: false,
        message: 'Admin cannot leave family. Delete the family instead.'
      });
      return;
    }

    // Remove member from family
    await prisma.familyMember.delete({
      where: {
        id: membership.id
      }
    });

    res.json({
      success: true,
      message: 'Successfully left the family'
    });
  } catch (error) {
    console.error('Leave family error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router; 