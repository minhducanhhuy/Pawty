import React from 'react';
import { useApp } from '../../context/AppContext';
import { RadarFilterOptions } from '../../types';
import { SlidersHorizontal, Check, ShieldCheck, X } from 'lucide-react';

interface RadarFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RadarFilterModal: React.FC<RadarFilterModalProps> = ({ isOpen, onClose }) => {
  const { radarFilter, setRadarFilter } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl border border-slate-200/80 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#A3E4D7]/20 text-slate-800">
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-fredoka text-base font-bold text-slate-900">Bộ Lọc Radar An Toàn</h3>
              <p className="text-[11px] text-slate-500">Tìm bạn đi dạo phù hợp với Boss</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-5">
          {/* Radius Slider (500m - 3000m) */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-700">Bán kính quét PostGIS</span>
              <span className="text-[#FF6F61] font-mono text-sm">
                {(radarFilter.radiusMeters / 1000).toFixed(1)} km ({radarFilter.radiusMeters}m)
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={3000}
              step={250}
              value={radarFilter.radiusMeters}
              onChange={(e) =>
                setRadarFilter((prev) => ({ ...prev, radiusMeters: Number(e.target.value) }))
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF6F61]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>500m (Nội khu)</span>
              <span>1.5km</span>
              <span>3.0km (Bán kính tối đa)</span>
            </div>
          </div>

          {/* Species */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Loài thú cưng</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'Tất cả 🐾' },
                { id: 'dog', label: 'Chó 🐶' },
                { id: 'cat', label: 'Mèo 🐱' },
              ].map((sp) => {
                const isSelected = radarFilter.species === sp.id;
                return (
                  <button
                    key={sp.id}
                    onClick={() =>
                      setRadarFilter((prev) => ({ ...prev, species: sp.id as any }))
                    }
                    className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-[#FF6F61] border-[#FF6F61] text-white shadow-sm shadow-[#FF6F61]/25'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {sp.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Kích thước Boss</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'small', label: 'Nhỏ <5kg' },
                { id: 'medium', label: 'Vừa 5-15kg' },
                { id: 'large', label: 'Lớn >15kg' },
              ].map((sz) => {
                const isSelected = radarFilter.size === sz.id;
                return (
                  <button
                    key={sz.id}
                    onClick={() =>
                      setRadarFilter((prev) => ({ ...prev, size: sz.id as any }))
                    }
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all border text-center ${
                      isSelected
                        ? 'bg-[#A3E4D7] border-[#48C4B0] text-emerald-950 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {sz.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Safe Check Verified Only */}
          <div
            onClick={() =>
              setRadarFilter((prev) => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))
            }
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              radarFilter.verifiedOnly
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className={`w-5 h-5 ${radarFilter.verifiedOnly ? 'text-emerald-600' : 'text-slate-400'}`} />
              <div>
                <p className="text-xs font-bold">Chỉ Boss đã tiêm phòng đủ mũi</p>
                <p className="text-[10px] text-slate-500">Lọc bỏ thú cưng chưa có sổ chích ngừa</p>
              </div>
            </div>
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                radarFilter.verifiedOnly
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {radarFilter.verifiedOnly && <Check className="w-3.5 h-3.5" />}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF6F61] to-[#E85B4E] text-white font-fredoka font-bold text-sm shadow-md shadow-[#FF6F61]/25 active:scale-95 transition-all"
        >
          Áp Dụng Bộ Lọc
        </button>
      </div>
    </div>
  );
};
