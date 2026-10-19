import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UploadCloud, Image as ImageIcon, Sparkles } from 'lucide-react';

interface UploadMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadMomentModal: React.FC<UploadMomentModalProps> = ({ isOpen, onClose }) => {
  const { currentPet, addNewMoment, user, setIsVipModalOpen } = useApp();

  const [caption, setCaption] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'
  );
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  // Preset funny pet photos for demo instant selection
  const SAMPLE_PHOTOS = [
    {
      label: 'Ngơ ngác',
      url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Cười tít mắt',
      url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Chạy đua bờ sông',
      url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Mèo lười',
      url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    setIsUploading(true);

    // Simulate Cloudinary/S3 direct upload delay
    setTimeout(() => {
      const success = addNewMoment({
        petId: currentPet.id,
        petName: currentPet.name,
        petAvatar: currentPet.avatarUrl,
        mediaUrl: selectedPhoto,
        mediaType: 'image',
        caption: caption.trim(),
      });

      setIsUploading(false);
      if (success) {
        setCaption('');
        onClose();
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-[32px] p-5 shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#FF6F61]/15 text-[#FF6F61]">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-fredoka text-base font-bold text-slate-900">Đăng Khoảnh Khắc Bựa</h3>
              <p className="text-[10px] text-slate-500">Giả lập tải trực tiếp lên Cloudinary / S3</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-3 space-y-4">
          {/* Photo Preview */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Ảnh khoảnh khắc</label>
            <div className="relative h-44 rounded-2xl overflow-hidden border-2 border-dashed border-[#A3E4D7] bg-[#E8F8F5]/30">
              <img src={selectedPhoto} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-mono backdrop-blur">
                Cloudinary CDN Mock
              </div>
            </div>

            {/* Quick Sample Selector */}
            <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1">
              <span className="text-[10px] text-slate-400 font-bold shrink-0">Chọn nhanh:</span>
              {SAMPLE_PHOTOS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPhoto(item.url)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border shrink-0 transition-colors ${
                    selectedPhoto === item.url
                      ? 'bg-[#FF6F61] text-white border-[#FF6F61]'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Cap dìm hàng Boss <span className="text-slate-400 font-normal">(*bắt buộc)</span>
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="VD: Mặt hờn dỗi khi bị bắt tắm, hay pha trượt chân tại bãi cỏ Landmark..."
              rows={3}
              required
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/30 focus:border-[#FF6F61]"
            />
          </div>

          {/* VIP Cloud Storage Notice */}
          {!user.isVip && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-800 flex items-center justify-between">
              <span>⚠️ Gói Free lưu tối đa 5 khoảnh khắc</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setIsVipModalOpen(true);
                }}
                className="text-[#FF6F61] font-bold hover:underline"
              >
                Mở rộng VIP
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isUploading || !caption.trim()}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF6F61] to-[#E85B4E] text-white font-fredoka font-bold text-xs shadow-md shadow-[#FF6F61]/25 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isUploading ? (
              <span>Đang tải lên Cloudinary...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Chia Sẻ Khoảnh Khắc Ngay</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
