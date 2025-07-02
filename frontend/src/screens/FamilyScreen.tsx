import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList, RefreshControl } from 'react-native';
import { Colors } from '../constants/Colors';
import { Spacing, FontSize, BorderRadius } from '../constants/Spacing';
import { useAuthStore } from '../store/authStore';
import { useFamily, usePendingInvitations, useProcessInvitation } from '../hooks/useFamily';
import { familyService } from '../services/familyService';

const FamilyScreen = () => {
  const { user } = useAuthStore();
  const { 
    family, 
    families, 
    activeMealVotes, 
    loading, 
    error, 
    fetchMyFamilies,
    createFamily,
    sendInvitation,
    submitVote,
    createMealVote,
    setFamily,
    setActiveMealVotes
  } = useFamily();
  
  const { data: pendingInvitations } = usePendingInvitations();
  const processInvitation = useProcessInvitation();
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyFamilies();
    setRefreshing(false);
  };

  const handleCreateFamily = async () => {
    Alert.prompt(
      'Yeni Aile Oluştur',
      'Aile adınızı girin:',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Oluştur', 
          onPress: async (familyName) => {
            if (familyName?.trim()) {
              try {
                await createFamily({ name: familyName.trim() });
                Alert.alert('Başarılı!', 'Aile başarıyla oluşturuldu.');
              } catch (error) {
                Alert.alert('Hata', 'Aile oluşturulamadı.');
              }
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleJoinFamily = () => {
    Alert.alert(
      'Aileye Katıl',
      'Bu özellik yakında eklenecek.',
      [{ text: 'Tamam' }]
    );
  };

  const handleVote = async (voteId: string, optionId: string) => {
    try {
      await submitVote(voteId, optionId);
      Alert.alert('Başarılı!', 'Oyunuz kaydedildi.');
    } catch (error) {
      Alert.alert('Hata', 'Oy verilemedi.');
    }
  };

  const handleInviteMember = () => {
    Alert.alert(
      'Üye Davet Et',
      'Nasıl davet etmek istiyorsunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Email ile', 
          onPress: () => {
            Alert.prompt(
              'Email ile Davet Et',
              'Davet etmek istediğiniz kişinin email adresini girin:',
              [
                { text: 'İptal', style: 'cancel' },
                { 
                  text: 'Davet Et', 
                  onPress: async (email) => {
                    if (email?.trim()) {
                      try {
                        await sendInvitation({ email: email.trim() });
                        Alert.alert('Başarılı!', 'Davet gönderildi.');
                      } catch (error) {
                        Alert.alert('Hata', 'Davet gönderilemedi.');
                      }
                    }
                  }
                }
              ],
              'plain-text'
            );
          }
        },
        { 
          text: 'Kullanıcı adı ile', 
          onPress: () => {
            Alert.prompt(
              'Kullanıcı Adı ile Davet Et',
              'Davet etmek istediğiniz kişinin kullanıcı adını girin:',
              [
                { text: 'İptal', style: 'cancel' },
                { 
                  text: 'Davet Et', 
                  onPress: async (username) => {
                    if (username?.trim()) {
                      try {
                        await sendInvitation({ username: username.trim() });
                        Alert.alert('Başarılı!', 'Davet gönderildi.');
                      } catch (error) {
                        Alert.alert('Hata', 'Davet gönderilemedi.');
                      }
                    }
                  }
                }
              ],
              'plain-text'
            );
          }
        }
      ]
    );
  };

  const handleDeleteFamily = () => {
    Alert.alert(
      'Aileyi Sil',
      'Bu aileyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            if (family) {
              try {
                await familyService.deleteFamily(family.id);
                Alert.alert('Başarılı!', 'Aile silindi.');
                // Reset state after deletion
                setFamily(null);
                setActiveMealVotes([]);
                await fetchMyFamilies(); // Refresh families list
              } catch (error) {
                Alert.alert('Hata', 'Aile silinemedi.');
              }
            }
          }
        }
      ]
    );
  };

  const handleLeaveFamily = () => {
    Alert.alert(
      'Aileden Çık',
      'Bu aileden ayrılmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çık', 
          style: 'destructive',
          onPress: async () => {
            if (family) {
              try {
                await familyService.leaveFamily(family.id);
                Alert.alert('Başarılı!', 'Aileden ayrıldınız.');
                // Reset state after leaving
                setFamily(null);
                setActiveMealVotes([]);
                await fetchMyFamilies(); // Refresh families list
              } catch (error) {
                Alert.alert('Hata', 'Aileden çıkılamadı.');
              }
            }
          }
        }
      ]
    );
  };

  const renderFamilyMember = ({ item }: { item: any }) => (
    <View style={styles.memberCard}>
      <Text style={styles.memberAvatar}>👤</Text>
      <View style={styles.memberInfo}>
        <View style={styles.memberHeader}>
          <Text style={styles.memberName}>{item.user.username}</Text>
          {item.role === 'admin' && <Text style={styles.ownerBadge}>👑</Text>}
        </View>
        <Text style={styles.memberLastActive}>Katılma: {new Date(item.joinedAt).toLocaleDateString()}</Text>
      </View>
    </View>
  );



  if (!family && !loading) {
    return (
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Pending Invitations - Show even when no family */}
        {pendingInvitations && pendingInvitations.length > 0 && (
          <View style={styles.invitationsSection}>
            <Text style={styles.sectionTitle}>📩 Aile Davetleri</Text>
            {pendingInvitations.map((invitation) => (
              <View key={invitation.id} style={styles.invitationCard}>
                <View style={styles.invitationHeader}>
                  <Text style={styles.invitationTitle}>{invitation.family.name}</Text>
                  <Text style={styles.invitationFrom}>
                    {invitation.inviter.username} tarafından davet edildiniz
                  </Text>
                </View>
                <View style={styles.invitationActions}>
                  <TouchableOpacity 
                    style={[styles.invitationButton, styles.acceptButton]}
                    onPress={async () => {
                      try {
                        await processInvitation.mutateAsync({ 
                          invitationId: invitation.id, 
                          data: { action: 'accept' } 
                        });
                        // Refresh families after accepting invitation
                        await fetchMyFamilies();
                        Alert.alert('Başarılı!', 'Aileye katıldınız!');
                      } catch (error) {
                        Alert.alert('Hata', 'Davet kabul edilemedi.');
                      }
                    }}
                  >
                    <Text style={styles.acceptButtonText}>✅ Kabul Et</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.invitationButton, styles.rejectButton]}
                    onPress={async () => {
                      try {
                        await processInvitation.mutateAsync({ 
                          invitationId: invitation.id, 
                          data: { action: 'reject' } 
                        });
                        Alert.alert('Başarılı!', 'Davet reddedildi.');
                      } catch (error) {
                        Alert.alert('Hata', 'Davet reddedilemedi.');
                      }
                    }}
                  >
                    <Text style={styles.rejectButtonText}>❌ Reddet</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.noFamilyContainer}>
          <Text style={styles.noFamilyEmoji}>👨‍👩‍👧‍👦</Text>
          <Text style={styles.noFamilyTitle}>Henüz bir aileniz yok</Text>
          <Text style={styles.noFamilySubtitle}>
            Yeni bir aile oluşturun veya mevcut bir aileye katılın
          </Text>
          
          <TouchableOpacity style={styles.primaryButton} onPress={handleCreateFamily}>
            <Text style={styles.primaryButtonText}>🏠 Yeni Aile Oluştur</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleJoinFamily}>
            <Text style={styles.secondaryButtonText}>👥 Aileye Katıl</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Family Header */}
      <View style={styles.familyHeader}>
        <Text style={styles.familyName}>{family?.name || 'Aile'}</Text>
        <Text style={styles.familyMemberCount}>{family?.members?.length || 0} üye</Text>
      </View>

      {/* Pending Invitations */}
      {pendingInvitations && pendingInvitations.length > 0 && (
        <View style={styles.invitationsSection}>
          <Text style={styles.sectionTitle}>📩 Aile Davetleri</Text>
          {pendingInvitations.map((invitation) => (
            <View key={invitation.id} style={styles.invitationCard}>
              <View style={styles.invitationHeader}>
                <Text style={styles.invitationTitle}>{invitation.family.name}</Text>
                <Text style={styles.invitationFrom}>
                  {invitation.inviter.username} tarafından davet edildiniz
                </Text>
              </View>
              <View style={styles.invitationActions}>
                <TouchableOpacity 
                  style={[styles.invitationButton, styles.acceptButton]}
                  onPress={async () => {
                    try {
                      await processInvitation.mutateAsync({ 
                        invitationId: invitation.id, 
                        data: { action: 'accept' } 
                      });
                      // Refresh families after accepting invitation
                      await fetchMyFamilies();
                      Alert.alert('Başarılı!', 'Aileye katıldınız!');
                    } catch (error) {
                      Alert.alert('Hata', 'Davet kabul edilemedi.');
                    }
                  }}
                >
                  <Text style={styles.acceptButtonText}>✅ Kabul Et</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.invitationButton, styles.rejectButton]}
                  onPress={async () => {
                    try {
                      await processInvitation.mutateAsync({ 
                        invitationId: invitation.id, 
                        data: { action: 'reject' } 
                      });
                      Alert.alert('Başarılı!', 'Davet reddedildi.');
                    } catch (error) {
                      Alert.alert('Hata', 'Davet reddedilemedi.');
                    }
                  }}
                >
                  <Text style={styles.rejectButtonText}>❌ Reddet</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Current Voting */}
      {activeMealVotes.length > 0 && (
      <View style={styles.votingSection}>
          <Text style={styles.sectionTitle}>🗳️ Aktif Oylama</Text>
          {activeMealVotes.map((vote) => (
            <View key={vote.id} style={styles.votingCard}>
              <Text style={styles.votingQuestion}>{vote.title}</Text>
          <Text style={styles.votingDeadline}>
                ⏰ Bitiş: {new Date(vote.endsAt).toLocaleString()}
          </Text>
          
              {vote.options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.votingOption}
                  onPress={() => handleVote(vote.id, option.id)}
                >
                  <View style={styles.votingOptionHeader}>
                    <Text style={styles.votingOptionTitle}>{option.recipe.title}</Text>
                    <Text style={styles.votingOptionVotes}>{option.voteCount} oy</Text>
                  </View>
                  <Text style={styles.votingOptionVoters}>
                    {option.recipe.description || 'Açıklama yok'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Family Members */}
      {family?.members && (
      <View style={styles.membersSection}>
        <Text style={styles.sectionTitle}>👥 Aile Üyeleri</Text>
        <FlatList
            data={family.members}
          renderItem={renderFamilyMember}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>🗳️ Yeni Oylama</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleInviteMember}>
          <Text style={styles.actionButtonText}>👥 Üye Davet Et</Text>
        </TouchableOpacity>
        
        {family && user?.id === family.adminUserId ? (
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleDeleteFamily}>
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>🗑️ Aileyi Sil</Text>
          </TouchableOpacity>
        ) : family && (
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleLeaveFamily}>
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>🚪 Aileden Çık</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  // No Family State
  noFamilyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  noFamilyEmoji: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  noFamilyTitle: {
    fontSize: FontSize.title,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  noFamilySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  // Family Header
  familyHeader: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  familyName: {
    fontSize: FontSize.title,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  familyMemberCount: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  // Sections
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  // Invitations Section
  invitationsSection: {
    marginBottom: Spacing.lg,
  },
  invitationCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  invitationHeader: {
    marginBottom: Spacing.md,
  },
  invitationTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  invitationFrom: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  invitationActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  invitationButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#28a745',
  },
  acceptButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  rejectButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  // Voting Section
  votingSection: {
    marginBottom: Spacing.lg,
  },
  votingCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  votingQuestion: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  votingDeadline: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginBottom: Spacing.lg,
  },
  votingOptions: {
    marginTop: Spacing.md,
  },
  votingOption: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  votingOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  votingOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  votingOptionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  votingOptionVotes: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  votingOptionVoters: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  // Members Section
  membersSection: {
    marginBottom: Spacing.lg,
  },
  memberCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    fontSize: 30,
    marginRight: Spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  memberName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginRight: Spacing.sm,
  },
  ownerBadge: {
    fontSize: FontSize.sm,
  },
  memberLastActive: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  // Actions Section
  actionsSection: {
    marginBottom: Spacing.xl,
  },
  actionButton: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  dangerButtonText: {
    color: Colors.white,
  },
});

export default FamilyScreen; 