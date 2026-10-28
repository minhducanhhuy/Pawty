import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { ModalSheet, Button, Badge } from '../../components';
import { api } from '../../api/endpoints';
import { useTranslation } from '../../i18n';

export interface QrPaymentData {
  transactionId: string;
  serviceType: string;
  qrCodeUrl: string;
  bankName: string;
  accountNo: string;
  amount: number;
  paymentCode: string;
}

interface VietQrModalProps {
  visible: boolean;
  qrData: QrPaymentData | null;
  onSuccess: () => void;
  onClose: () => void;
}

export const VietQrModal: React.FC<VietQrModalProps> = ({
  visible,
  qrData,
  onSuccess,
  onClose,
}) => {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!visible || !qrData) return;
    const poll = setInterval(async () => {
      try {
        const res = await api.getPaymentStatus(qrData.transactionId);
        if (res.status === 'paid') {
          clearInterval(poll);
          onSuccess();
        }
      } catch {
        // Ignore poll error
      }
    }, 3000);
    return () => clearInterval(poll);
  }, [visible, qrData, onSuccess]);

  if (!qrData) return null;

  const handleSandboxConfirm = async () => {
    setConfirming(true);
    try {
      await api.confirmSandboxPayment(qrData.transactionId, qrData.serviceType);
      onSuccess();
    } finally {
      setConfirming(false);
    }
  };

  return (
    <ModalSheet visible={visible} title="🏦 Quét Mã VietQR Động" onClose={onClose}>
      <View style={styles.container}>
        <Badge text="🔄 Đang tự động kiểm tra giao dịch mỗi 3 giây..." tone="mint" />
        <View style={styles.qrBox}>
          <Image source={{ uri: qrData.qrCodeUrl }} style={styles.qrImg} />
          <Text style={styles.amount}>{qrData.amount.toLocaleString('vi-VN')} VNĐ</Text>
          <Text style={styles.bank}>
            {qrData.bankName} • STK: {qrData.accountNo}
          </Text>
          <View style={styles.codePill}>
            <Text style={styles.codeText}>Nội dung CK: {qrData.paymentCode}</Text>
          </View>
        </View>

        <Button
          title={t('paywall.sandboxConfirm')}
          variant="gold"
          loading={confirming}
          onPress={handleSandboxConfirm}
          style={{ width: '100%' }}
        />
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: SPACING.md },
  qrBox: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
  },
  qrImg: { width: 200, height: 200, marginBottom: SPACING.sm },
  amount: { ...TYPOGRAPHY.h2, color: COLORS.coral },
  bank: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark, marginTop: 2 },
  codePill: {
    backgroundColor: COLORS.creamWarm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  codeText: { ...TYPOGRAPHY.caption, color: COLORS.textDark, fontWeight: '800' },
});
