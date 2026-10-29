import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMobilePawty } from '../context/MobilePawtyContext';
import { buildMobileVietQrUrl, moderateMobileContent } from '../data/mobileSeedData';
import { PAWTY_COLORS } from '../theme/colors';

export const MobileModals: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    selectedPartnerId,
    activePet,
    partners,
    places,
    bookings,
    updateBookingStatus,
    createPost,
    createCareTask,
    inviteCircleMember,
    createServiceBooking,
    createWalkAppointment,
    upgradeVip,
    createSosAlert,
  } = useMobilePawty();

  // Post / Question state
  const [postText, setPostText] = useState('');
  const [postHashtags, setPostHashtags] = useState('#GoldenRetriever #VinhomesGrandPark');

  // Task state
  const [taskTitle, setTaskTitle] = useState('Cho Boss uống vitamin dưỡng lông');
  const [taskTime, setTaskTime] = useState('18:30');
  const [taskAssignee, setTaskAssignee] = useState('Hùng Lê (Đồng chăm sóc)');

  // Circle invite state
  const [inviteName, setInviteName] = useState('Cô Hạnh (Mẹ chồng)');
  const [inviteRelation, setInviteRelation] = useState('Người hỗ trợ cuối tuần');
  const [inviteRole, setInviteRole] = useState<'co_carer' | 'helper'>('helper');

  // Service booking state
  const [selectedServiceIdx, setSelectedServiceIdx] = useState(0);
  const [bookingDate, setBookingDate] = useState('Chủ Nhật tuần này');
  const [bookingTime, setBookingTime] = useState('09:30');
  const [bookingNotes, setBookingNotes] = useState('Boss đã tiêm đủ 7 bệnh, nhờ Spa sấy mát vừa phải.');

  // Walk scheduler state
  const [selectedMidpointIdx, setSelectedMidpointIdx] = useState(0);
  const [walkTime, setWalkTime] = useState('Chiều nay, 17:45');

  // VIP & SOS state
  const [selectedVipPlan, setSelectedVipPlan] = useState<{
    name: string;
    price: number;
    code: string;
  }>({
    name: 'Sen VIP Tháng (49.000đ)',
    price: 49000,
    code: 'PAWTY SENVIP 49K',
  });
  const [sosAddress, setSosAddress] = useState('Gần Công viên Ánh Sáng Vinhomes Grand Park');
  const [sosReward, setSosReward] = useState('Hậu tạ 2.000.000đ cho người tìm thấy hoặc giữ giúp bé');

  if (!activeModal) return null;

  const liveModeration = moderateMobileContent(postText);
  const currentPartner =
    partners.find((p) => p.id === selectedPartnerId) || partners[0];

  return (
    <Modal
      visible={Boolean(activeModal)}
      animationType="slide"
      transparent
      onRequestClose={() => setActiveModal(null)}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View style={styles.handleBar} />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setActiveModal(null)}
            >
              <Text style={styles.closeBtnText}>✕ Đóng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.sheetBody}>
            {/* 1. CREATE ACTION SHEET (5 Quick Actions) */}
            {activeModal === 'create_sheet' && (
              <View>
                <Text style={styles.modalTitle}>➕ Tạo mới trong Hệ sinh thái Pawty</Text>
                <Text style={styles.modalSub}>
                  Chọn nhanh hành động cho {activePet.name} ({activePet.breed})
                </Text>

                <TouchableOpacity
                  style={styles.sheetActionBtn}
                  onPress={() => setActiveModal('new_moment')}
                >
                  <Text style={styles.sheetActionEmoji}>📸</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetActionTitle}>Đăng Khoảnh khắc / Mẹo chăm Boss</Text>
                    <Text style={styles.sheetActionDesc}>
                      Chia sẻ lên Bảng tin PawRank kèm kiểm duyệt 4 lớp tự động
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetActionBtn}
                  onPress={() => setActiveModal('new_task')}
                >
                  <Text style={styles.sheetActionEmoji}>📋</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetActionTitle}>Tạo Việc chăm sóc (Pawty Care)</Text>
                    <Text style={styles.sheetActionDesc}>
                      Giao việc cho ăn, dắt dạo, uống thuốc trong Vòng chăm sóc
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetActionBtn}
                  onPress={() => setActiveModal('invite_circle')}
                >
                  <Text style={styles.sheetActionEmoji}>🤝</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetActionTitle}>Mời thành viên Vòng chăm sóc (Circle)</Text>
                    <Text style={styles.sheetActionDesc}>
                      Cấp mã mời & phân quyền Đồng chăm sóc / Người hỗ trợ
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetActionBtn}
                  onPress={() => setActiveModal('book_service', 'partner-1')}
                >
                  <Text style={styles.sheetActionEmoji}>📅</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetActionTitle}>Đặt lịch Grooming / Khám Thú Y</Text>
                    <Text style={styles.sheetActionDesc}>
                      Đặt lịch 4 bước tại đối tác xác minh Pawty Services
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetActionBtn}
                  onPress={() => setActiveModal('new_question')}
                >
                  <Text style={styles.sheetActionEmoji}>❓</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetActionTitle}>Đặt câu hỏi cho Bác sĩ Thú y (Q&A)</Text>
                    <Text style={styles.sheetActionDesc}>
                      Tự động đính kèm lưu ý y khoa ⚕️ và ưu tiên chuyên gia trả lời
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* 2. NEW MOMENT / QUESTION COMPOSER */}
            {(activeModal === 'new_moment' || activeModal === 'new_question') && (
              <View>
                <Text style={styles.modalTitle}>
                  {activeModal === 'new_question'
                    ? '❓ Đặt Câu Hỏi Sức Khỏe / Huấn Luyện'
                    : '📸 Đăng Khoảnh Khắc Của Boss'}
                </Text>
                <Text style={styles.modalSub}>
                  Hệ thống Kiểm duyệt 4 lớp tự động chặn mua bán thú cưng/kê đơn thuốc và gắn nhãn ⚕️ khi có từ khóa sức khỏe.
                </Text>

                <Text style={styles.label}>Nội dung chia sẻ</Text>
                <TextInput
                  style={[styles.input, { minHeight: 96, textAlignVertical: 'top' }]}
                  multiline
                  placeholder="Chia sẻ khoảnh khắc đáng yêu hoặc triệu chứng cần hỏi Bác sĩ thú y (VD: Boss hơi bỏ ăn khi trời nắng)..."
                  value={postText}
                  onChangeText={setPostText}
                />

                {!liveModeration.allowed && (
                  <View style={styles.dangerBox}>
                    <Text style={styles.dangerText}>🛡️ {liveModeration.reason}</Text>
                  </View>
                )}

                {liveModeration.allowed && liveModeration.hasHealthDisclaimer && (
                  <View style={styles.mintBox}>
                    <Text style={styles.mintBoxText}>
                      ⚕️ Phát hiện từ khóa sức khỏe: Bài viết sẽ tự động đính kèm khuyến cáo tham khảo Bác sĩ thú y.
                    </Text>
                  </View>
                )}

                <Text style={styles.label}>Hashtags</Text>
                <TextInput
                  style={styles.input}
                  value={postHashtags}
                  onChangeText={setPostHashtags}
                />

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    const ok = createPost(
                      activeModal === 'new_question' ? 'question' : 'moment',
                      postText || `Khoảnh khắc chiều nay của ${activePet.name} tại công viên nội khu! 🐾`,
                      postHashtags.split(/\s+/).filter(Boolean)
                    );
                    if (ok) {
                      setPostText('');
                    }
                  }}
                >
                  <Text style={styles.primaryBtnText}>Đăng ngay lên Pawty Feed 🚀</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 3. CREATE CARE TASK MODAL */}
            {activeModal === 'new_task' && (
              <View>
                <Text style={styles.modalTitle}>📋 Tạo Việc Chăm Sóc Mới</Text>
                <Text style={styles.label}>Tên công việc</Text>
                <TextInput style={styles.input} value={taskTitle} onChangeText={setTaskTitle} />

                <Text style={styles.label}>Giờ nhắc việc</Text>
                <TextInput style={styles.input} value={taskTime} onChangeText={setTaskTime} />

                <Text style={styles.label}>Người phụ trách trong Circle</Text>
                <TextInput
                  style={styles.input}
                  value={taskAssignee}
                  onChangeText={setTaskAssignee}
                />

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => createCareTask(taskTitle, 'feeding', taskTime, taskAssignee)}
                >
                  <Text style={styles.primaryBtnText}>Lưu & Nhắc lịch cho Circle ✓</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 4. INVITE CIRCLE MEMBER MODAL */}
            {activeModal === 'invite_circle' && (
              <View>
                <Text style={styles.modalTitle}>🤝 Mời Thành Viên Vào Pawty Circle</Text>
                <Text style={styles.modalSub}>
                  Phân quyền RBAC giúp cả gia đình hoặc hàng xóm cùng chăm Boss mà không sợ trùng việc.
                </Text>

                <Text style={styles.label}>Tên người thân / bạn bè</Text>
                <TextInput style={styles.input} value={inviteName} onChangeText={setInviteName} />

                <Text style={styles.label}>Mối quan hệ (VD: Chồng, Em gái, Hàng xóm)</Text>
                <TextInput
                  style={styles.input}
                  value={inviteRelation}
                  onChangeText={setInviteRelation}
                />

                <Text style={styles.label}>Vai trò phân quyền (RBAC)</Text>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.choiceBtn, inviteRole === 'co_carer' && styles.choiceBtnActive]}
                    onPress={() => setInviteRole('co_carer')}
                  >
                    <Text style={styles.choiceText}>Đồng chăm sóc (Co-Carer)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.choiceBtn, inviteRole === 'helper' && styles.choiceBtnActive]}
                    onPress={() => setInviteRole('helper')}
                  >
                    <Text style={styles.choiceText}>Người hỗ trợ (Helper)</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => inviteCircleMember(inviteName, inviteRelation, inviteRole)}
                >
                  <Text style={styles.primaryBtnText}>Tạo Mã Mời & Thêm vào Circle 🎉</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 5. 4-STEP SERVICE BOOKING MODAL */}
            {activeModal === 'book_service' && (
              <View>
                <Text style={styles.modalTitle}>📅 Đặt Lịch Dịch Vụ (4 Bước)</Text>
                <Text style={styles.modalSub}>
                  Đối tác xác minh: {currentPartner.businessName} (Hoa hồng nền tảng 12% tự động tính cho đối tác)
                </Text>

                <Text style={styles.label}>Bước 1: Chọn gói dịch vụ cho {activePet.name}</Text>
                {currentPartner.services.map((srv, idx) => (
                  <TouchableOpacity
                    key={srv.id}
                    style={[
                      styles.optionCard,
                      selectedServiceIdx === idx && styles.optionCardActive,
                    ]}
                    onPress={() => setSelectedServiceIdx(idx)}
                  >
                    <Text style={styles.optionTitle}>{srv.name}</Text>
                    <Text style={styles.optionSub}>
                      💰 {srv.priceVnd.toLocaleString('vi-VN')}đ · ⏱️ {srv.durationMinutes} phút
                    </Text>
                  </TouchableOpacity>
                ))}

                <Text style={styles.label}>Bước 2: Chọn Ngày & Khung giờ</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={bookingDate}
                    onChangeText={setBookingDate}
                  />
                  <TextInput
                    style={[styles.input, { width: 100 }]}
                    value={bookingTime}
                    onChangeText={setBookingTime}
                  />
                </View>

                <Text style={styles.label}>Bước 3: Ghi chú hành vi tự động từ Hồ sơ Boss</Text>
                <TextInput
                  style={styles.input}
                  value={bookingNotes}
                  onChangeText={setBookingNotes}
                />

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    const srv =
                      currentPartner.services[selectedServiceIdx] ||
                      currentPartner.services[0];
                    createServiceBooking(
                      currentPartner.id,
                      srv.id,
                      bookingDate,
                      bookingTime,
                      bookingNotes
                    );
                  }}
                >
                  <Text style={styles.primaryBtnText}>Bước 4: Xác nhận Đặt lịch hẹn ngay ✓</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 6. MIDPOINT WALK APPOINTMENT SCHEDULER (ST_CENTROID) */}
            {activeModal === 'walk_scheduler' && (
              <View>
                <Text style={styles.modalTitle}>📍 Hẹn Dắt Dạo Trung Điểm (ST_Centroid)</Text>
                <Text style={styles.modalSub}>
                  Thuật toán PostGIS tự động tính điểm chính giữa hai căn hộ và gợi ý 3 địa điểm Pet-Friendly công bằng nhất!
                </Text>

                <Text style={styles.label}>Chọn 1 trong 3 địa điểm Trung điểm đề xuất:</Text>
                {places.map((pl, idx) => (
                  <TouchableOpacity
                    key={pl.id}
                    style={[
                      styles.optionCard,
                      selectedMidpointIdx === idx && styles.optionCardActive,
                    ]}
                    onPress={() => setSelectedMidpointIdx(idx)}
                  >
                    <Text style={styles.optionTitle}>
                      {idx + 1}. {pl.name}
                    </Text>
                    <Text style={styles.optionSub}>
                      📍 Cách trung điểm {pl.distanceMeters}m · ⭐ {pl.rating}
                    </Text>
                  </TouchableOpacity>
                ))}

                <Text style={styles.label}>Khung giờ hẹn dắt dạo</Text>
                <TextInput style={styles.input} value={walkTime} onChangeText={setWalkTime} />

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    const chosen = places[selectedMidpointIdx] || places[0];
                    createWalkAppointment(
                      'Minh Phạm',
                      'Bơ (Corgi)',
                      walkTime,
                      chosen.name
                    );
                  }}
                >
                  <Text style={styles.primaryBtnText}>Gửi Lời Mời Hẹn Dạo Trung Điểm 🐾</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 7. SEN VIP VIETQR MODAL */}
            {activeModal === 'vip_upgrade' && (
              <View>
                <Text style={styles.modalTitle}>👑 Nâng Cấp Gói Sen VIP (VietQR Động)</Text>
                <Text style={styles.modalSub}>
                  Mở khóa không giới hạn số lượng Boss, thành viên Vòng chăm sóc Circle, lượt quẹt Radar và huy hiệu Vương miện vàng.
                </Text>

                {[
                  { name: 'Gói Cơ Bản (29.000đ/tháng)', price: 29000, code: 'PAWTY BASIC 29K' },
                  { name: 'Gói Sen VIP Tháng (49.000đ/tháng)', price: 49000, code: 'PAWTY SENVIP 49K' },
                  { name: 'Gói Sen VIP Năm (399.000đ/năm - Tiết kiệm 32%)', price: 399000, code: 'PAWTY SENVIP 399K' },
                ].map((plan) => (
                  <TouchableOpacity
                    key={plan.code}
                    style={[
                      styles.optionCard,
                      selectedVipPlan.code === plan.code && styles.optionCardActive,
                    ]}
                    onPress={() => setSelectedVipPlan(plan)}
                  >
                    <Text style={styles.optionTitle}>{plan.name}</Text>
                    <Text style={styles.optionSub}>Nội dung CK: {plan.code}</Text>
                  </TouchableOpacity>
                ))}

                <View style={styles.qrContainer}>
                  <Image
                    source={{
                      uri: buildMobileVietQrUrl(selectedVipPlan.price, selectedVipPlan.code),
                    }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.qrCaption}>
                    Quét mã VietQR động ({selectedVipPlan.price.toLocaleString('vi-VN')}đ)
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => upgradeVip(selectedVipPlan.name)}
                >
                  <Text style={styles.primaryBtnText}>
                    Tôi đã chuyển khoản — Kích hoạt Sen VIP ngay 👑
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 8. SOS 3KM VIETQR MODAL */}
            {activeModal === 'sos_alert' && (
              <View>
                <Text style={[styles.modalTitle, { color: PAWTY_COLORS.danger }]}>
                  🚨 Phát Tín Hiệu SOS Tìm Boss Lạc (Bán kính 3km)
                </Text>
                <Text style={styles.modalSub}>
                  Phí kích hoạt 39.000đ qua VietQR — Hệ thống lập tức bắn Push Notification khẩn cấp tới toàn bộ cư dân nuôi thú cưng trong bán kính 3km.
                </Text>

                <Text style={styles.label}>Vị trí nhìn thấy Boss lần cuối</Text>
                <TextInput style={styles.input} value={sosAddress} onChangeText={setSosAddress} />

                <Text style={styles.label}>Lời nhắn & Mức hậu tạ</Text>
                <TextInput style={styles.input} value={sosReward} onChangeText={setSosReward} />

                <View style={styles.qrContainer}>
                  <Image
                    source={{
                      uri: buildMobileVietQrUrl(39000, `PAWTY SOS ${activePet.name.toUpperCase()}`),
                    }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.qrCaption}>VietQR SOS Khẩn Cấp — 39.000đ</Text>
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: PAWTY_COLORS.danger }]}
                  onPress={() => createSosAlert(sosAddress, sosReward)}
                >
                  <Text style={styles.primaryBtnText}>
                    Phát Báo Động Đỏ Bán Kính 3km Ngay 🚨
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 9. PAWTY PRO & NORTH STAR KPI CONSOLE */}
            {activeModal === 'pro_dashboard' && (
              <View>
                <Text style={styles.modalTitle}>🏢 Pawty Pro Partner & North Star KPI</Text>
                <Text style={styles.modalSub}>
                  Bảng điều khiển dành cho Đối tác Dịch vụ (Layer 5) & Quản trị viên.
                </Text>

                <View style={styles.kpiGrid}>
                  <View style={styles.kpiBox}>
                    <Text style={styles.kpiValue}>128</Text>
                    <Text style={styles.kpiLabel}>Active Households</Text>
                  </View>
                  <View style={styles.kpiBox}>
                    <Text style={styles.kpiValue}>46</Text>
                    <Text style={styles.kpiLabel}>North Star Qualified</Text>
                  </View>
                  <View style={styles.kpiBox}>
                    <Text style={styles.kpiValue}>3.12M</Text>
                    <Text style={styles.kpiLabel}>Doanh thu MRR</Text>
                  </View>
                </View>

                <Text style={styles.label}>Quản lý Đơn đặt lịch của Đối tác (12% Hoa hồng):</Text>
                {bookings.map((bk) => (
                  <View key={bk.id} style={styles.optionCard}>
                    <Text style={styles.optionTitle}>{bk.serviceName}</Text>
                    <Text style={styles.optionSub}>
                      🐾 {bk.petName} · ⏰ {bk.bookingTime} ({bk.bookingDate})
                    </Text>
                    <Text style={styles.optionSub}>
                      💰 Giá: {bk.servicePrice.toLocaleString('vi-VN')}đ · Hoa hồng Pawty (12%):{' '}
                      {bk.commissionVnd.toLocaleString('vi-VN')}đ
                    </Text>
                    <View style={[styles.row, { marginTop: 8 }]}>
                      <TouchableOpacity
                        style={styles.smallMintBtn}
                        onPress={() => updateBookingStatus(bk.id, 'completed')}
                      >
                        <Text style={styles.smallMintBtnText}>✓ Hoàn tất dịch vụ</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: PAWTY_COLORS.border,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: PAWTY_COLORS.cream,
  },
  closeBtnText: { fontSize: 12, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  sheetBody: { padding: 18 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: PAWTY_COLORS.charcoal },
  modalSub: { fontSize: 12, color: PAWTY_COLORS.slate, marginTop: 4, marginBottom: 12, lineHeight: 18 },

  sheetActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: PAWTY_COLORS.cream,
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  sheetActionEmoji: { fontSize: 26 },
  sheetActionTitle: { fontSize: 14, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  sheetActionDesc: { fontSize: 11, color: PAWTY_COLORS.slate, marginTop: 2 },

  label: { fontSize: 12, fontWeight: '800', color: PAWTY_COLORS.charcoal, marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: PAWTY_COLORS.cream,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: PAWTY_COLORS.charcoal,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  row: { flexDirection: 'row', gap: 8 },
  choiceBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PAWTY_COLORS.cream,
  },
  choiceBtnActive: {
    backgroundColor: PAWTY_COLORS.mintSoft,
    borderColor: PAWTY_COLORS.mintDark,
  },
  choiceText: { fontSize: 12, fontWeight: '800', color: PAWTY_COLORS.charcoal },

  dangerBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: PAWTY_COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.danger,
  },
  dangerText: { fontSize: 12, fontWeight: '700', color: PAWTY_COLORS.danger },

  mintBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: PAWTY_COLORS.mintSoft,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.mintDark,
  },
  mintBoxText: { fontSize: 12, fontWeight: '700', color: PAWTY_COLORS.mintDark },

  optionCard: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: PAWTY_COLORS.cream,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
    marginBottom: 8,
  },
  optionCardActive: {
    backgroundColor: PAWTY_COLORS.coralSoft,
    borderColor: PAWTY_COLORS.coral,
  },
  optionTitle: { fontSize: 13, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  optionSub: { fontSize: 11, color: PAWTY_COLORS.slate, marginTop: 3 },

  qrContainer: {
    alignItems: 'center',
    backgroundColor: PAWTY_COLORS.cream,
    padding: 14,
    borderRadius: 18,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  qrImage: { width: 210, height: 210, borderRadius: 12 },
  qrCaption: { fontSize: 12, fontWeight: '800', color: PAWTY_COLORS.charcoal, marginTop: 8 },

  kpiGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  kpiBox: {
    flex: 1,
    backgroundColor: PAWTY_COLORS.mintSoft,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  kpiValue: { fontSize: 18, fontWeight: '900', color: PAWTY_COLORS.mintDark },
  kpiLabel: { fontSize: 10, fontWeight: '700', color: PAWTY_COLORS.charcoal, marginTop: 2 },
  smallMintBtn: {
    backgroundColor: PAWTY_COLORS.mintDark,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  smallMintBtnText: { color: '#FFF', fontSize: 11, fontWeight: '800' },

  primaryBtn: {
    marginTop: 16,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: PAWTY_COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
});

