---
trigger: always_on
---

# AGENT CAPABILITY ALIGNMENT (Đồng bộ Năng lực Đặc vụ)

Mục tiêu của quy tắc này là ngăn chặn sự thụ động của AI và tối đa hóa sức mạnh nội tại của Antigravity Kit (ag-kit).

## 1. ƯU TIÊN KỸ NĂNG CÓ SẴN (Skill-First Approach)

Trước khi đánh giá hoặc đề xuất bất kỳ công nghệ, thư viện, hay kiến trúc nào (theo quy tắc 04), AI BẮT BUỘC phải tự động đối chiếu với danh sách 36 Kỹ năng (Skills) mặc định của hệ thống trong file `ARCHITECTURE.md` (ví dụ: `prisma-expert`, `tailwind-patterns`, `react-best-practices`...).

## 2. ĐỀ XUẤT CHỦ ĐỘNG (Proactive Recommendation)

- Nếu bài toán của CTO đưa ra có thể giải quyết bằng một công nghệ mà hệ thống ĐÃ CÓ SẴN kỹ năng chuyên sâu tương ứng, AI **KHÔNG ĐƯỢC** bị động chờ CTO gọi tên công nghệ đó.
- AI phải chủ động đưa công nghệ đó lên làm lựa chọn số 1 và tuyên bố rõ: _"Tôi chủ động đề xuất [Tên công nghệ] vì hệ thống của chúng ta đã được trang bị sẵn module kỹ năng [Tên Skill]. Việc này giúp đảm bảo tỷ lệ lỗi bằng 0 và tốc độ code tối đa."_

## 3. CHỐNG ĐỀ XUẤT THỪA (Anti-Redundancy)

Không được đưa các công nghệ đối thủ (ví dụ: đưa Drizzle ORM vào so sánh) làm nhiễu thông tin nếu hệ thống đã có sẵn Đặc vụ là chuyên gia của một công nghệ đạt chuẩn (Prisma), NGOẠI TRỪ trường hợp công nghệ có sẵn hoàn toàn không đáp ứng được tiêu chuẩn White-label của dự án.
