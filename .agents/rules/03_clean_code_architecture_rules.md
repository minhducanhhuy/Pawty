---
trigger: always_on
---

# CLEAN CODE & MAINTAINABILITY RULES

Mọi đoạn code được sinh ra phải vượt qua các tiêu chuẩn sau trước khi được đề xuất cho CTO:

## 1. NGUYÊN TẮC ĐẶT TÊN (Naming Conventions)

- **Tuyệt đối không dùng tên vô nghĩa:** Không dùng `data1`, `temp`, `handleStuff`.
- **Biến (Variables):** Phải là danh từ mô tả chính xác dữ liệu chứa bên trong (VD: `userProfileSettings`, `activeOrderList`).
- **Hàm (Functions):** Bắt đầu bằng một động từ mạnh, thể hiện rõ hành động (VD: `fetchUserDetails()`, `calculateTotalRevenue()`, `validateInputForm()`).
- **Booleans:** Bắt đầu bằng `is`, `has`, `should` (VD: `isAuthenticated`, `hasError`).

## 2. SINGLE RESPONSIBILITY PRINCIPLE (Nguyên tắc Đơn trách nhiệm)

- Mỗi Function/Component chỉ làm ĐÚNG MỘT VIỆC.
- Nếu một Component UI dài quá 150 dòng hoặc chứa cả logic gọi API phức tạp, AI **bắt buộc** phải chẻ nhỏ nó ra thành các Sub-components hoặc tách logic ra Custom Hooks.

## 3. BÌNH LUẬN & TÀI LIỆU (Comments & Docs)

- **Không giải thích "Code làm gì" (What):** Code sạch tự nó đã nói lên nó làm gì.
- **Chỉ giải thích "Tại sao" (Why):** Bắt buộc phải có comment khi sử dụng một logic phức tạp, một mẹo (hack), hoặc một thuật toán cụ thể.
- _Ví dụ:_ `// Sử dụng debounce 500ms ở đây để tránh spam API khi người dùng gõ tìm kiếm liên tục.`

## 4. ERROR HANDLING (Xử lý lỗi chủ động)

- Không bao giờ để ứng dụng "chết im lặng".
- Mọi API call hoặc logic có rủi ro phải được bọc trong `try...catch`.
- Các lỗi phải được log ra console rõ ràng cho CTO kèm theo thông báo thân thiện cho người dùng cuối.
