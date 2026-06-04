# LỖI ĐÃ GẶP VÀ CÁCH FIX

### Lỗi 1: Mất nút chỉnh sửa hồ sơ sau khi đổi tên (Biến thành nút Theo dõi)

**Ngày gặp:** 04/06/2026

**Phase:** Phase 2

**Mô tả lỗi:**
- Sau khi user thực hiện đổi tên hoặc cập nhật avatar/ảnh bìa trên trang cá nhân của mình, nút "Chỉnh sửa hồ sơ" biến mất và bị thay thế bằng nút "Theo dõi".

**File liên quan:**
- `be_php/api/users/update_profile.php`
- `fe_react/src/context/AuthContext.jsx`
- `fe_react/src/pages/UserProfile.jsx`

**Nguyên nhân gốc:**
1. Backend `update_profile.php` sau khi update thông tin thành công và trả về đối tượng user đã bị thiếu trường `uid` (chỉ trả về `id` dạng số nguyên).
2. Frontend `AuthContext.jsx` ở hàm `setAuthUser` thực hiện chuẩn hóa dữ liệu: `uid: userData.uid || userData.id`. Do `uid` từ backend trả về bị thiếu, `uid` của user trong context bị gán bằng `id` số nguyên (ví dụ: `2`).
3. Trong `UserProfile.jsx`, logic kiểm tra chủ tài khoản `isOwnProfile = currentUser?.uid === id` thực hiện so sánh `currentUser.uid` (bây giờ là số `2`) với tham số `id` từ URL (vẫn là chuỗi hash băm chuẩn). Hai giá trị khác nhau làm `isOwnProfile` bị sai lệch thành `false`, khiến UI hiển thị nút "Theo dõi" thay vì "Chỉnh sửa hồ sơ".

**Cách fix:**
1. Cập nhật Backend `update_profile.php` import `id_helper.php` và chủ động băm gán trường `uid` (`$updated_user['uid'] = encodeId($updated_user['id'])`) trước khi trả về.
2. Cập nhật `AuthContext.jsx` trong hàm `setAuthUser` ưu tiên lấy `user.uid` có sẵn trong state trước khi fallback sang `userData.id` số nguyên: `uid: userData.uid || (user && user.uid) || userData.id`.

**Cách test lại:**
- Đăng nhập, đổi tên user ở profile và nhấn lưu. Kiểm tra xem nút "Chỉnh sửa hồ sơ" có giữ nguyên và LocalStorage có lưu giữ chuỗi `uid` băm hay không.

**Kết quả sau khi fix:**
- Nút "Chỉnh sửa hồ sơ" hiển thị ổn định, LocalStorage lưu đúng định dạng hash.

---

### Lỗi 2: EditProfileModal có nguy cơ sửa nhầm profile người khác & thiếu đồng bộ state

**Ngày gặp:** 04/06/2026

**Phase:** Phase 2

**Mô tả lỗi:**
- Modal chỉnh sửa thông tin có nguy cơ hiển thị sai dữ liệu của người khác hoặc chỉnh sửa nhầm ID nếu người dùng cố ý thao tác bằng devtools/request giả mạo. Ngoài ra, khi mở lại modal sau khi chỉnh sửa nửa chừng, dữ liệu cũ vẫn bị lưu trong state input.

**File liên quan:**
- `fe_react/src/components/EditProfileModal.jsx`
- `fe_react/src/pages/UserProfile.jsx`
- `be_php/api/users/update_profile.php`

**Nguyên nhân gốc:**
1. Ở frontend, modal lấy thông tin trực tiếp từ prop `profile` được truyền vào từ trang đang xem mà không bắt buộc kiểm tra xem profile đó có trùng với user đang đăng nhập hay không. State của modal chỉ khởi tạo 1 lần và không reset khi mở lại/props thay đổi.
2. Ở backend, `update_profile.php` không kiểm tra triệt để quyền hạn, cho phép bất kỳ request nào gửi lên tham số ID/UID tùy ý để sửa dữ liệu người dùng khác.

