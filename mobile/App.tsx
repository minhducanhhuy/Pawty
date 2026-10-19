import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';

const { width } = Dimensions.get('window');

// API Host config (pointing to NestJS Backend on LAN or Localhost)
const API_BASE_URL = 'http://192.168.21.100:3000/api';

// Brand Colors
const COLORS = {
  coral: '#FF6F61',
  coralDark: '#E85B4E',
  coralLight: '#FFEAE8',
  mint: '#A3E4D7',
  mintDark: '#2BA690',
  mintLight: '#E8F8F5',
  cream: '#FDFBF7',
  white: '#FFFFFF',
  textDark: '#2D3748',
  textMuted: '#718096',
  border: '#E2E8F0',
  gold: '#F59E0B',
  goldLight: '#FEF3C7',
  danger: '#EF4444',
};

// Initial Mock Bosses (backed by PostGIS data)
const INITIAL_PETS = [
  {
    id: 'pet_mochi_02',
    name: 'Mochi',
    breed: 'Shiba Inu',
    species: 'dog',
    gender: 'female',
    age: '2 tuổi 2 tháng',
    weight: '9.8 kg',
    isVaccinated: true,
    vaccineDetails: 'Mũi nhắc 7 bệnh & Phổi PetCare',
    lastVaccineDate: '02/02/2026',
    bio: 'Nữ hoàng drama chung cư Park 3. Mặt lúc nào cũng cười nhưng ghét nhất đụng đuôi!',
    tags: ['Ngoan ngoãn', 'Quý tộc', 'Thánh biểu cảm'],
    habitsGood: ['Không cắn đồ', 'Dắt dây rất ngoan'],
    habitsBad: ['Hơi chảnh với cún nhỏ', 'Sợ tiếng máy sấy'],
    avatarUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
    distanceMeters: 164,
    condoComplex: 'Vinhomes Central Park - Park 3',
    ownerName: 'Thanh Hằng',
  },
  {
    id: 'pet_bunbo_03',
    name: 'Bún Bò',
    breed: 'Poodle Teacup',
    species: 'dog',
    gender: 'female',
    age: '1 tuổi 1 tháng',
    weight: '3.4 kg',
    isVaccinated: true,
    vaccineDetails: 'Đầy đủ sổ chích ngừa Vinmec Pet',
    lastVaccineDate: '10/12/2025',
    bio: 'Tuy bé hạt tiêu nhưng giọng sủa như loa phóng thanh. Cần bạn bự che chở.',
    tags: ['Điệu đà', 'Bám đuôi', 'Tăng động'],
    habitsGood: ['Biết đi 2 chân', 'Rất thích thơm má'],
    habitsBad: ['Hay hờn dỗi', 'Nhảy tót vào lòng người lạ'],
    avatarUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80',
    distanceMeters: 211,
    condoComplex: 'Landmark Plus',
    ownerName: 'Hoàng Long',
  },
  {
    id: 'pet_banhbao_04',
    name: 'Bánh Bao',
    breed: 'Mèo Anh Lông Ngắn',
    species: 'cat',
    gender: 'male',
    age: '2 tuổi 8 tháng',
    weight: '5.8 kg',
    isVaccinated: true,
    vaccineDetails: 'Vaccine 4 bệnh mèo PureVax',
    lastVaccineDate: '18/01/2026',
    bio: 'Má phính như 2 bánh bao hấp. Thích ngồi xe đẩy dạo hoàng hôn Central Park.',
    tags: ['Lười vận động', 'Quý tộc', 'Mê pate'],
    habitsGood: ['Không cào cấu', 'Cho ẵm bồng thoải mái'],
    habitsBad: ['Ngủ 18 tiếng mỗi ngày', 'Ghét tiếng còi xe'],
    avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    distanceMeters: 546,
    condoComplex: 'The Sun Avenue',
    ownerName: 'Lan Phương',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'radar' | 'moments' | 'chat' | 'profile'>('radar');
  const [pets, setPets] = useState(INITIAL_PETS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVip, setIsVip] = useState(false);
  const [swipesLeft, setSwipesLeft] = useState(15);

  // Modals state
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [matchedPet, setMatchedPet] = useState<any>(null);
  const [sosModalVisible, setSosModalVisible] = useState(false);
  const [vipModalVisible, setVipModalVisible] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // Profile Sub-tab
  const [profileSubTab, setProfileSubTab] = useState<'moments' | 'health'>('moments');

  // Moments list state
  const [moments, setMoments] = useState([
    {
      id: 'm1',
      imageUrl: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80',
      caption: 'Đang ngắm hoàng hôn thì phát hiện quầy xúc xích nướng Landmark 5 🌭👀',
      likes: 42,
      isLiked: false,
    },
    {
      id: 'm2',
      imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
      caption: 'Khuôn mặt khi bị bắt đi tắm sau một buổi quẩy bãi cỏ ướt 🛁',
      likes: 68,
      isLiked: true,
    },
    {
      id: 'm3',
      imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80',
      caption: 'Trùm mền ngủ trưa kệ đời drama ngoài sảnh chung cư 😴',
      likes: 55,
      isLiked: false,
    },
  ]);

  // Fetch live radar from NestJS server on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/radar?lat=10.7951&lng=106.7218&radius=3000`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.length > 0) {
          setPets(json.data);
        }
      })
      .catch((err) => {
        console.log('Using local fallback data (Backend offline or network timeout):', err.message);
      });
  }, []);

  // Handle Swipe Action
  const handleSwipe = (action: 'like' | 'dislike') => {
    const currentPet = pets[currentIndex % pets.length];

    if (!isVip && swipesLeft <= 0) {
      setVipModalVisible(true);
      return;
    }

    if (!isVip) {
      setSwipesLeft((prev) => prev - 1);
    }

    if (action === 'like') {
      // Trigger match modal (simulating mutual like)
      setMatchedPet(currentPet);
      setMatchModalVisible(true);
    }

    setCurrentIndex((prev) => (prev + 1) % pets.length);
  };

  const currentPet = pets[currentIndex % pets.length];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cream} />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image
            source={require('./assets/pawty-icon.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>Pawty</Text>
        </View>

        <View style={styles.headerActions}>
          {/* SOS Emergency Button */}
          <TouchableOpacity
            style={styles.sosButton}
            onPress={() => setSosModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.sosButtonText}>🚨 SOS</Text>
          </TouchableOpacity>

          {/* VIP Upgrade Button */}
          <TouchableOpacity
            style={[styles.vipBadge, isVip && styles.vipActiveBadge]}
            onPress={() => setVipModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.vipBadgeText}>{isVip ? '👑 VIP' : '⭐ Nâng VIP'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Body */}
      <View style={styles.content}>
        {/* TAB 1: RADAR (QUẸT THẺ) */}
        {activeTab === 'radar' && currentPet && (
          <View style={styles.radarContainer}>
            {/* Filter Bar */}
            <View style={styles.filterBar}>
              <View style={styles.filterChipActive}>
                <Text style={styles.filterChipActiveText}>📍 Gần bạn (PostGIS)</Text>
              </View>
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>🐶 Cún</Text>
              </View>
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>🛡️ Đã tiêm ngừa</Text>
              </View>
            </View>

            {/* Boss Swipe Card */}
            <View style={styles.card}>
              <Image source={{ uri: currentPet.avatarUrl }} style={styles.cardImage} />

              {/* Distance & Safety Badge */}
              <View style={styles.badgeRow}>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceBadgeText}>
                    📍 Cách bạn {currentPet.distanceMeters || 164}m
                  </Text>
                </View>

                {currentPet.isVaccinated && (
                  <View style={styles.safeBadge}>
                    <Text style={styles.safeBadgeText}>🛡️ Safe Pet</Text>
                  </View>
                )}
              </View>

              {/* Card Bottom Details */}
              <View style={styles.cardInfoOverlay}>
                <View style={styles.nameRow}>
                  <Text style={styles.petName}>{currentPet.name}</Text>
                  <Text style={styles.petBreed}>
                    {currentPet.gender === 'male' ? '♂️' : '♀️'} {currentPet.breed}
                  </Text>
                </View>

                <Text style={styles.condoText}>🏢 {currentPet.condoComplex}</Text>
                <Text style={styles.petBio} numberOfLines={2}>
                  "{currentPet.bio}"
                </Text>

                {/* Character Tags */}
                <View style={styles.tagsRow}>
                  {currentPet.tags?.map((tag: string, idx: number) => (
                    <View key={idx} style={styles.tagChip}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Action Buttons (Pass & Like) */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.passButton}
                onPress={() => handleSwipe('dislike')}
                activeOpacity={0.7}
              >
                <Text style={styles.passButtonText}>✕</Text>
              </TouchableOpacity>

              <View style={styles.swipeQuotaBox}>
                <Text style={styles.swipeQuotaText}>
                  {isVip ? 'Quẹt không giới hạn 👑' : `Còn ${swipesLeft} lượt quẹt miễn phí`}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.likeButton}
                onPress={() => handleSwipe('like')}
                activeOpacity={0.7}
              >
                <Text style={styles.likeButtonText}>🐾</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 2: KHOẢNH KHẮC BỰA (INSTAGRAM GRID) */}
        {activeTab === 'moments' && (
          <ScrollView style={styles.momentsContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.momentsHeader}>
              <Text style={styles.sectionTitle}>📸 Khoảnh Khắc Bựa Hằng Ngày</Text>
              <Text style={styles.sectionSubtitle}>
                Nơi lưu trữ những pha tấu hài bất hủ của Boss chung cư
              </Text>
            </View>

            {moments.map((item) => (
              <View key={item.id} style={styles.momentCard}>
                <Image source={{ uri: item.imageUrl }} style={styles.momentImage} />
                <View style={styles.momentBody}>
                  <Text style={styles.momentCaption}>{item.caption}</Text>
                  <TouchableOpacity
                    style={styles.likeMomentRow}
                    onPress={() => {
                      setMoments((prev) =>
                        prev.map((m) =>
                          m.id === item.id
                            ? { ...m, likes: m.isLiked ? m.likes - 1 : m.likes + 1, isLiked: !m.isLiked }
                            : m,
                        ),
                      );
                    }}
                  >
                    <Text style={styles.likeMomentHeart}>{item.isLiked ? '❤️' : '🤍'}</Text>
                    <Text style={styles.likeMomentCount}>{item.likes} Sen đã thả tim</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* TAB 3: CHAT & KÈO HẸN */}
        {activeTab === 'chat' && (
          <ScrollView style={styles.chatContainer}>
            <Text style={styles.sectionTitle}>💬 Hộp Thư & Kèo Dạo Phố</Text>

            {/* Active Match Chat Item */}
            <TouchableOpacity
              style={styles.chatRoomItem}
              onPress={() => setActiveRoomId('room_mochi')}
              activeOpacity={0.8}
            >
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
                }}
                style={styles.chatAvatar}
              />
              <View style={styles.chatDetails}>
                <View style={styles.chatTitleRow}>
                  <Text style={styles.chatPartnerName}>Mochi (Shiba Inu)</Text>
                  <Text style={styles.chatTime}>17:35</Text>
                </View>
                <Text style={styles.chatLastMessage} numberOfLines={1}>
                  Bơ Lùn: Dạ chào chị Mochi xinh gái! Bơ vừa ngủ dậy...
                </Text>

                {/* Appointment Banner */}
                <View style={styles.chatAppointmentBadge}>
                  <Text style={styles.chatAppointmentText}>
                    🗓️ Kèo hẹn: 19:30 Tối nay @ Landmark 81 ven sông
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Room Conversation Modal */}
            <Modal
              visible={activeRoomId !== null}
              animationType="slide"
              transparent={false}
              onRequestClose={() => setActiveRoomId(null)}
            >
              <SafeAreaView style={styles.roomContainer}>
                {/* Room Header */}
                <View style={styles.roomHeader}>
                  <TouchableOpacity onPress={() => setActiveRoomId(null)}>
                    <Text style={styles.roomBackText}>← Quay lại</Text>
                  </TouchableOpacity>
                  <Text style={styles.roomTitle}>Mochi & Bơ Lùn</Text>
                  <View style={{ width: 60 }} />
                </View>

                {/* Messages & Appointment Card */}
                <ScrollView style={styles.roomMessages}>
                  {/* Suggestion Appointment Card */}
                  <View style={styles.appointmentCard}>
                    <Text style={styles.appointmentTag}>🐾 LỜI MỜI HẸN DẮT CÚN DẠO CHUNG</Text>
                    <Text style={styles.appointmentPlace}>
                      📍 Công viên Landmark 81 ven sông
                    </Text>
                    <Text style={styles.appointmentTime}>⏰ Tối nay • 19:30</Text>
                    <Text style={styles.appointmentNote}>
                      Gợi ý trung điểm GPS: Bãi cỏ rộng, có thùng rác vệ sinh.
                    </Text>

                    <View style={styles.appointmentActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => Alert.alert('Thành công', 'Đã chốt kèo dạo phố tối nay!')}
                      >
                        <Text style={styles.acceptButtonText}>Đồng ý kèo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => Alert.alert('Thông báo', 'Đã hủy lời mời')}
                      >
                        <Text style={styles.declineButtonText}>Từ chối</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Message Bubbles */}
                  <View style={styles.bubbleOther}>
                    <Text style={styles.bubbleOtherText}>
                      Gâu gâu! Chiều nay Sen có rảnh dắt bé Bơ ra hóng gió không?
                    </Text>
                    <Text style={styles.bubbleTime}>17:32</Text>
                  </View>

                  <View style={styles.bubbleMe}>
                    <Text style={styles.bubbleMeText}>
                      Dạ chào chị Mochi! Bơ vừa ngủ dậy, chiều nay định ra Landmark 81 nè.
                    </Text>
                    <Text style={styles.bubbleTimeWhite}>17:35</Text>
                  </View>
                </ScrollView>

                {/* Input Bar */}
                <View style={styles.roomInputBar}>
                  <TextInput
                    style={styles.roomInput}
                    placeholder="Nhập tin nhắn..."
                    placeholderTextColor="#A0AEC0"
                  />
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => Alert.alert('Gửi tin nhắn', 'Đã gửi qua WebSocket!')}
                  >
                    <Text style={styles.sendButtonText}>Gửi</Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </Modal>
          </ScrollView>
        )}

        {/* TAB 4: HỒ SƠ BOSS (2 TABS) */}
        {activeTab === 'profile' && (
          <ScrollView style={styles.profileContainer}>
            {/* Profile Header */}
            <View style={styles.profileHeaderCard}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80',
                }}
                style={styles.profileAvatar}
              />
              <Text style={styles.profileName}>Bơ Lùn 🐾</Text>
              <Text style={styles.profileBreed}>Corgi Pembroke • 1.5 tuổi • 11.2 kg</Text>
              <Text style={styles.profileCondo}>🏢 Vinhomes Central Park</Text>
              <Text style={styles.profileBio}>
                "Mông trái tim, chân ngắn 1 khúc nhưng chạy nhanh hơn bồ cũ lật mặt."
              </Text>

              {/* Sub-tab Switches */}
              <View style={styles.subTabRow}>
                <TouchableOpacity
                  style={[styles.subTabBtn, profileSubTab === 'moments' && styles.subTabBtnActive]}
                  onPress={() => setProfileSubTab('moments')}
                >
                  <Text
                    style={[
                      styles.subTabBtnText,
                      profileSubTab === 'moments' && styles.subTabBtnTextActive,
                    ]}
                  >
                    📸 Khoảnh khắc (3)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.subTabBtn, profileSubTab === 'health' && styles.subTabBtnActive]}
                  onPress={() => setProfileSubTab('health')}
                >
                  <Text
                    style={[
                      styles.subTabBtnText,
                      profileSubTab === 'health' && styles.subTabBtnTextActive,
                    ]}
                  >
                    🛡️ Sổ tiêm & Thói quen
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Profile Tab 1: Photo Grid */}
            {profileSubTab === 'moments' && (
              <View style={styles.profileGrid}>
                {moments.map((item) => (
                  <Image key={item.id} source={{ uri: item.imageUrl }} style={styles.gridImage} />
                ))}
              </View>
            )}

            {/* Profile Tab 2: Health Passport & Habits (Anti-bite) */}
            {profileSubTab === 'health' && (
              <View style={styles.healthPassportCard}>
                <View style={styles.vaccineHeader}>
                  <Text style={styles.vaccineTitle}>🛡️ SỔ TIÊM CHỦNG ĐIỆN TỬ</Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedBadgeText}>Đã xác minh</Text>
                  </View>
                </View>
                <Text style={styles.vaccineDetail}>
                  • Vắc-xin: 7 bệnh Vanguard Plus & Dại (Mũi nhắc 15/01/2026)
                </Text>
                <Text style={styles.vaccineDetail}>• Phòng khám: Chi cục Thú Y Bình Thạnh</Text>

                <View style={styles.divider} />

                <Text style={styles.habitSectionTitle}>✨ THÓI QUEN ĐỂ TRÁNH XUNG ĐỘT</Text>
                <View style={styles.habitBoxGood}>
                  <Text style={styles.habitGoodText}>
                    ✅ Đi vệ sinh đúng bãi cỏ, biết ngồi chờ hiệu lệnh
                  </Text>
                </View>
                <View style={styles.habitBoxBad}>
                  <Text style={styles.habitBadText}>
                    ⚠️ Thấy bồ câu là rượt, hay sủa xe máy nẹt pô
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('radar')}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>{activeTab === 'radar' ? '🧭' : '🧭'}</Text>
          <Text style={[styles.tabLabel, activeTab === 'radar' && styles.tabLabelActive]}>
            Radar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('moments')}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>{activeTab === 'moments' ? '📸' : '📷'}</Text>
          <Text style={[styles.tabLabel, activeTab === 'moments' && styles.tabLabelActive]}>
            Khoảnh khắc
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('chat')}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>{activeTab === 'chat' ? '💬' : '🗨️'}</Text>
          <Text style={[styles.tabLabel, activeTab === 'chat' && styles.tabLabelActive]}>
            Tin nhắn
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>{activeTab === 'profile' ? '👤' : '👥'}</Text>
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>
            Hồ sơ
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL 1: MATCH SUCCESS (CONFETTI) */}
      <Modal visible={matchModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.matchCard}>
            <Text style={styles.matchHeader}>🎉 NẮM ĐUÔI NHAU THÀNH CÔNG! 🎉</Text>
            <Text style={styles.matchSub}>
              Cả hai Boss đều đã quẹt thích nhau! Hãy hẹn nhau đi dạo công viên ngay nào.
            </Text>

            <View style={styles.matchAvatarsRow}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=400&q=80',
                }}
                style={styles.matchAvatar}
              />
              <Text style={styles.matchHeartIcon}>❤️</Text>
              <Image
                source={{
                  uri:
                    matchedPet?.avatarUrl ||
                    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80',
                }}
                style={styles.matchAvatar}
              />
            </View>

            <TouchableOpacity
              style={styles.matchChatButton}
              onPress={() => {
                setMatchModalVisible(false);
                setActiveTab('chat');
                setActiveRoomId('room_mochi');
              }}
            >
              <Text style={styles.matchChatButtonText}>Nhắn tin hẹn dạo ngay 🐾</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.matchCloseButton}
              onPress={() => setMatchModalVisible(false)}
            >
              <Text style={styles.matchCloseText}>Để sau</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: SOS EMERGENCY (39K VIETQR) */}
      <Modal visible={sosModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.sosCard}>
            <Text style={styles.sosModalTitle}>🚨 PHÁT BÁO ĐỘNG SOS TÌM BOSS LẠC</Text>
            <Text style={styles.sosModalSub}>
              Bắn thông báo khẩn cấp tới hàng nghìn cư dân nuôi thú cưng trong bán kính 3km
            </Text>

            <View style={styles.qrBox}>
              <Image
                source={{
                  uri: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PAWTY_SOS_39K_MBBANK_0908123456888',
                }}
                style={styles.qrImage}
              />
              <Text style={styles.qrAmount}>Phí phát sóng: 39.000 VNĐ</Text>
              <Text style={styles.qrBank}>MBBank • STK: 0908123456888</Text>
            </View>

            <TouchableOpacity
              style={styles.confirmSosButton}
              onPress={() => {
                Alert.alert(
                  'Kích hoạt SOS thành công!',
                  'Còi báo động đã phát tán tới toàn bộ khu chung cư trong bán kính 3km!',
                );
                setSosModalVisible(false);
              }}
            >
              <Text style={styles.confirmSosText}>Xác nhận thanh toán VietQR</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSosModalVisible(false)}>
              <Text style={styles.cancelText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: GÓI SEN VIP (49K/THÁNG VIETQR) */}
      <Modal visible={vipModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.vipCard}>
            <Text style={styles.vipModalTitle}>👑 GÓI SEN VIP ĐẶC QUYỀN</Text>
            <Text style={styles.vipModalSub}>Quẹt thẻ không giới hạn • Ưu tiên hiển thị x3</Text>

            <View style={styles.vipBenefitList}>
              <Text style={styles.vipBenefitItem}>✨ Quẹt tìm bạn không giới hạn lượt mỗi ngày</Text>
              <Text style={styles.vipBenefitItem}>✨ Huy hiệu Vương miện vàng VIP danh giá</Text>
              <Text style={styles.vipBenefitItem}>✨ Kho ảnh bựa không giới hạn dung lượng</Text>
            </View>

            <View style={styles.qrBox}>
              <Image
                source={{
                  uri: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PAWTY_VIP_49K_MBBANK_0908123456888',
                }}
                style={styles.qrImage}
              />
              <Text style={styles.qrAmount}>Chỉ 49.000 VNĐ / Tháng</Text>
            </View>

            <TouchableOpacity
              style={styles.confirmVipButton}
              onPress={() => {
                setIsVip(true);
                Alert.alert('Chúc mừng!', 'Bạn đã nâng cấp thành công Gói Sen VIP!');
                setVipModalVisible(false);
              }}
            >
              <Text style={styles.confirmVipText}>Xác nhận thanh toán VietQR</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setVipModalVisible(false)}>
              <Text style={styles.cancelText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 34,
    height: 34,
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.coral,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosButton: {
    backgroundColor: COLORS.coralLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.coral,
  },
  sosButtonText: {
    color: COLORS.coralDark,
    fontWeight: '700',
    fontSize: 12,
  },
  vipBadge: {
    backgroundColor: COLORS.goldLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  vipActiveBadge: {
    backgroundColor: COLORS.gold,
  },
  vipBadgeText: {
    color: '#92400E',
    fontWeight: '700',
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  radarContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  filterChipActive: {
    backgroundColor: COLORS.coral,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipActiveText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
  filterChip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipText: {
    color: COLORS.textDark,
    fontSize: 12,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgeRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distanceBadge: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  distanceBadgeText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
  safeBadge: {
    backgroundColor: COLORS.mint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  safeBadgeText: {
    color: '#065F46',
    fontWeight: '800',
    fontSize: 12,
  },
  cardInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  petName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  petBreed: {
    fontSize: 14,
    color: '#CBD5E0',
    fontWeight: '600',
  },
  condoText: {
    color: '#E2E8F0',
    fontSize: 13,
    marginTop: 4,
  },
  petBio: {
    color: COLORS.white,
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tagChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 14,
  },
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passButtonText: {
    fontSize: 26,
    color: '#A0AEC0',
    fontWeight: '700',
  },
  swipeQuotaBox: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  swipeQuotaText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  likeButtonText: {
    fontSize: 28,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  tabLabelActive: {
    color: COLORS.coral,
    fontWeight: '800',
  },
  momentsContainer: {
    flex: 1,
    padding: 16,
  },
  momentsHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  momentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  momentImage: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  momentBody: {
    padding: 12,
  },
  momentCaption: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 20,
  },
  likeMomentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  likeMomentHeart: {
    fontSize: 18,
  },
  likeMomentCount: {
    fontSize: 13,
    color: COLORS.coralDark,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  chatRoomItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  chatAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  chatDetails: {
    flex: 1,
  },
  chatTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatPartnerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  chatTime: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  chatLastMessage: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  chatAppointmentBadge: {
    backgroundColor: COLORS.mintLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  chatAppointmentText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '700',
  },
  roomContainer: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  roomBackText: {
    fontSize: 14,
    color: COLORS.coral,
    fontWeight: '700',
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  roomMessages: {
    flex: 1,
    padding: 14,
  },
  appointmentCard: {
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.mint,
    marginBottom: 16,
  },
  appointmentTag: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.coral,
    marginBottom: 4,
  },
  appointmentPlace: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  appointmentTime: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginVertical: 4,
  },
  appointmentNote: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.mint,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#065F46',
    fontWeight: '800',
    fontSize: 13,
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#EDF2F7',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  declineButtonText: {
    color: COLORS.textMuted,
    fontWeight: '700',
    fontSize: 13,
  },
  bubbleOther: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    maxWidth: '80%',
    marginBottom: 10,
  },
  bubbleOtherText: {
    color: COLORS.textDark,
    fontSize: 14,
  },
  bubbleMe: {
    backgroundColor: COLORS.coral,
    padding: 12,
    borderRadius: 16,
    alignSelf: 'flex-end',
    maxWidth: '80%',
    marginBottom: 10,
  },
  bubbleMeText: {
    color: COLORS.white,
    fontSize: 14,
  },
  bubbleTime: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeWhite: {
    fontSize: 10,
    color: '#FFEAE8',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  roomInputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  roomInput: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    color: COLORS.textDark,
  },
  sendButton: {
    backgroundColor: COLORS.coral,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: COLORS.white,
    fontWeight: '800',
  },
  profileContainer: {
    flex: 1,
  },
  profileHeaderCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: COLORS.coral,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 10,
  },
  profileBreed: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  profileCondo: {
    fontSize: 13,
    color: COLORS.coralDark,
    fontWeight: '600',
    marginTop: 2,
  },
  profileBio: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  subTabRow: {
    flexDirection: 'row',
    marginTop: 16,
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#EDF2F7',
    padding: 4,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  subTabBtnActive: {
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  subTabBtnText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  subTabBtnTextActive: {
    color: COLORS.coral,
    fontWeight: '800',
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
  },
  gridImage: {
    width: width / 3 - 3,
    height: width / 3 - 3,
    margin: 1.5,
  },
  healthPassportCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.mint,
  },
  vaccineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vaccineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  verifiedBadge: {
    backgroundColor: COLORS.mintLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedBadgeText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '700',
  },
  vaccineDetail: {
    fontSize: 13,
    color: COLORS.textDark,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  habitSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.coralDark,
    marginBottom: 8,
  },
  habitBoxGood: {
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  habitGoodText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '600',
  },
  habitBoxBad: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
  },
  habitBadText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  matchCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  matchHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.coral,
    textAlign: 'center',
  },
  matchSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  matchAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    gap: 16,
  },
  matchAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.coral,
  },
  matchHeartIcon: {
    fontSize: 30,
  },
  matchChatButton: {
    backgroundColor: COLORS.coral,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
  },
  matchChatButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },
  matchCloseButton: {
    marginTop: 12,
  },
  matchCloseText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  sosCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  sosModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.danger,
    textAlign: 'center',
  },
  sosModalSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  qrBox: {
    alignItems: 'center',
    marginVertical: 14,
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 16,
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  qrAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.coral,
    marginTop: 8,
  },
  qrBank: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  confirmSosButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: 12,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  confirmSosText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
  vipCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  vipModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D97706',
    textAlign: 'center',
  },
  vipModalSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  vipBenefitList: {
    marginVertical: 10,
    width: '100%',
  },
  vipBenefitItem: {
    fontSize: 13,
    color: COLORS.textDark,
    marginVertical: 3,
  },
  confirmVipButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 12,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  confirmVipText: {
    color: '#78350F',
    fontWeight: '800',
    fontSize: 14,
  },
  cancelText: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 12,
  },
});
