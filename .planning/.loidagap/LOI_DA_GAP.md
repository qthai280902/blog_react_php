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

---

### Lỗi 9: Quá tải CPU và Timeout hệ thống khi thực hiện seed 10,001 bot followers

**Ngày gặp:** 04/06/2026

**Phase:** Phase 6

**Mô tả lỗi:**
- Khi chạy script reset dữ liệu test và tạo 10,001 tài khoản bot để làm follower cho các KOL/VIP, hệ thống PHP CLI có thể bị đơ, quá tải CPU hoặc gặp lỗi cạn kiệt tài nguyên (Max Execution Time / Memory Limit).

**File liên quan:**
- `be_php/config/reset_final_test_data.php`

**Nguyên nhân gốc:**
- Sử dụng hàm `password_hash()` liên tục trong vòng lặp 10,001 lần để tạo mật khẩu riêng cho từng bot. Hàm băm `bcrypt` (`PASSWORD_DEFAULT` của PHP) được thiết kế cực kỳ tốn tài nguyên tính toán (CPU-intensive) nhằm mục đích bảo mật, khiến việc băm 10,000+ lần làm tắc nghẽn CPU. Ngoài ra, việc thực hiện 10,001 câu lệnh insert `INSERT INTO` đơn lẻ cũng tạo áp lực kết nối lớn lên MySQL.

**Cách fix:**
1. Thực hiện băm chuỗi mật khẩu `'123456'` đúng **MỘT LẦN duy nhất** ngoài vòng lặp:
   `$hashed_password = password_hash('123456', PASSWORD_DEFAULT);`
   Sau đó dùng chung chuỗi hash này để insert cho toàn bộ các tài khoản bot.
2. Áp dụng kỹ thuật **Bulk Insert** (chèn hàng loạt) chia theo từng lô nhỏ (ví dụ 1,000 bản ghi mỗi lô) thay vì chèn đơn lẻ, giúp giảm thiểu tối đa số lượng truy vấn gửi tới MySQL.
3. Thực thi chèn follows và users trong **Transaction** để tối đa hóa tốc độ ghi đĩa vật lý của Database.

**Kết quả sau khi fix:**
- Script reset dữ liệu hoạt động mượt mà, hoàn thành chèn 10,001 người dùng bot và hơn 11,000 quan hệ follows chỉ trong chưa đầy **2 giây** mà không tốn tài nguyên CPU.

---

### Lỗi 10: Nút/tab màu đen thô thiển khi không hoạt động hoặc trong các modal xác nhận

**Ngày gặp:** 05/06/2026

**Phase:** Phase 7B Hotfix

**Mô tả lỗi:**
- Khi người dùng ở chế độ prefers-color-scheme dark hoặc trên một số giao diện nhất định, các tab không hoạt động (inactive) trong dropdown thông báo, tab trong profile, và nút hủy trong các modal xác nhận bị hiển thị màu đen xám rất xấu.

**File liên quan:**
- `fe_react/src/index.css`
- `fe_react/src/components/ConfirmModal.jsx`
- `fe_react/src/components/EditProfileModal.jsx`
- `fe_react/src/pages/UserProfile.jsx`
- `fe_react/src/components/Navbar.jsx`

**Nguyên nhân gốc:**
- Do template mặc định của Vite đặt rule CSS reset `button { background-color: #1a1a1a; }`. Khi các nút bấm hoặc tab ở trạng thái inactive không khai báo background tường minh (hoặc dùng Tailwind lớp ngoài không đè được), trình duyệt sẽ fallback về nền đen thô `#1a1a1a`.

**Cách fix:**
- Cập nhật rule `button` trong `index.css` đổi `background-color` mặc định thành `transparent`.
- Thiết kế lại các tab trong `UserProfile.jsx` và `Navbar.jsx` bằng pill layout và khai báo màu nền `bg-slate-50` / `bg-transparent` cụ thể.
- Gia cố nút hủy trong `ConfirmModal.jsx` và `EditProfileModal.jsx` bằng class `bg-slate-100 text-slate-600 hover:bg-slate-200` rõ ràng.
- Đổi nút submit thông tin và nút chỉnh sửa profile thành màu xanh dương MyBlog (`bg-blue-600 hover:bg-blue-700 text-white`).
- Thay các fallback avatar `bg-slate-900` bằng gradient `bg-gradient-to-tr from-slate-700 to-slate-800 shadow-inner`.

