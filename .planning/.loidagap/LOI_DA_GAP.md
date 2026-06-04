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

---

### Lỗi 4: Repost không hoạt động ổn định và bị lệch trạng thái nút tương tác sau F5

**Ngày gặp:** 04/06/2026

**Phase:** Phase 5

**Mô tả lỗi:**
- User bấm đăng lại bài viết, hệ thống báo thành công nhưng nút đăng lại không chuyển trạng thái hoạt động lâu dài (nếu F5 sẽ bị mất hiển thị). Đồng thời, nếu bấm lại, backend chạy luồng toggle nhưng lại thực hiện hard delete, làm sai lệch trạng thái hiển thị.

**File liên quan:**
- `be_php/api/social/repost.php`
- `be_php/api/posts/read_public.php`
- `be_php/api/posts/read_single.php`

**Nguyên nhân gốc:**
- Do APIs lấy thông tin bài viết công khai không tích hợp bộ kiểm tra token người dùng đang đăng nhập, nên không trả về trạng thái `reposted` chuẩn. Dẫn đến khi render lại, frontend khởi tạo state `reposted = false`, làm thao tác click tiếp theo bị hiểu lầm là hủy đăng lại bằng lệnh `DELETE` của backend.

**Cách fix:**
1. Thêm bộ tích hợp `get_auth_user()` trong `read_public.php` và `read_single.php`. Truy vấn phụ `liked` và `reposted` dựa theo `user_id` hiện tại, trả về giá trị boolean chuẩn mà không chặn Guest (trả về false).
2. Nâng cấp logic `repost.php`: Nếu đã tồn tại dòng repost trong DB nhưng ở dạng soft-deleted (`deleted_at` không null), ta khôi phục lại (`deleted_at = NULL`) thay vì insert trùng lặp. Nếu đang active, thực hiện soft-delete (`deleted_at = NOW()`).

**Kết quả sau khi fix:**
- Nút Repost đồng bộ tuyệt đối trên Home Feed và PostDetail, lưu trữ trạng thái bền vững sau khi F5.

---

### Lỗi 5: Thiếu tab bài viết đã thích trên profile chính chủ

**Ngày gặp:** 04/06/2026

**Phase:** Phase 5

**Mô tả lỗi:**
- Người dùng chưa có giao diện tổng hợp và quản lý các bài viết mà họ đã thả tim.

**File liên quan:**
- `fe_react/src/pages/UserProfile.jsx`
- `be_php/api/users/read_liked_posts.php` [NEW]

**Nguyên nhân gốc:**
- Tính năng chưa được thiết lập ở các phase trước.

**Cách fix:**
1. Tạo mới API `read_liked_posts.php` để lấy danh sách bài viết đã thích của một `user_id` cụ thể, chỉ cho phép chủ tài khoản xem (trả về 403 cho người lạ truy cập).
2. Thêm tab "Đã thích" trong `UserProfile.jsx` cho chính chủ, bổ sung nút Unlike trực quan ngay trên card danh sách để xóa nhanh bài khỏi tab.

**Kết quả sau khi fix:**
- Tab bài viết đã thích hoạt động mượt mà, bảo vệ riêng tư tốt và cập nhật tức thì.

---

### Lỗi 6: DOMPurify chặn hiển thị ảnh inline Base64 chèn bằng Quill editor

**Ngày gặp:** 04/06/2026

**Phase:** Phase 5

**Mô tả lỗi:**
- Người dùng chèn nhiều ảnh inline vào nội dung thông qua Quill editor, hình ảnh lưu được vào DB nhưng khi hiển thị ở tab preview (xem trước) hoặc trang chi tiết đọc bài thì ảnh bị biến mất/hỏng.

**File liên quan:**
- `fe_react/src/pages/CreatePost.jsx`
- `fe_react/src/pages/PostDetail.jsx`

**Nguyên nhân gốc:**
- DOMPurify mặc định cấu hình bảo mật rất nghiêm ngặt, tự động loại bỏ các thuộc tính ảnh có giao thức URI dạng `data:image/...` (Base64) để chống XSS.

