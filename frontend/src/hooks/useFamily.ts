import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { familyService, CreateFamilyDto, CreateMealVoteDto, SubmitVoteDto, FamilyInvitation, InviteMemberDto, ProcessInvitationDto } from '../services/familyService';
import { Family, MealVote, FamilyMember } from '../types';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect } from 'react';

// Query keys
export const familyKeys = {
  all: ['families'] as const,
  lists: () => [...familyKeys.all, 'list'] as const,
  myFamilies: () => [...familyKeys.lists(), 'my-families'] as const,
  details: () => [...familyKeys.all, 'detail'] as const,
  detail: (id: string) => [...familyKeys.details(), id] as const,
  members: (familyId: string) => [...familyKeys.detail(familyId), 'members'] as const,
  votes: () => [...familyKeys.all, 'votes'] as const,
  familyVotes: (familyId: string) => [...familyKeys.votes(), familyId] as const,
  voteDetail: (familyId: string, voteId: string) => [...familyKeys.familyVotes(familyId), voteId] as const,
  userVote: (familyId: string, voteId: string) => [...familyKeys.voteDetail(familyId, voteId), 'user-vote'] as const,
};

// Get user's families
export const useMyFamilies = () => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: familyKeys.myFamilies(),
    queryFn: () => familyService.getMyFamilies(),
    enabled: isAuthenticated,
    staleTime: 0, // Always consider data stale to ensure fresh data after family operations
  });
};

// Get family by ID
export const useFamily = (familyId?: string) => {
  const [family, setFamily] = useState<Family | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [activeMealVotes, setActiveMealVotes] = useState<MealVote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's families
  const fetchMyFamilies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await familyService.getMyFamilies();
      setFamilies(response || []);
      
      // If no families returned, clear current family state
      if (!response || response.length === 0) {
        setFamily(null);
        setActiveMealVotes([]);
      } else if (!familyId) {
        // If no specific familyId provided, use the first family
        setFamily(response[0]);
        setActiveMealVotes(response[0].mealVotes || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch families');
      setFamilies([]);
      setFamily(null);
      setActiveMealVotes([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific family
  const fetchFamily = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await familyService.getFamilyById(id);
      setFamily(response);
      setActiveMealVotes(response.mealVotes || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch family');
    } finally {
      setLoading(false);
    }
  };

  // Fetch active meal votes
  const fetchActiveMealVotes = async (id: string) => {
    try {
      const response = await familyService.getActiveMealVotes(id);
      setActiveMealVotes(response || []);
    } catch (err: any) {
      console.error('Failed to fetch meal votes:', err);
      setActiveMealVotes([]);
    }
  };

  // Create meal vote
  const createMealVote = async (data: {
    title: string;
    description?: string;
    recipeIds: string[];
    endsAt: string;
  }) => {
    if (!family) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await familyService.createMealVote(family.id, data);
      
      // Add new vote to active votes
      const currentVotes = activeMealVotes || [];
      setActiveMealVotes([response, ...currentVotes]);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create meal vote');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Submit vote
  const submitVote = async (voteId: string, optionId: string) => {
    if (!family) return;
    
    try {
      const response = await familyService.submitVote(family.id, voteId, { optionId });
      
      // Update active votes to reflect the new vote
      await fetchActiveMealVotes(family.id);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit vote');
      throw err;
    }
  };

  // Create family
  const createFamily = async (data: { name: string; dietaryRestrictions?: string[] }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await familyService.createFamily(data);
      
      // Add new family to families list
      const currentFamilies = families || [];
      setFamilies([...currentFamilies, response]);
      setFamily(response);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create family');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Send invitation
  const sendInvitation = async (data: InviteMemberDto) => {
    if (!family) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await familyService.sendInvitation(family.id, data);
      
      // No need to refresh family data since invitation is pending
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send invitation');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (familyId) {
      fetchFamily(familyId);
    } else {
      fetchMyFamilies();
    }
  }, [familyId]);

  return {
    family,
    families,
    activeMealVotes,
    loading,
    error,
    fetchMyFamilies,
    fetchFamily,
    fetchActiveMealVotes,
    createMealVote,
    submitVote,
    createFamily,
    sendInvitation,
    setFamily,
    setActiveMealVotes,
  };
};

// Get family members
export const useFamilyMembers = (familyId: string) => {
  return useQuery({
    queryKey: familyKeys.members(familyId),
    queryFn: () => familyService.getFamilyMembers(familyId),
    enabled: !!familyId,
  });
};

// Get active meal votes for family
export const useActiveMealVotes = (familyId: string) => {
  return useQuery({
    queryKey: familyKeys.familyVotes(familyId),
    queryFn: () => familyService.getActiveMealVotes(familyId),
    enabled: !!familyId,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time voting
  });
};

// Get meal vote by ID
export const useMealVote = (familyId: string, voteId: string) => {
  return useQuery({
    queryKey: familyKeys.voteDetail(familyId, voteId),
    queryFn: () => familyService.getMealVoteById(familyId, voteId),
    enabled: !!familyId && !!voteId,
    refetchInterval: 10 * 1000, // Refetch every 10 seconds for real-time results
  });
};

// Get user's vote for a meal vote
export const useUserVote = (familyId: string, voteId: string) => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: familyKeys.userVote(familyId, voteId),
    queryFn: () => familyService.getUserVote(familyId, voteId),
    enabled: isAuthenticated && !!familyId && !!voteId,
  });
};

