import { apiService } from './api';
import { Family, FamilyMember, MealVote, MealVoteOption, UserMealVote } from '../types';

export interface CreateFamilyDto {
  name: string;
  dietaryRestrictions?: string[];
}

export interface InviteMemberDto {
  email?: string;
  username?: string;
}

export interface FamilyInvitation {
  id: string;
  familyId: string;
  inviterUserId: string;
  invitedEmail: string | null;
  invitedUsername: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  family: {
    id: string;
    name: string;
  };
  inviter: {
    id: string;
    username: string;
  };
}

export interface ProcessInvitationDto {
  action: 'accept' | 'reject';
}

export interface CreateMealVoteDto {
  title: string;
  description?: string;
  recipeIds: string[];
  endsAt: string; // ISO string
}

export interface SubmitVoteDto {
  optionId: string;
}

class FamilyService {
  // Create new family
  async createFamily(data: CreateFamilyDto): Promise<Family> {
    return apiService.post<Family>('/families', data);
  }

  // Get family by ID
  async getFamilyById(id: string): Promise<Family> {
    return apiService.get<Family>(`/families/${id}`);
  }

  // Get user's families
  async getMyFamilies(): Promise<Family[]> {
    return apiService.get<Family[]>('/families/my-families');
  }

  // Update family
  async updateFamily(id: string, data: Partial<CreateFamilyDto>): Promise<Family> {
    return apiService.put<Family>(`/families/${id}`, data);
  }

  // Delete family (admin only)
  async deleteFamily(id: string): Promise<void> {
    return apiService.delete<void>(`/families/${id}`);
  }

  // Send family invitation
  async sendInvitation(familyId: string, data: InviteMemberDto): Promise<FamilyInvitation> {
    return apiService.post<FamilyInvitation>(`/families/${familyId}/invitations`, data);
  }

  // Get user's pending invitations
  async getPendingInvitations(): Promise<FamilyInvitation[]> {
    return apiService.get<FamilyInvitation[]>('/families/invitations/pending');
  }

  // Accept or reject invitation
  async processInvitation(invitationId: string, data: ProcessInvitationDto): Promise<any> {
    return apiService.patch(`/families/invitations/${invitationId}`, data);
  }

  // Remove member from family
  async removeMember(familyId: string, memberId: string): Promise<void> {
    return apiService.delete<void>(`/families/${familyId}/members/${memberId}`);
  }

  // Leave family
  async leaveFamily(familyId: string): Promise<void> {
    return apiService.delete<void>(`/families/${familyId}/leave`);
  }

  // Get family members
  async getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
    return apiService.get<FamilyMember[]>(`/families/${familyId}/members`);
  }

  // Create meal vote - "Bu akşam ne yesek?" feature
  async createMealVote(familyId: string, data: CreateMealVoteDto): Promise<MealVote> {
    return apiService.post<MealVote>(`/families/${familyId}/meal-vote`, data);
  }

  // Get active meal votes for family
  async getActiveMealVotes(familyId: string): Promise<MealVote[]> {
    return apiService.get<MealVote[]>(`/families/${familyId}/meal-votes`);
  }

  // Get meal vote by ID
  async getMealVoteById(familyId: string, voteId: string): Promise<MealVote> {
    return apiService.get<MealVote>(`/families/${familyId}/meal-votes/${voteId}`);
  }

  // Submit vote for meal option
  async submitVote(familyId: string, voteId: string, data: SubmitVoteDto): Promise<UserMealVote> {
    return apiService.post<UserMealVote>(`/families/${familyId}/meal-votes/${voteId}/vote`, data);
  }

  // Get vote results
  async getVoteResults(familyId: string, voteId: string): Promise<MealVoteOption[]> {
    return apiService.get<MealVoteOption[]>(`/families/${familyId}/meal-votes/${voteId}/results`);
  }

  // End meal vote (admin only)
  async endMealVote(familyId: string, voteId: string): Promise<MealVote> {
    return apiService.put<MealVote>(`/families/${familyId}/meal-votes/${voteId}/end`);
  }

  // Get family meal vote history
  async getMealVoteHistory(familyId: string): Promise<MealVote[]> {
    return apiService.get<MealVote[]>(`/families/${familyId}/meal-votes/history`);
  }

  // Get user's vote for a specific meal vote
  async getUserVote(familyId: string, voteId: string): Promise<UserMealVote | null> {
    try {
      return await apiService.get<UserMealVote>(`/families/${familyId}/meal-votes/${voteId}/my-vote`);
    } catch (error) {
      // If no vote found, return null
      return null;
    }
  }
}

export const familyService = new FamilyService();
export default familyService; 