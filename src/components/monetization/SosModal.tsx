import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SosAlert } from '../../types';
import {
  AlertTriangle,
  QrCode,
  MapPin,
  Phone,
  Sparkles,
  X,
  CheckCircle2,
  Copy,
  Radio,
  Clock
} from 'lucide-react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose }) => {
  const { sosAlerts, publishSosAlert, triggerPushNotice } = useApp();

  const [mode, setMode] = useState<'view_list' | 'create_form' | 'vietqr_pay'>('view_list');

  // Form states
  const [petName, setPetName] = useState('Miu Miu');
  const [breed, setBreed] = useState('Mèo Xiêm lai');
  const [lastSeenAddress, setLastSeenAddress] = useState('Sảnh Lễ Tân Landmark 2, ngách hầm B1');
  const [rewardAmountVnd, setRewardAmountVnd] = useState('5.000.000 VNĐ');
  const [contactPhone, setContactPhone] = useState('0912 888 999');
  const [notes, setNotes] = useState('Bé đeo vòng cổ đỏ lục lạc vàng, rất nhát người, vừa trượt xích lúc 16:45.');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setMode('vietqr_pay');
  };

  const handleConfirmPayment = () => {
    publishSosAlert({
      petName,
      species: 'cat',
      breed,
      petPhotoUrl: 'https://images.unsplash.com/photo-1513360309081-38f076278f19?auto=format&fit=crop&w=600&q=80',
      lastSeenAddress,
      radiusKm: 3,
      rewardAmountVnd,
      contactPhone,
      notes,
    });
    setMode('view_list');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-[32px] p-5 shadow-2xl border-2 border-red-200 max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="relative">
              <img
                src="/assets/pawty-icon.png"
                alt="Pawty"
                className="w-9 h-9 rounded-xl object-cover shadow-sm border border-red-200"
              />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 ring-2 ring-white animate-ping" />
            </div>
            <div>
              <h3 className="font-fredoka text-base font-bold text-slate-900">
                🚨 SOS Tìm Boss Lạc Khẩn Cấp
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">Bán kính quét PostGIS 3km</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode 1: List Active SOS Alerts */}
        {mode === 'view_list' && (
          <div className="space-y-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-red-500 animate-ping" />
                <span>Báo động đang kích hoạt ({sosAlerts.length})</span>
              </span>
              <button
                onClick={() => setMode('create_form')}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold font-fredoka shadow-sm shadow-red-600/30 transition-transform active:scale-95"
              >
                + Phát Tin SOS Mới (39k)
              </button>
            </div>

            {/* List */}
            <div className="space-y-3">
              {sosAlerts.map((sos) => (
                <div
                  key={sos.id}
                  className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200 space-y-2 text-slate-800 shadow-2xs"
                >
                  <div className="flex gap-3">
                    <img
                      src={sos.petPhotoUrl}
                      alt={sos.petName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-red-300 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-fredoka text-sm font-black text-red-600">
                          {sos.petName} ({sos.breed})
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">{sos.createdAt}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="truncate">{sos.lastSeenAddress}</span>
                      </p>
                      <p className="text-[11px] font-bold text-emerald-800 mt-1">
                        🎁 Hậu tạ: {sos.rewardAmountVnd}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-700 italic bg-white/80 p-2 rounded-xl border border-red-100">
                    "{sos.notes}"
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">
                      Bán kính thông báo: <strong>{sos.radiusKm}km</strong>
                    </span>
                    <a
                      href={`tel:${sos.contactPhone}`}
                      className="px-3 py-1 rounded-xl bg-red-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Gọi ngay: {sos.contactPhone.split(' ')[0]}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Mode 2: Create Form */}
        {mode === 'create_form' && (
          <form onSubmit={handleStartPayment} className="space-y-3 py-2">
            <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              💡 <strong>Biên lợi nhuận 90%:</strong> Phí phát tin khẩn cấp <strong>39.000 VNĐ</strong>. Hệ thống sẽ bắn Push Notification rung chuông tức thì tới toàn bộ tài khoản Pawty trong bán kính 3km!
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tên Boss</label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nơi nhìn thấy lần cuối</label>
              <input
                type="text"
                value={lastSeenAddress}
                onChange={(e) => setLastSeenAddress(e.target.value)}
                placeholder="VD: Sảnh Landmark 2, ngách hầm B1"
                required
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tiền hậu tạ</label>
                <input
                  type="text"
                  value={rewardAmountVnd}
                  onChange={(e) => setRewardAmountVnd(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Số điện thoại liên hệ</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Đặc điểm nhận dạng</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMode('view_list')}
                className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Quay lại
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-fredoka font-bold text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
              >
                <span>Thanh Toán 39.000đ Bằng VietQR</span>
                <span>→</span>
              </button>
            </div>
          </form>
        )}

        {/* View Mode 3: Dynamic VietQR Payment Simulation */}
        {mode === 'vietqr_pay' && (
          <div className="space-y-4 py-2 text-center">
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900">
              <p className="font-bold">Cổng Thanh Toán Mã QR Động (VietQR / PayOS)</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Quét mã để kích hoạt dịch vụ phát thông báo SOS khẩn cấp
              </p>
            </div>

            {/* Simulated VietQR Box */}
            <div className="inline-block p-4 bg-white rounded-3xl border-2 border-slate-800 shadow-xl relative mx-auto">
              <div className="w-48 h-48 bg-slate-900 rounded-2xl flex flex-col items-center justify-center p-3 text-white relative overflow-hidden">
                {/* Simulated QR Code Graphic */}
                <QrCode className="w-36 h-36 text-white" />
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent pointer-events-none" />
                <span className="text-[10px] font-mono tracking-widest text-[#A3E4D7] mt-1 font-bold">
                  VIETQR • 39,000 VND
                </span>
              </div>

              <div className="mt-3 text-left space-y-1 text-slate-800 text-[11px]">
                <p>
                  Ngân hàng: <strong>MBBank (Quân Đội)</strong>
                </p>
                <div className="flex items-center justify-between">
                  <p>
                    Số tài khoản: <strong className="font-mono">9999 8888 7777</strong>
                  </p>
                  <button
                    onClick={() => {
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="text-[#FF6F61] text-[10px] font-bold flex items-center gap-0.5"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{isCopied ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
                <p>
                  Nội dung CK: <strong className="text-red-600 font-mono">PAWTY SOS 39K</strong>
                </p>
              </div>
            </div>

            {/* Confirm Payment Button */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleConfirmPayment}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-fredoka font-bold text-xs shadow-lg shadow-red-600/35 flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tôi Đã Chuyển Khoản Thành Công (Xác Nhận)</span>
              </button>

              <button
                onClick={() => setMode('create_form')}
                className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                Quay lại chỉnh sửa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