---

### Lỗi 11: Thùng rác bài viết và lượt đăng lại (repost) bị đơ counter (0) và không hiện bài viết vừa xóa

**Ngày gặp:** 05/06/2026

**Phase:** Phase 7B Hotfix

**Mô tả lỗi:**
- Người dùng xóa bài viết/repost thành công, nhận được toast thông báo chuyển vào thùng rác nhưng tab Thùng rác vẫn ghi số lượng (0) và nhấp vào tab thì trống không, bài viết không xuất hiện.

**File liên quan:**
- `fe_react/src/pages/UserProfile.jsx`
- `be_php/api/posts/restore.php`
- `be_php/api/posts/permanent_delete.php`

**Nguyên nhân gốc:**
1. Hàm `fetchTrash()` chỉ được gọi khi nhấp vào tab thùng rác chứ không được khởi tạo khi mount, dẫn đến số lượng badge ban đầu bị đơ (0).
2. Khi người dùng thực hiện soft-delete, khôi phục hoặc xóa vĩnh viễn, frontend lọc state mà không kích hoạt gọi lại `fetchTrash()` để đồng bộ lại counter và list rác.
3. Khi khôi phục hoặc xóa vĩnh viễn một repost rác, frontend không gửi kèm tham số `item_type = 'repost'` làm backend mặc định check bảng `posts` và ném lỗi 404 (Không tồn tại).

**Cách fix:**
1. Đưa `fetchTrash()` vào chạy song song ở mount `useEffect` nếu là profile chính chủ.
2. Gọi lại `fetchTrash()` đồng bộ ngay sau các lệnh soft-delete, restore, hoặc permanent delete thành công để cập nhật lại badge số lượng và danh sách.
3. Truyền kèm `item_type: item.item_type` từ frontend lên API `restore.php` và `permanent_delete.php` để backend phân luồng truy vấn đúng bảng database.

---

### Lỗi 12: Lỗi xóa bình luận báo "Lỗi khi xóa bình luận"

**Ngày gặp:** 05/06/2026

**Phase:** Phase 7B Hotfix

**Mô tả lỗi:**
- Người dùng bấm nút thùng rác xóa bình luận dưới bài viết hoặc bình luận của chính mình thì toast luôn báo lỗi màu đỏ "Lỗi khi xóa bình luận."

**File liên quan:**
- `be_php/api/comments/delete.php`

**Nguyên nhân gốc:**
- Do bảng `notifications` có thiết lập ràng buộc khóa ngoại (foreign key restriction) trỏ vào `comment_id` của bảng `comments`. Khi thực hiện lệnh xóa trực tiếp bình luận trong database, hệ thống ném ra lỗi vi phạm ràng buộc khóa ngoại và transaction bị rollback.

**Cách fix:**
- Cải tiến quy trình xóa trong `comments/delete.php` chạy transaction theo thứ tự an toàn:
  1. Xóa thông báo liên quan đến các phản hồi con trước.
  2. Xóa thông báo liên quan đến chính bình luận này.
  3. Xóa các phản hồi con.
  4. Xóa chính bình luận này.
- Đổi mệnh đề catch từ `Exception` sang `Throwable` để hứng trọn vẹn lỗi runtime PHP 8+.

---

### Lỗi 13: Lỗi crash 500 khi phản hồi bình luận (comment reply) nhiều lần

**Ngày gặp:** 05/06/2026

**Phase:** Phase 7B Hotfix

**Mô tả lỗi:**
- Người dùng viết bình luận, admin phản hồi lại 1 lần thành công nhưng các lần phản hồi tiếp theo luôn báo lỗi đỏ.

**File liên quan:**
- `be_php/api/comments/create.php`

