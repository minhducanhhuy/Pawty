import { useState, type FormEvent } from 'react';
import { Store } from 'lucide-react';
import { getFriendlyErrorMessage } from '../../shared/api/apiError';
import { Button } from '../../shared/ui/Button';
import { SelectField, TextField } from '../../shared/ui/fields';
import { useToast } from '../../shared/ui/Toast';
import type { PartnerCategory } from '../api/partnerTypes';
import { usePartnerAuth } from '../auth/PartnerAuthContext';

interface PartnerRegisterFormProps {
  onSuccessSwitchToLogin: (email: string) => void;
}

const CATEGORY_OPTIONS: Array<{ value: PartnerCategory; label: string }> = [
  { value: 'spa', label: 'Pet Spa & Grooming' },
  { value: 'cafe', label: 'Pet Cafe & Bakery' },
  { value: 'vet', label: 'Phòng khám Thú y (Vet)' },
  { value: 'shop', label: 'Pet Shop & Thức ăn tươi' },
  { value: 'hotel', label: 'Khách sạn Thú cưng' },
  { value: 'park', label: 'Khu vui chơi Pet-Friendly' },
];

export function PartnerRegisterForm({ onSuccessSwitchToLogin }: PartnerRegisterFormProps) {
  const { register } = usePartnerAuth();
  const toast = useToast();
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState<PartnerCategory>('spa');
  const [contactEmail, setContactEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Vinhomes Central Park, Bình Thạnh, TP.HCM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (formEvent: FormEvent) => {
    formEvent.preventDefault();
    if (!businessName.trim() || !contactEmail.trim() || !password.trim() || !phone.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await register({
        businessName: businessName.trim(),
        category,
        contactEmail: contactEmail.trim(),
        password,
        phone: phone.trim(),
        address: address.trim(),
        lat: 10.7942,
        lng: 106.7215,
      });
      toast.showSuccess('Đăng ký thành công! Hồ sơ đang ở trạng thái chờ Admin xét duyệt (pending).');
      onSuccessSwitchToLogin(contactEmail.trim());
    } catch (registerError) {
      console.error('[PartnerRegister] lỗi đăng ký', registerError);
      setErrorMessage(getFriendlyErrorMessage(registerError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-3.5">
      <TextField
        label="Tên thương hiệu / Cửa hàng"
        placeholder="VD: Bơ Pet Spa & Studio"
        value={businessName}
        onChange={(event) => setBusinessName(event.target.value)}
      />
      <SelectField
        label="Danh mục kinh doanh"
        value={category}
        onChange={(event) => setCategory(event.target.value as PartnerCategory)}
        options={CATEGORY_OPTIONS}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          type="email"
          label="Email đăng nhập"
          placeholder="hello@bopetspa.vn"
          value={contactEmail}
          onChange={(event) => setContactEmail(event.target.value)}
        />
        <TextField
          label="Số điện thoại liên hệ"
          placeholder="0908123456"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </div>
      <TextField
        type="password"
        label="Mật khẩu"
        placeholder="Tối thiểu 6 ký tự"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <TextField
        label="Địa chỉ cửa hàng (định vị bán kính Radar)"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
        errorMessage={errorMessage ?? undefined}
      />
      <Button type="submit" className="w-full" isLoading={isSubmitting} leadingIcon={<Store className="h-4 w-4" />}>
        Gửi hồ sơ đăng ký Đối tác
      </Button>
    </form>
  );
}
