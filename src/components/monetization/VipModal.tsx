import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Crown,
  Sparkles,
  Check,
  Zap,
  Infinity,
  Image as ImageIcon,
  RotateCcw,
  ShieldCheck,
  X,
  QrCode
} from 'lucide-react';

interface VipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VipModal: React.FC<VipModalProps> = ({ isOpen, onClose }) => {
  const { user, upgradeToVip } = useApp();

  const [selectedPlan, setSelectedPlan] = useState<'month' | 'year'>('month');
  const [showQrSimulation, setShowQrSimulation] = useState(false);

  if (!isOpen) return null;

  const PERKS = [
    {
      icon: Infinity,
      title: 'Quẹt Radar Không Giới Hạn',
      desc: 'Bỏ qua giới hạn 20 lượt quẹt/ngày, thoải mái tìm bạn cho Boss.',
    },
    {
      icon: ImageIcon,
      title: 'Kho Ảnh Bựa Không Giới Hạn',
      desc: 'Lưu giữ trọn vẹn mọi khoảnh khắc hài hước không lo hết dung lượng cloud.',
    },
    {
      icon: Crown,
      title: 'Huy Hiệu Vương Miện Vàng',
      desc: 'Tăng độ uy tín và nổi bật hàng đầu trong mắt các Sen nội khu.',
    },
    {
      icon: Zap,
      title: 'Tăng 300% Tỷ Lệ Hiển Thị',
      desc: 'Hồ sơ Boss luôn được ưu tiên xuất hiện đầu tiên trên Radar chung cư.',
    },
    {
      icon: RotateCcw,
      title: 'Tua Lại Thẻ Vô Hạn',
      desc: 'Không bao giờ lo lỡ tay quẹt nhầm thẻ Boss ưng ý.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-[#1C2029] via-[#14161D] to-black rounded-[36px] p-6 shadow-2xl border-2 border-amber-500/50 text-white max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="relative">
              <img
                src="/assets/pawty-icon.png"
                alt="Pawty"
                className="w-9 h-9 rounded-xl object-cover shadow-md border border-amber-400/40"
              />
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center">
                <Crown className="w-2.5 h-2.5 fill-current" />
              </div>
            </div>
            <div>
              <h3 className="font-fredoka text-lg font-bold text-amber-300">
                Gói Nâng Cấp VIP Sen & Boss
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">Biên lợi nhuận 85% • Pawty Club</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!showQrSimulation ? (
          <div className="space-y-4 py-3">
            {/* Pricing Selector */}
            <div className="grid grid-cols-2 gap-2">
              {/* Monthly */}
              <div
                onClick={() => setSelectedPlan('month')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                  selectedPlan === 'month'
                    ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <p className="text-[11px] text-slate-400 font-medium">Gói 1 Tháng</p>
                <p className="text-base font-black text-amber-300 font-fredoka mt-0.5">
                  49.000đ <span className="text-[10px] text-slate-400 font-normal">/tháng</span>
                </p>
              </div>

              {/* Yearly */}
              <div
                onClick={() => setSelectedPlan('year')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                  selectedPlan === 'year'
                    ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold">
                  Tiết kiệm 32%
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Gói 1 Năm</p>
                <p className="text-base font-black text-amber-300 font-fredoka mt-0.5">
                  399.000đ <span className="text-[10px] text-slate-400 font-normal">/năm</span>
                </p>
              </div>
            </div>

            {/* Perks List */}
            <div className="space-y-2.5 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Đặc quyền độc quyền
              </p>
              {PERKS.map((perk, i) => {
                const Icon = perk.icon;
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="p-1 rounded-lg bg-amber-400/20 text-amber-400 shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{perk.title}</h4>
                      <p className="text-[10px] text-slate-400 leading-snug">{perk.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => setShowQrSimulation(true)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-fredoka font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Crown className="w-4 h-4 fill-current" />
                <span>Nâng Cấp VIP ({selectedPlan === 'month' ? '49.000đ' : '399.000đ'})</span>
              </button>

              <button
                onClick={upgradeToVip}
                className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 text-[11px] font-mono font-medium"
              >
                ⚡ Kích hoạt nhanh 1-Click (Demo Mode)
              </button>
            </div>
          </div>
        ) : (
          /* QR Payment Simulation Screen */
          <div className="space-y-4 py-3 text-center">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300">
              <p className="font-bold">Mã VietQR Động Kích Hoạt Gói VIP</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Số tiền: <strong>{selectedPlan === 'month' ? '49.000 VNĐ' : '399.000 VNĐ'}</strong>
              </p>
            </div>

            {/* QR Mock */}
            <div className="inline-block p-4 bg-white rounded-3xl border-2 border-amber-400 shadow-2xl relative mx-auto">
              <div className="w-44 h-44 bg-slate-950 rounded-2xl flex flex-col items-center justify-center p-3 text-white">
                <QrCode className="w-32 h-32 text-slate-900" />
                <span className="text-[9px] font-mono tracking-widest text-[#FF6F61] font-bold mt-1">
                  VIETQR • PAWTY VIP
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Nội dung chuyển khoản: <strong className="text-amber-400 font-mono">PAWTY VIP 0908123456</strong>
            </p>

            <button
              onClick={upgradeToVip}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-fredoka font-bold text-xs shadow-lg shadow-amber-400/30 flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Xác Nhận Đã Chuyển Khoản Thành Công</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