// Create family mutation
export const useCreateFamily = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateFamilyDto) => familyService.createFamily(data),
    onSuccess: () => {
      // Invalidate my families list
      queryClient.invalidateQueries({ queryKey: familyKeys.myFamilies() });
    },
  });
};

// Update family mutation
export const useUpdateFamily = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFamilyDto> }) =>
      familyService.updateFamily(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific family and my families list
      queryClient.invalidateQueries({ queryKey: familyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: familyKeys.myFamilies() });
    },
  });
};

// Delete family mutation
export const useDeleteFamily = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => familyService.deleteFamily(id),
    onSuccess: (_, id) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: familyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: familyKeys.myFamilies() });
      // Clear pending invitations cache to avoid stale data
      queryClient.invalidateQueries({ queryKey: ['invitations', 'pending'] });
    },
  });
};

// Send invitation mutation
export const useSendInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ familyId, data }: { familyId: string; data: InviteMemberDto }) =>
      familyService.sendInvitation(familyId, data),
    onSuccess: () => {
      // No need to invalidate anything since invitation is just sent
    },
  });
};

// Get pending invitations query
export const usePendingInvitations = () => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['invitations', 'pending'],
    queryFn: () => familyService.getPendingInvitations(),
    enabled: isAuthenticated,
    refetchInterval: 5 * 1000, // Check for new invitations every 5 seconds (temporary - will use WebSocket later)
    staleTime: 0, // Always consider data stale to ensure fresh data after family operations
  });
};

// Process invitation mutation
export const useProcessInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invitationId, data }: { invitationId: string; data: ProcessInvitationDto }) =>
      familyService.processInvitation(invitationId, data),
    onSuccess: () => {
      // Invalidate pending invitations and my families
      queryClient.invalidateQueries({ queryKey: ['invitations', 'pending'] });
      queryClient.invalidateQueries({ queryKey: familyKeys.myFamilies() });
    },
  });
};

// Remove member mutation
export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ familyId, memberId }: { familyId: string; memberId: string }) =>
      familyService.removeMember(familyId, memberId),
    onSuccess: (_, { familyId }) => {
      // Invalidate family members and family details
      queryClient.invalidateQueries({ queryKey: familyKeys.members(familyId) });
      queryClient.invalidateQueries({ queryKey: familyKeys.detail(familyId) });
    },
  });
};

// Leave family mutation
export const useLeaveFamily = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (familyId: string) => familyService.leaveFamily(familyId),
    onSuccess: (_, familyId) => {
      // Remove from cache and invalidate my families
      queryClient.removeQueries({ queryKey: familyKeys.detail(familyId) });
      queryClient.invalidateQueries({ queryKey: familyKeys.myFamilies() });
    },
  });
};

// Create meal vote mutation - "Bu akşam ne yesek?" feature
export const useCreateMealVote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ familyId, data }: { familyId: string; data: CreateMealVoteDto }) =>
      familyService.createMealVote(familyId, data),
    onSuccess: (_, { familyId }) => {
      // Invalidate active votes for this family
      queryClient.invalidateQueries({ queryKey: familyKeys.familyVotes(familyId) });
    },
  });
};

// Submit vote mutation
export const useSubmitVote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ familyId, voteId, optionId }: { familyId: string; voteId: string; optionId: string }) =>
      familyService.submitVote(familyId, voteId, { optionId }),
    onSuccess: (_, { familyId, voteId }) => {
      // Invalidate vote details and user vote
      queryClient.invalidateQueries({ queryKey: familyKeys.voteDetail(familyId, voteId) });
      queryClient.invalidateQueries({ queryKey: familyKeys.userVote(familyId, voteId) });
      queryClient.invalidateQueries({ queryKey: familyKeys.familyVotes(familyId) });
    },
  });
};

// End meal vote mutation
export const useEndMealVote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ familyId, voteId }: { familyId: string; voteId: string }) =>
      familyService.endMealVote(familyId, voteId),
    onSuccess: (_, { familyId, voteId }) => {
      // Invalidate vote details and active votes
      queryClient.invalidateQueries({ queryKey: familyKeys.voteDetail(familyId, voteId) });
      queryClient.invalidateQueries({ queryKey: familyKeys.familyVotes(familyId) });
    },
  });
}; 