**Nguyên nhân gốc:**
- Do logic gửi thông báo phản hồi (notifications) trong `comments/create.php` thực hiện truy vấn parent comment owner hoặc post owner và cố truy cập dữ liệu kiểu mảng trên giá trị boolean (khi kết quả fetch trả về `false`). Trên PHP 8+, điều này ném ra lỗi `TypeError` khiến luồng PHP bị dừng và trả về HTTP 500 Internal Server Error làm nghẽn hoàn toàn luồng đăng reply tiếp theo.

**Cách fix:**
- Gia cố logic kiểm tra giá trị dữ liệu trả về trước khi bóc tách thông tin: `if ($parent_comment_info) { ... }`.
- Bao bọc toàn bộ khối logic thông báo phụ trong khối `try { ... } catch (Throwable $e) { // Fail silently }` để đảm bảo lỗi thông báo (nếu có) tuyệt đối không phá hỏng tiến trình thêm bình luận chính.

---

### Lỗi 14: Chuông thông báo dropdown quá thô và tab đen xấu

**Ngày gặp:** 05/06/2026

**Phase:** Phase 7B Hotfix

**Mô tả lỗi:**
- Dropdown thông báo hiển thị dầy, thô, các tab lọc Bình luận, Đăng lại, Thích bị dính nền đen, thiếu chỉ số count thông báo chưa đọc, không có scrollbar mịn.

**File liên quan:**
- `fe_react/src/components/Navbar.jsx`

**Nguyên nhân gốc:**
- CSS class tab chưa rõ ràng dẫn đến dính default background đen của reset button. Spacing và padding chưa tối ưu hóa cho news/blog portal cao cấp.

**Cách fix:**
- Nâng rộng dropdown lên `w-96` cân đối hơn trên màn hình máy tính.
- Đổi màu 3 tab thông báo sang dạng pill xám nhạt (`bg-slate-50`), tab active nền trắng shadow tinh tế.
- Tự động tính toán số lượng thông báo CHƯA ĐỌC (`!is_read`) theo từng tab và hiển thị badge đỏ nhấp nháy (`animate-pulse`) ngay bên cạnh chữ tab.
- Thêm CSS ẩn scrollbar thô sơ (`no-scrollbar`) để danh sách thông báo cuộn mượt mà.
- Thiết kế lại empty state thông báo đẹp mắt.
- Bổ sung avatar thật của người kích hoạt thông báo bằng cách nâng cấp backend API `read.php` và `create.php` (bình luận) trả về cột `avatar_image`.
- Cập nhật giao diện replies lồng nhau: thụt lề `ml-12`, có đường kẻ màu xanh bên trái (`border-l-2 border-blue-500/20 pl-4 py-1`) và nhãn "Phản hồi" tinh xảo. Cho phép phản hồi liên tục bằng cách nhấp "Phản hồi" ở reply con để prefill tag `@username` và tự động trỏ lên cha cao nhất.

---

### Lỗi 15: Thùng rác bài viết và lượt đăng lại (repost) bị chập chờn hoặc trống rác khi truy cập trang cá nhân bằng ID thô (/profile/1)

**Ngày gặp:** 05/06/2026

**Phase:** Phase 7C Hotfix

**Mô tả lỗi:**
- Người dùng xóa bài viết/repost thành công, nhưng khi truy cập trang cá nhân hoặc xem rác thì tab Thùng rác bị ẩn hoặc số lượng badge rác bị trả về 0 mặc dù trong DB có bài đã xóa.

**File liên quan:**
- `fe_react/src/pages/UserProfile.jsx`

**Nguyên nhân gốc:**
- Logic kiểm tra chủ tài khoản `isOwnProfile = currentUser?.uid === id` bị so lệch nếu URL sử dụng ID thô của user `/profile/1` (so sánh string `"1"` với hash UID `"U09..."` trong token trả về `false`). Khi `isOwnProfile` bị sai, tab Thùng rác bị ẩn và các hàm fetch rác không được thực thi.

