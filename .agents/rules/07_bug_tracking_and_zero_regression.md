<!-- RULE START: 07_bug_tracking_and_zero_regression.md -->
---
trigger: always_on
description: BUG TRACKING & ZERO REGRESSION PROTOCOL (Nghị định Theo dõi Lỗi & Chống Tái Hiện Lỗi Cũ)
---

# BUG TRACKING & ZERO REGRESSION PROTOCOL (Theo Dõi Bug & Chống Tái Hiện Lỗi)

Để đảm bảo độ ổn định tối đa của hệ thống và sự nhất quán qua từng phiên làm việc, AI bắt buộc phải tuân thủ nghiêm ngặt quy trình 3 bước sau mỗi khi Người Dùng (CTO) liệt kê danh sách lỗi/bug:

## 1. GHI NHẬN VÀ ĐÁNH SỐ THỨ TỰ TOÀN BỘ BUG (Bug Indexing)
- Sau mỗi prompt của CTO có liệt kê lỗi, AI **bắt buộc phải ghi nhận lại danh sách lỗi**, phân loại rõ ràng và đánh số thứ tự minh bạch (`[BUG #1]`, `[BUG #2]`, ...).
- Tuyệt đối không được bỏ sót bất kỳ một gạch đầu dòng nào của CTO.

## 2. NGUYÊN TẮC KHÔNG TÁI HIỆN LỖI CŨ (Zero Regression Principle)
- Khi sửa bất kỳ bug mới nào hoặc thêm tính năng mới, AI **tuyệt đối không được làm ảnh hưởng tiêu cực (regression)** đến các logic đã được giải quyết ở các phiên trước:
  1. **Không làm gãy luồng 100% Database PostgreSQL** (không tự ý quay lại mock data).
  2. **Không làm gãy cơ chế tách biệt 2 phân hệ chat** (Chat Mạng xã hội tự do vs Chat Hẹn hò cô lập danh tính).
  3. **Không làm gãy luồng Hủy tương hợp (Bỏ Match)** xóa sạch 100% tin nhắn DB và loại trừ vĩnh viễn khỏi Tinder.
  4. **Không làm gãy cơ chế cọc thẻ vô tận & tự động làm mới** của Tinder.
  5. **Không làm gãy luồng upload media lên Cloudinary** và chỉ lưu đường link vào PostgreSQL.
  6. **Không làm gãy giao diện Selector-First** đã chuẩn hóa trên toàn bộ ứng dụng.

## 3. BÁO CÁO NGHIỆM THU ĐỐI SOÁT (Verification & Proof)
- Trong phản hồi cuối cùng tới CTO, AI bắt buộc phải có mục **Bảng Đối Soát Nghiệm Thu Bug**:
  - Từng `[BUG #...]` được giải quyết ra sao.
  - Vị trí tệp tin mã nguồn và hàm đã chỉnh sửa.
  - Khẳng định và cam kết toàn bộ các tính năng trước đó vẫn hoạt động ổn định 100%.
<!-- RULE END: 07_bug_tracking_and_zero_regression.md -->

