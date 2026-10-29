import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Feather } from '../components/FeatherIcon';
import { useMobilePawty, MAX_FREE_PETS } from '../context/MobilePawtyContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_ITEM_SIZE = Math.floor((SCREEN_WIDTH - 32 - 8) / 3);

export const MobileProfileScreen: React.FC = () => {
  const {
    theme,
    ownerName,
    ownerHandle,
    ownerBio,
    ownerArea,
    ownerNoteBubble,
    isPrivateProfile,
    pets,
    activePetId,
    setActivePetId,
    addNewPetProfile,
    deletePetProfile,
    togglePetVaccinationAndRabies,
    posts,
    isVip,
    activeVipPlanId,
    userTinderSetup,
    suggestedPeople,
    toggleFollowSuggestedPerson,
    dismissSuggestedPerson,
    openPublicUserProfile,
    openLightboxMedia,
    setActiveModal,
  } = useMobilePawty();

  const [profileSubTab, setProfileSubTab] = useState<'grid' | 'pets' | 'tinder_setup'>('grid');
  const [showDiscoverPeople, setShowDiscoverPeople] = useState(true);
  const [isAddingPetInline, setIsAddingPetInline] = useState(false);

  // Inline Add Pet Form State (Free up to 3 pets)
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<'Chó' | 'Mèo'>('Chó');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetWeight, setNewPetWeight] = useState('6.5');
  const [newPetAge, setNewPetAge] = useState('1 tuổi');

  const myPosts = posts.filter((p) => p.authorHandle === ownerHandle);
  const displayPosts = myPosts.length > 0 ? myPosts : posts.slice(0, 4);
  const ownerAvatarUrl =
    pets[0]?.avatarUrl ||
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. INSTAGRAM-STYLE PROFILE TOP SECTION */}
      <View style={styles.igTopSection}>
        {/* Floating Note Bubble above Avatar */}
        <TouchableOpacity
          style={styles.noteBubbleWrap}
          onPress={() => setActiveModal('edit_profile')}
          activeOpacity={0.85}
        >
          <View style={styles.noteBubble}>
            <Text style={styles.noteBubbleText} numberOfLines={2}>
              {ownerNoteBubble || 'Hỏi bạn bè bất cứ điều gì...'}
            </Text>
          </View>
          <View style={styles.noteBubbleTail} />
        </TouchableOpacity>

        <View style={styles.avatarAndStatsRow}>
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => setActiveModal('edit_profile')}
            activeOpacity={0.85}
          >
            <Image source={{ uri: ownerAvatarUrl }} style={styles.igAvatar} />
            <View style={styles.avatarPlusBadge}>
              <Feather name="plus" size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Owner Name + 3 Stats */}
          <View style={styles.rightStatsColumn}>
            <View style={styles.ownerNameRow}>
              <Text style={styles.igOwnerName}>{ownerName}</Text>
              {isVip && (
                <View style={[styles.tierPill, { backgroundColor: theme.primarySoft }]}>
                  <Feather name="award" size={11} color={theme.primary} />
                  <Text style={[styles.tierPillText, { color: theme.primary }]}>
                    {activeVipPlanId === 'vip_gold' ? 'Gold' : 'Plus'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statNum}>{myPosts.length}</Text>
                <Text style={styles.statLabel}>bài viết</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statNum}>218</Text>
                <Text style={styles.statLabel}>người theo dõi</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statNum}>305</Text>
                <Text style={styles.statLabel}>đang theo dõi</Text>
              </View>
            </View>
          </View>
        </View>

        {/* @handle pill + Bio */}
        <View style={styles.bioBlock}>
          <View style={styles.handleAndLocationRow}>
            <View style={styles.atHandlePill}>
              <Text style={styles.atHandleText}>{ownerHandle}</Text>
            </View>
            <View style={styles.locationMiniRow}>
              <Feather name="map-pin" size={11} color="#7A6E63" />
              <Text style={styles.locationMiniText}>{ownerArea}</Text>
            </View>
            {isPrivateProfile && (
              <View style={styles.privateMiniTag}>
                <Feather name="lock" size={10} color="#6C6055" />
                <Text style={styles.privateMiniText}>Riêng tư</Text>
              </View>
            )}
          </View>
          <Text style={styles.igBioText}>{ownerBio}</Text>
        </View>

        {/* Action Buttons Row: Chỉnh sửa trang cá nhân | Hồ sơ Kết nối | Toggle Suggested People */}
        <View style={styles.igActionButtonsRow}>
          <TouchableOpacity
            style={styles.igGrayActionBtn}
            onPress={() => setActiveModal('edit_profile')}
          >
            <Text style={styles.igGrayActionBtnText}>Chỉnh sửa trang cá nhân</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.igGrayActionBtn}
            onPress={() => setActiveModal('tinder_setup')}
          >
            <Text style={styles.igGrayActionBtnText}>Hồ sơ Kết nối</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.igIconActionBtn,
              showDiscoverPeople && { backgroundColor: '#E5DDD3' },
            ]}
            onPress={() => setShowDiscoverPeople(!showDiscoverPeople)}
          >
            <Feather name="user-plus" size={15} color="#1C1815" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. INSTAGRAM "KHÁM PHÁ MỌI NGƯỜI" HORIZONTAL CARDS */}
      {showDiscoverPeople && suggestedPeople.length > 0 && (
        <View style={styles.discoverSection}>
          <View style={styles.discoverHeaderRow}>
            <Text style={styles.discoverTitle}>Khám phá mọi người</Text>
            <TouchableOpacity onPress={() => setActiveModal('my_settings')}>
              <Text style={[styles.discoverSeeAll, { color: theme.primary }]}>
                Cài đặt & Plus
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.discoverScrollContent}
          >
            {suggestedPeople.map((person) => (
              <View key={person.id} style={styles.discoverPersonCard}>
                <TouchableOpacity
                  style={styles.dismissPersonBtn}
                  onPress={() => dismissSuggestedPerson(person.id)}
                >
                  <Feather name="x" size={14} color="#8E8074" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.discoverPersonCenter}
                  onPress={() => openPublicUserProfile(person.handle)}
                >
                  <Image source={{ uri: person.avatarUrl }} style={styles.discoverAvatar} />
                  <Text style={styles.discoverName} numberOfLines={1}>
                    {person.name}
                  </Text>
                  <Text style={styles.discoverMutual} numberOfLines={2}>
                    {person.mutualText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.followPersonBtn,
                    { backgroundColor: person.isFollowing ? '#ECE6DF' : '#4C68D7' },
                  ]}
                  onPress={() => toggleFollowSuggestedPerson(person.id)}
                >
                  <Text
                    style={[
                      styles.followPersonBtnText,
                      person.isFollowing && { color: '#2C2520' },
                    ]}
                  >
                    {person.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 3. INSTAGRAM ICON TAB BAR: Bài viết (Grid) | Thú cưng (Max 3 Free) | Hồ sơ Kết nối */}
      <View style={styles.igTabBar}>
        <TouchableOpacity
          style={[
            styles.igTabBtn,
            profileSubTab === 'grid' && [
              styles.igTabBtnActive,
              { borderBottomColor: '#1C1815' },
            ],
          ]}
          onPress={() => setProfileSubTab('grid')}
        >
          <Feather
            name="grid"
            size={18}
            color={profileSubTab === 'grid' ? '#1C1815' : '#9C8E80'}
          />
          <Text
            style={[
              styles.igTabText,
              profileSubTab === 'grid' && styles.igTabTextActive,
            ]}
          >
            Bài viết
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.igTabBtn,
            profileSubTab === 'pets' && [
              styles.igTabBtnActive,
              { borderBottomColor: '#1C1815' },
            ],
          ]}
          onPress={() => setProfileSubTab('pets')}
        >
          <Feather
            name="shield"
            size={18}
            color={profileSubTab === 'pets' ? '#1C1815' : '#9C8E80'}
          />
          <Text
            style={[
              styles.igTabText,
              profileSubTab === 'pets' && styles.igTabTextActive,
            ]}
          >
            Thú cưng ({pets.length}/{MAX_FREE_PETS})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.igTabBtn,
            profileSubTab === 'tinder_setup' && [
              styles.igTabBtnActive,
              { borderBottomColor: '#1C1815' },
            ],
          ]}
          onPress={() => setProfileSubTab('tinder_setup')}
        >
          <Feather
            name="heart"
            size={18}
            color={profileSubTab === 'tinder_setup' ? '#1C1815' : '#9C8E80'}
          />
          <Text
            style={[
              styles.igTabText,
              profileSubTab === 'tinder_setup' && styles.igTabTextActive,
            ]}
          >
            Hồ sơ Kết nối
          </Text>
        </TouchableOpacity>
      </View>

      {/* SUB-TAB 1: 3-COLUMN PHOTO GRID */}
      {profileSubTab === 'grid' && (
        <View style={styles.photoGrid}>
          {displayPosts.map((post) => {
            const urls = post.mediaUrls;
            return (
              <TouchableOpacity
                key={post.id}
                style={styles.gridCell}
                activeOpacity={0.9}
                onPress={() =>
                  openLightboxMedia({
                    postId: post.id,
                    mediaUrls: urls,
                    initialIndex: 0,
                    mediaType: post.mediaType,
                    videoDuration: post.videoDuration,
                    caption: post.content,
                    authorName: post.authorName,
                  })
                }
              >
                <Image source={{ uri: urls[0] }} style={styles.gridImg} />
                {urls.length > 1 && (
                  <View style={styles.gridMultiBadge}>
                    <Feather name="layers" size={11} color="#FFFFFF" />
                  </View>
                )}
                {post.mediaType === 'video' && (
                  <View style={styles.gridMultiBadge}>
                    <Feather name="video" size={11} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* SUB-TAB 2: PET PROFILES (MAX 3 FREE FOR ALL USERS + DELETE PET + PER-PET VACCINATION) */}
      {profileSubTab === 'pets' && (
        <View style={styles.petsTabSection}>
          <View style={styles.petPolicyBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.petPolicyTitle}>
                Quản lý Thú cưng ({pets.length}/{MAX_FREE_PETS} bé miễn phí)
              </Text>
              <Text style={styles.petPolicySub}>
                Mỗi tài khoản được tạo tối đa 3 hồ sơ thú cưng hoàn toàn miễn phí. Dấu tích tiêm chủng & phòng dại được gắn riêng trên từng bé.
              </Text>
            </View>
            {pets.length < MAX_FREE_PETS && (
              <TouchableOpacity
                style={[styles.addPetBtn, { backgroundColor: theme.primary }]}
                onPress={() => setIsAddingPetInline(!isAddingPetInline)}
              >
                <Feather name={isAddingPetInline ? 'x' : 'plus'} size={14} color="#FFFFFF" />
                <Text style={styles.addPetBtnText}>
                  {isAddingPetInline ? 'Đóng' : 'Thêm bé'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {isAddingPetInline && (
            <View style={styles.inlineAddPetCard}>
              <Text style={styles.petPolicyTitle}>Thêm thú cưng mới ({pets.length}/{MAX_FREE_PETS})</Text>
              <View style={styles.twoCol}>
                <TouchableOpacity
                  style={[
                    styles.speciesBtn,
                    newPetSpecies === 'Chó' && {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={() => setNewPetSpecies('Chó')}
                >
                  <Text style={[styles.speciesBtnText, newPetSpecies === 'Chó' && { color: '#FFFFFF' }]}>
                    Loài Chó
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.speciesBtn,
                    newPetSpecies === 'Mèo' && {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={() => setNewPetSpecies('Mèo')}
                >
                  <Text style={[styles.speciesBtnText, newPetSpecies === 'Mèo' && { color: '#FFFFFF' }]}>
                    Loài Mèo
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.twoCol}>
                <TextInput
                  style={[styles.inlineInput, { flex: 1 }]}
                  placeholder="Tên bé (VD: Bơ)"
                  placeholderTextColor="#A3968A"
                  value={newPetName}
                  onChangeText={setNewPetName}
                />
                <TextInput
                  style={[styles.inlineInput, { width: 100 }]}
                  placeholder="Kg (6.5)"
                  placeholderTextColor="#A3968A"
                  keyboardType="decimal-pad"
                  value={newPetWeight}
                  onChangeText={setNewPetWeight}
                />
              </View>

              <View style={styles.twoCol}>
                <TextInput
                  style={[styles.inlineInput, { flex: 1 }]}
                  placeholder="Giống loài (VD: Poodle)"
                  placeholderTextColor="#A3968A"
                  value={newPetBreed}
                  onChangeText={setNewPetBreed}
                />
                <TextInput
                  style={[styles.inlineInput, { width: 100 }]}
                  placeholder="Tuổi (1 tuổi)"
                  placeholderTextColor="#A3968A"
                  value={newPetAge}
                  onChangeText={setNewPetAge}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveInlinePetBtn, { backgroundColor: theme.primary }]}
                onPress={() => {
                  addNewPetProfile({
                    name: newPetName,
                    species: newPetSpecies,
                    breed: newPetBreed || 'Chưa rõ giống',
                    weightKg: parseFloat(newPetWeight) || 5.0,
                    ageLabel: newPetAge || '1 tuổi',
                  });
                  setNewPetName('');
                  setNewPetBreed('');
                  setIsAddingPetInline(false);
                }}
              >
                <Feather name="check" size={14} color="#FFFFFF" />
                <Text style={styles.saveInlinePetBtnText}>Lưu thú cưng mới</Text>
              </TouchableOpacity>
            </View>
          )}

          {pets.map((pet) => {
            const isSelected = pet.id === activePetId;
            return (
              <View
                key={pet.id}
                style={[
                  styles.petManageCard,
                  isSelected && { borderColor: theme.primary, borderWidth: 1.5 },
                ]}
              >
                <View style={styles.petManageTopRow}>
                  <Image source={{ uri: pet.avatarUrl }} style={styles.petManageAvatar} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.petNameLine}>
                      <Text style={styles.petManageName}>{pet.name}</Text>
                      <View style={styles.speciesChip}>
                        <Text style={styles.speciesChipText}>Loài {pet.species}</Text>
                      </View>
                    </View>
                    <Text style={styles.petManageMeta}>
                      {pet.breed} · {pet.gender} · {pet.ageLabel} · {pet.weightKg} kg
                    </Text>

                    {/* Per-Pet Vaccination & Rabies Tick (Tap to toggle directly on this pet) */}
                    <TouchableOpacity
                      style={[
                        styles.petVaccinePill,
                        !pet.isVaccinatedAndRabies && styles.petVaccinePillWarn,
                      ]}
                      onPress={() => togglePetVaccinationAndRabies(pet.id)}
                    >
                      <Feather
                        name={pet.isVaccinatedAndRabies ? 'check-circle' : 'alert-triangle'}
                        size={12}
                        color={pet.isVaccinatedAndRabies ? '#2E7D5B' : '#B85D43'}
                      />
                      <Text
                        style={[
                          styles.petVaccinePillText,
                          !pet.isVaccinatedAndRabies && { color: '#B85D43' },
                        ]}
                      >
                        {pet.isVaccinatedAndRabies
                          ? 'Đã tiêm chủng & Phòng dại đầy đủ'
                          : 'Chạm để xác nhận mũi tiêm & phòng dại'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.petBioNote}>{pet.bio}</Text>

                <View style={styles.petActionsFooter}>
                  <TouchableOpacity
                    style={[styles.petEditBtn, { backgroundColor: theme.primarySoft }]}
                    onPress={() => {
                      setActivePetId(pet.id);
                      setActiveModal('edit_profile');
                    }}
                  >
                    <Feather name="edit-3" size={13} color={theme.primary} />
                    <Text style={[styles.petEditBtnText, { color: theme.primary }]}>
                      Chỉnh sửa hồ sơ bé
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.petDeleteBtn}
                    onPress={() => deletePetProfile(pet.id)}
                  >
                    <Feather name="trash-2" size={13} color="#C9302C" />
                    <Text style={styles.petDeleteBtnText}>Xóa thú cưng</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* SUB-TAB 3: USER TINDER SETUP PROFILE PREVIEW & EDIT */}
      {profileSubTab === 'tinder_setup' && (
        <View style={styles.tinderSetupSection}>
          <View style={styles.tinderSetupCard}>
            <View style={styles.tinderSetupHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.tinderSetupTitle}>
                  Hồ sơ Kết nối của {ownerName}, {userTinderSetup.age}
                </Text>
                <Text style={styles.tinderSetupSub}>
                  Thông tin này hiển thị trên thẻ của bạn ở nhánh Kết nối (Tinder)
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.editTinderBtn, { backgroundColor: theme.primary }]}
                onPress={() => setActiveModal('tinder_setup')}
              >
                <Feather name="edit-3" size={13} color="#FFFFFF" />
                <Text style={styles.editTinderBtnText}>Thiết lập</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tinderPreviewBox}>
              <Text style={styles.tinderFieldLabel}>Đang tìm kiếm</Text>
              <Text style={styles.tinderFieldBig}>{userTinderSetup.lookingFor}</Text>
            </View>

            <View style={styles.tinderLifestyleGrid}>
              <View style={styles.tinderPillItem}>
                <Feather name="user" size={13} color="#5C5046" />
                <Text style={styles.tinderPillText}>Giới tính: {userTinderSetup.gender}</Text>
              </View>
              <View style={styles.tinderPillItem}>
                <Feather name="zap" size={13} color="#5C5046" />
                <Text style={styles.tinderPillText}>{userTinderSetup.smoking}</Text>
              </View>
              <View style={styles.tinderPillItem}>
                <Feather name="activity" size={13} color="#5C5046" />
                <Text style={styles.tinderPillText}>Tập luyện: {userTinderSetup.workout}</Text>
              </View>
              <View style={styles.tinderPillItem}>
                <Feather name="coffee" size={13} color="#5C5046" />
                <Text style={styles.tinderPillText}>{userTinderSetup.drinking}</Text>
              </View>
              <View style={styles.tinderPillItem}>
                <Feather name="star" size={13} color="#5C5046" />
                <Text style={styles.tinderPillText}>{userTinderSetup.zodiac}</Text>
              </View>
              <View style={styles.tinderPillItem}>
                <Feather name="message-circle" size={13} color="#5C5046" />
                <Text style={styles.tinderPillText}>{userTinderSetup.chatStyle}</Text>
              </View>
            </View>

            <Text style={[styles.tinderFieldLabel, { marginTop: 14, marginBottom: 6 }]}>
              Thú cưng đính kèm trên thẻ Kết nối ({pets.length} bé)
            </Text>
            {pets.map((p) => (
              <View key={p.id} style={styles.tinderAttachedPetRow}>
                <Image source={{ uri: p.avatarUrl }} style={styles.tinderAttachedPetAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.tinderAttachedPetName}>
                    {p.name} ({p.species} · {p.breed})
                  </Text>
                  <Text style={styles.tinderAttachedPetVaccine}>
                    {p.isVaccinatedAndRabies
                      ? '✓ Đã tiêm chủng & Phòng dại đầy đủ'
                      : 'Chưa xác nhận tiêm phòng'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  igTopSection: {
    marginBottom: 14,
  },
  noteBubbleWrap: {
    alignSelf: 'flex-start',
    marginLeft: 6,
    marginBottom: -6,
    zIndex: 5,
  },
  noteBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: 160,
    borderWidth: 1,
    borderColor: '#E5DDD3',
  },
  noteBubbleText: {
    fontSize: 11,
    color: '#4A3F35',
    fontWeight: '600',
  },
  noteBubbleTail: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DDD3',
    marginLeft: 22,
    marginTop: -3,
  },
  avatarAndStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  avatarWrap: {
    position: 'relative',
  },
  igAvatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#EFE9E1',
    borderWidth: 1.5,
    borderColor: '#E5DDD3',
  },
  avatarPlusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1C1815',
    borderWidth: 2,
    borderColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightStatsColumn: {
    flex: 1,
    gap: 10,
  },
  ownerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  igOwnerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1815',
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  tierPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    alignItems: 'flex-start',
  },
  statNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1C1815',
  },
  statLabel: {
    fontSize: 12,
    color: '#5C5046',
    marginTop: 1,
  },
  bioBlock: {
    marginTop: 10,
    gap: 5,
  },
  handleAndLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  atHandlePill: {
    backgroundColor: '#EFE9E1',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 99,
  },
  atHandleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2C2520',
  },
  locationMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationMiniText: {
    fontSize: 12,
    color: '#7A6E63',
    fontWeight: '600',
  },
  privateMiniTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFE9E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  privateMiniText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6C6055',
  },
  igBioText: {
    fontSize: 13,
    color: '#2C2520',
    lineHeight: 19,
  },
  igActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  igGrayActionBtn: {
    flex: 1,
    backgroundColor: '#EFE9E1',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  igGrayActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1815',
  },
  igIconActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFE9E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoverSection: {
    marginBottom: 16,
  },
  discoverHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  discoverTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1815',
  },
  discoverSeeAll: {
    fontSize: 13,
    fontWeight: '700',
  },
  discoverScrollContent: {
    gap: 10,
  },
  discoverPersonCard: {
    width: 148,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5DDD3',
    alignItems: 'center',
    position: 'relative',
  },
  dismissPersonBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 5,
  },
  discoverPersonCenter: {
    alignItems: 'center',
    width: '100%',
  },
  discoverAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F3EFEA',
    marginBottom: 8,
  },
  discoverName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1815',
    textAlign: 'center',
  },
  discoverMutual: {
    fontSize: 11,
    color: '#7A6E63',
    textAlign: 'center',
    marginTop: 2,
    height: 30,
  },
  followPersonBtn: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 8,
  },
  followPersonBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  igTabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5DDD3',
    marginBottom: 10,
  },
  igTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  igTabBtnActive: {
    borderBottomWidth: 2,
  },
  igTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9C8E80',
  },
  igTabTextActive: {
    color: '#1C1815',
    fontWeight: '800',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  gridCell: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EFE9E1',
  },
  gridImg: {
    width: '100%',
    height: '100%',
  },
  gridMultiBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(28, 24, 21, 0.72)',
    padding: 4,
    borderRadius: 6,
  },
  petsTabSection: {
    gap: 12,
  },
  petPolicyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  petPolicyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2520',
  },
  petPolicySub: {
    fontSize: 11,
    color: '#7A6E63',
    marginTop: 2,
    lineHeight: 16,
  },
  addPetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  addPetBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  inlineAddPetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5DDD3',
    gap: 8,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 8,
  },
  speciesBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5DDD3',
    alignItems: 'center',
  },
  speciesBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A3F35',
  },
  inlineInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5DDD3',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#2C2520',
  },
  saveInlinePetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveInlinePetBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  petManageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE6DF',
    gap: 10,
  },
  petManageTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  petManageAvatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#F3EFEA',
  },
  petNameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petManageName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C2520',
  },
  speciesChip: {
    backgroundColor: '#EFE9E1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  speciesChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5C5046',
  },
  petManageMeta: {
    fontSize: 12,
    color: '#7A6E63',
    marginTop: 2,
    marginBottom: 6,
  },
  petVaccinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: '#EAF7F1',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  petVaccinePillWarn: {
    backgroundColor: '#FDF3F2',
  },
  petVaccinePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E7D5B',
  },
  petBioNote: {
    fontSize: 12,
    color: '#4A3F35',
    lineHeight: 18,
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 12,
  },
  petActionsFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  petEditBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  petEditBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  petDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FDF3F2',
  },
  petDeleteBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C9302C',
  },
  tinderSetupSection: {
    gap: 12,
  },
  tinderSetupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  tinderSetupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  tinderSetupTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C2520',
  },
  tinderSetupSub: {
    fontSize: 12,
    color: '#7A6E63',
    marginTop: 2,
  },
  editTinderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  editTinderBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tinderPreviewBox: {
    backgroundColor: '#FAF7F2',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  tinderFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A6E63',
  },
  tinderFieldBig: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1C1815',
    marginTop: 3,
  },
  tinderLifestyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tinderPillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  tinderPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2C2520',
  },
  tinderAttachedPetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
  },
  tinderAttachedPetAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  tinderAttachedPetName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C2520',
  },
  tinderAttachedPetVaccine: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D5B',
    marginTop: 2,
  },
});