**Cách fix:**
1. Ở frontend `UserProfile.jsx`: Chỉ truyền dữ liệu của chính mình vào modal: `profile={isOwnProfile ? profile : null}`.
2. Ở `EditProfileModal.jsx`: 
   - Thêm `useEffect` để đồng bộ lại thông tin input (`fullName`, previews) khi modal được mở hoặc thay đổi `profile`.
   - Thêm chốt chặn cuối trước khi render JSX: `if (!isOpen || !isOwn) return null` (trong đó `isOwn` kiểm tra khớp ID/UID giữa user đang login và profile cần sửa).
3. Ở backend `update_profile.php`: Đọc tham số `id`/`uid` truyền từ client, giải mã và so sánh với ID của user login. Nếu không trùng khớp, trả lỗi `403 Forbidden` lập tức.

**Cách test lại:**
- Truy cập profile của người khác và cố gắng mở modal chỉnh sửa bằng cách thay đổi state React trong DevTools. Modal sẽ bị chặn không hiển thị dữ liệu hoặc tự động đóng/ẩn. Gửi request sửa đổi với ID khác sẽ bị backend trả lỗi 403.

**Kết quả sau khi fix:**
- Phân quyền sửa đổi hồ sơ được thắt chặt 100%, đồng bộ form hoạt động chính xác.

---

### Lỗi 3: Khóa submit update avatar/cover của chính chủ khi bị dính cooldown đổi tên

**Ngày gặp:** 04/06/2026

**Phase:** Phase 3

**Mô tả lỗi:**
- Sau khi user đổi tên thành công, cooldown 7 ngày được kích hoạt. Ở giao diện chính chủ, khi mở modal "Chỉnh sửa hồ sơ", user tải lên avatar mới hoặc ảnh bìa mới nhưng nút "Cập nhật thông tin" bị disable hoàn toàn, không thể click submit để lưu mặc dù họ giữ nguyên tên hiển thị.

**File liên quan:**
- `fe_react/src/components/EditProfileModal.jsx`

**Nguyên nhân gốc:**
1. Trong modal `EditProfileModal.jsx`, nút submit được disable bằng biểu thức: `disabled={loading || isCoolingDown}`.
2. Khi `isCoolingDown` là `true` (user đang trong 7 ngày cooldown đổi tên), nút submit luôn bị disable. Điều này vô tình khóa nhầm tính năng đổi avatar/cover, mặc dù backend chỉ cấm đổi tên.

**Cách fix:**
1. Tạo một biến kiểm tra xem tên hiển thị hiện tại trên form có khác tên ban đầu hay không:
   `const isNameChanged = fullName.trim() !== (profile?.full_name || '').trim();`
2. Đổi logic khóa nút submit thành:
   `const isSubmitDisabled = loading || (isCoolingDown && isNameChanged);`
3. Cập nhật thuộc tính `disabled={isSubmitDisabled}` cho nút submit. Lúc này, nếu user chỉ thay đổi avatar/cover và giữ nguyên tên cũ, nút submit vẫn hoạt động bình thường.

**Cách test lại:**
1. Thực hiện đổi tên hiển thị (kích hoạt cooldown).
2. Thử mở lại modal chỉnh sửa hồ sơ.
3. Thay đổi avatar hoặc ảnh bìa -> Kiểm tra xem nút submit có hiển thị khả dụng hay không. Click submit -> Hồ sơ phải cập nhật thành công ảnh mới.
4. Thử cố ý sửa tên hiển thị -> Form input tên bị khóa và nút submit bị vô hiệu hóa (nếu cố tình sửa qua devtools).

**Kết quả sau khi fix:**
- User thay đổi avatar và ảnh bìa bình thường kể cả khi bị khóa đổi tên.