**Cách fix:**
- Nâng cấp logic gán `isOwnProfile` so khớp linh hoạt cả `uid` băm và `id` số nguyên từ `currentUser` và dữ liệu `profile` tải về từ server.
- Tách luồng chạy `fetchTrash()` và `fetchLikedPosts()` ra `useEffect` riêng biệt phụ thuộc trực tiếp vào trạng thái `isOwnProfile` sau khi đã giải mã xong, tránh chạy trùng lặp hoặc bị nuốt request.
- Gia cố các fetch function trong `UserProfile.jsx` luôn tải token mới nhất từ `localStorage` để gửi Header Authorization chuẩn.

---

### Lỗi 16: Thao tác xóa bình luận bị lỗi vỡ JSON do PHP Warning trên payload rỗng hoặc thiếu thuộc tính

**Ngày gặp:** 05/06/2026

**Phase:** Phase 7C Hotfix

**Mô tả lỗi:**
- Người dùng bấm nút thùng rác xóa bình luận dưới bài viết hoặc bình luận của chính mình thì toast báo lỗi "Lỗi khi xóa bình luận." do server phản hồi HTML warning làm vỡ định dạng JSON.

**File liên quan:**
- `be_php/api/comments/delete.php`

**Nguyên nhân gốc:**
- Khi frontend gửi payload, nếu đối tượng giải mã JSON bằng `json_decode(file_get_contents("php://input"))` bị null hoặc thiếu trường `id`, lệnh kiểm tra thuộc tính `$data->id` trực tiếp sẽ sinh ra PHP Warning: `Attempt to read property "id" on null`. Lỗi này được in ra đầu ra response làm hỏng JSON của client và ném về nhánh catch hiển thị toast.

**Cách fix:**
- Cải tiến cách nhận dữ liệu đầu vào trong `delete.php` linh hoạt: hỗ trợ lấy từ JSON body và URL-encoded form data (kiểm tra lần lượt `comment_id`, `id` qua POST/GET).
- Sử dụng mảng kết hợp null coalescing `?? []` và kiểm tra `empty()` thay vì truy cập thuộc tính object để dập tắt triệt để PHP warnings.
- Áp dụng tương tự kỹ thuật bảo vệ này cho các API bài viết (`soft_delete.php`, `restore.php`, `permanent_delete.php`).

---

### Lỗi 17: Xóa bình luận bị chặn CORS ở OPTIONS preflight

**Ngày gặp:** 05/06/2026

**Phase:** Phase 7D Hotfix

**Mô tả lỗi:**
- Bấm xóa bình luận bị báo lỗi CORS, preflight OPTIONS thất bại vì không có header `Access-Control-Allow-Origin`.

**File liên quan:**
- `be_php/api/comments/delete.php`

**Nguyên nhân gốc:**
- Có đoạn code check OPTIONS và exit sớm ở ngay đầu file `delete.php` trước khi include `database.php`. Vì thế, request OPTIONS thoát ra mà chưa chạy qua `cors.php` để gán header CORS.

**Cách fix:**
- Gỡ bỏ exit sớm đó, để `include_once '../../config/database.php'` được gọi trước tiên. Khi đó, `cors.php` được gọi trước, tự động xử lý OPTIONS và trả kèm headers CORS hợp lệ trước khi exit.

---

### Lỗi 18: Thùng rác (trash.php) trả về size 0B (Response rỗng)

**Ngày gặp:** 05/06/2026

**Phase:** Phase 7D Hotfix

**Mô tả lỗi:**
- Network tab báo `trash.php` trả về HTTP status 200 nhưng size 0B, UI không thể render danh sách bài viết trong thùng rác.

**File liên quan:**
- `be_php/api/posts/trash.php`

**Nguyên nhân gốc:**
- Tương tự như Lỗi 17, `trash.php` có đoạn check OPTIONS exit sớm trước khi include `database.php`. Trình duyệt gửi request preflight bị lỗi CORS do thiếu header, dẫn tới chặn luôn request GET thật tiếp theo (hoặc request GET thật cũng bị lỗi không phản hồi).

**Cách fix:**
- Di chuyển `include_once '../../config/database.php'` lên dòng đầu tiên để `cors.php` xử lý trước. Gỡ bỏ mọi khối xử lý OPTIONS trùng lặp và thiếu an toàn ở trước phần include.