**Cách fix:**
- Truyền tham số `{ ADD_DATA_URI_TAGS: ['img'] }` vào hàm `DOMPurify.sanitize(...)` ở cả hai tệp JSX trên để giữ lại và hiển thị ảnh inline dạng Base64.

**Kết quả sau khi fix:**
- Người dùng chèn được nhiều ảnh minh họa inline Base64 mượt mà, hiển thị chuẩn xác ở cả màn hình preview và trang đọc bài chi tiết.

---

### Lỗi 7: Ảnh inline trong bài viết quá to, làm vỡ tỉ lệ hoặc choán hết màn hình

**Ngày gặp:** 04/06/2026

**Phase:** Phase 5B

**Mô tả lỗi:**
- Ảnh chèn trong nội dung bài viết hiển thị quá lớn, đặc biệt khi đọc trên máy tính có màn hình rộng hoặc ảnh có chiều dọc, gây choán hết không gian hiển thị và mất tính thẩm mỹ.

**File liên quan:**
- `fe_react/src/index.css`

**Nguyên nhân gốc:**
- Do các thẻ `<img>` chèn inline không được khống chế chiều cao và chiều rộng cụ thể, chỉ co giãn 100% chiều rộng của thẻ container. Việc cho phép người dùng tự resize ảnh trong editor bằng các thư viện bổ sung có độ rủi ro cao về tính tương thích với React 19 / Vite.

**Cách fix:**
- Bổ sung quy tắc CSS cố định chiều cao và chiều rộng an toàn cho ảnh inline trong `index.css`:
  ```css
  .rich-text-content img,
  .ql-editor img {
    max-width: 100% !important;
    max-height: 520px !important;
    width: auto !important;
    height: auto !important;
    object-fit: contain !important;
    display: block !important;
    margin: 1.5rem auto !important;
    border-radius: 1rem !important;
  }
  ```

**Kết quả sau khi fix:**
- Ảnh inline hiển thị đúng kích cỡ vừa vặn, không bị méo, bo góc tinh tế và căn lề giữa cực kỳ đẹp mắt.

---

### Lỗi 8: Khu vực tương tác Like / Repost trên PostDetail hiển thị nhãn cũ hoặc chưa đủ rõ ràng

**Ngày gặp:** 04/06/2026

**Phase:** Phase 5B

**Mô tả lỗi:**
- Nhãn nút tương tác dùng từ "Thả tim" và "Đăng lại" chưa đồng bộ hiện đại, biểu tượng icon kích thước nhỏ (20px), và trạng thái đã tương tác (active) chỉ có màu nền nhạt, chưa đủ nổi bật để thu hút sự chú ý.

**File liên quan:**
- `fe_react/src/pages/PostDetail.jsx`

**Nguyên nhân gốc:**
- Bố cục UI cũ chưa được tối ưu hóa độ tương phản và kích thước điểm chạm.

**Cách fix:**
- Sửa đổi label thành "Like" và "Repost", tăng kích thước icon Lucide lần lượt lên `22px` cho Star, và `28px` cho Heart/Repost.
- Thay đổi kích thước nút tương tác Like/Repost lên `w-14 h-14` để cân đối với icon to.
- Thay đổi class active: khi ở trạng thái kích hoạt, nút sẽ có màu nền đậm (`bg-red-500` cho Like, `bg-green-600` cho Repost) kết hợp chữ trắng và hiệu ứng bóng đổ (`shadow-md shadow-red-500/20` hoặc `shadow-green-600/20`).
- Thực hiện dọn dẹp thư mục báo cáo dư thừa, gom toàn bộ file báo cáo về `.planning/.baocao/`.

**Kết quả sau khi fix:**
- Khu vực tương tác cực kỳ bắt mắt, nổi bật và trực quan, dễ bấm hơn hẳn trên cả máy tính lẫn điện thoại, hoạt động chính xác 100% sau khi F5.
- Cấu trúc thư mục quy hoạch gọn gàng, đúng chuẩn.



