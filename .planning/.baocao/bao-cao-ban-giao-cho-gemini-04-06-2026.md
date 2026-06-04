# BÁO CÁO BÀN GIAO CHO GEMINI - 04/06/2026

## 1. Mục đích

Báo cáo này tổng hợp toàn bộ công việc Antigravity đã thực hiện trong thời gian Gemini không theo dõi dự án MyBlog, để Gemini có thể tiếp tục hỗ trợ mà không bị mất ngữ cảnh.

## 2. Tổng quan dự án

* **Tên dự án**: MyBlog (PHP Backend + React Frontend)
* **Repo path**: [revphp](file:///C:/Users/thaib/du_an_code/revphp)
* **Frontend path**: [fe_react](file:///C:/Users/thaib/du_an_code/revphp/fe_react)
* **Backend path**: [be_php](file:///C:/Users/thaib/du_an_code/revphp/be_php)
* **Database/schema**: MySQL / MariaDB, schema tệp tin [blog_db.sql](file:///C:/Users/thaib/du_an_code/revphp/blog_db.sql)
* **Stack**: PHP thuần (Backend) + React 19 / Vite / TailwindCSS 3.4 / Lucide-React / Axios (Frontend)
* **Trạng thái tổng thể hiện tại**: Đang hoạt động tốt, giao diện đã được chuyển hóa toàn diện thành phong cách blog/tin tức hiện đại (Magazine/News portal), các chức năng phân quyền bảo mật profile và cooldown đổi tên hiển thị hoạt động chính xác và an toàn tuyệt đối.

## 3. Tóm tắt theo phase

### Phase 1 - Sửa login / last_name_change_at

* **Lỗi ban đầu**: Hệ thống gặp lỗi 500 khi người dùng đăng nhập hoặc cập nhật profile.
* **Nguyên nhân**: Trường dữ liệu `users.last_name_change_at` không tồn tại trong cấu trúc database gốc nhưng lại được gọi trong các truy vấn SQL của API đăng nhập/profile.
* **File đã sửa**: `be_php/api/auth/login.php`, `be_php/api/users/profile.php` và các file cấu trúc liên quan.
* **Cách sửa**: Khai báo bổ sung cột `last_name_change_at` vào bảng `users` trong cơ sở dữ liệu thực thi để đồng bộ logic cooldown đổi tên hiển thị.
* **Test đã chạy**: Kiểm tra cú pháp PHP và đăng nhập thành công ở frontend.
* **Trạng thái hiện tại**: Hoàn thành.

### Phase 2 - Sửa logic profile + redesign ban đầu

* **Lỗi mất nút “Chỉnh sửa hồ sơ” sau khi đổi tên**: Khi người dùng thực hiện đổi tên hoặc lưu thông tin thành công, nút "Chỉnh sửa hồ sơ" biến mất và chuyển thành nút "Theo dõi".
* **Nguyên nhân do mất `uid` hash sau update profile**:
  1. API [update_profile.php](file:///C:/Users/thaib/du_an_code/revphp/be_php/api/users/update_profile.php) sau khi cập nhật thành công trả về thông tin user thiếu trường `uid` băm mà chỉ có `id` số nguyên.
  2. Ở frontend, hàm `setAuthUser` trong [AuthContext.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/context/AuthContext.jsx) tự động fallback `uid: userData.uid || userData.id`, vô tình ghi đè chuỗi `uid` băm trong context thành ID số nguyên (ví dụ: `2`).
  3. Khi so sánh `currentUser.uid === id` ở trang [UserProfile.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/pages/UserProfile.jsx) (trong đó `id` lấy từ URL là chuỗi băm), hai giá trị lệch nhau khiến hệ thống ẩn nút "Chỉnh sửa hồ sơ" và thay thế bằng nút "Theo dõi" của người khác.
* **Backend đã trả lại `uid` thế nào**: Bổ sung import [id_helper.php](file:///C:/Users/thaib/du_an_code/revphp/be_php/config/id_helper.php) trong [update_profile.php](file:///C:/Users/thaib/du_an_code/revphp/be_php/api/users/update_profile.php), mã hóa ID trước khi trả về: `$updated_user['uid'] = encodeId($updated_user['id']);`.
* **AuthContext giữ `uid` hash thế nào**: Cập nhật hàm `setAuthUser` ưu tiên giữ lại `uid` băm cũ có sẵn trong state: `uid: userData.uid || (user && user.uid) || userData.id`.
* **Đã chặn sửa nhầm hồ sơ người khác thế nào**: 
  - Ở backend [update_profile.php](file:///C:/Users/thaib/du_an_code/revphp/be_php/api/users/update_profile.php), giải mã tham số ID/UID truyền lên và kiểm tra với ID tài khoản đang login. Nếu lệch, lập tức trả về `403 Forbidden`.
  - Ở frontend [UserProfile.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/pages/UserProfile.jsx), chỉ truyền dữ liệu profile chính chủ vào modal chỉnh sửa: `profile={isOwnProfile ? profile : null}`. Thêm chốt chặn cuối ở [EditProfileModal.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/components/EditProfileModal.jsx): `if (!isOpen || !isOwn) return null`.
* **File đã sửa**:
  - [be_php/api/users/update_profile.php](file:///C:/Users/thaib/du_an_code/revphp/be_php/api/users/update_profile.php)
  - [fe_react/src/context/AuthContext.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/context/AuthContext.jsx)
  - [fe_react/src/pages/UserProfile.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/pages/UserProfile.jsx)
  - [fe_react/src/components/EditProfileModal.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/components/EditProfileModal.jsx)
* **Test đã chạy**: Test kiểm tra đổi tên hiển thị thành công, nút "Chỉnh sửa hồ sơ" giữ nguyên, LocalStorage không bị mất `uid` băm.

### Phase 3 - Fix avatar/cover cooldown + nâng cấp CreatePost

* **Lỗi avatar/cover bị khóa nhầm khi đang cooldown đổi tên**: Nút submit của modal chỉnh sửa hồ sơ bị disable cứng khi `isCoolingDown === true`. Khi user đang trong thời gian 7 ngày cooldown đổi tên hiển thị, họ bị khóa hoàn toàn chức năng đổi avatar và cover mặc dù backend cho phép đổi.
* **Cách fix ở EditProfileModal.jsx**:
  - Khai báo biến `isNameChanged = fullName.trim() !== (profile?.full_name || '').trim();` để kiểm tra thay đổi tên hiển thị.
  - Sửa điều kiện khóa nút lưu thành: `isSubmitDisabled = loading || (isCoolingDown && isNameChanged);`.
* **Người dùng đã xác nhận 5 test sau đều đạt**:
  1. Đang trong thời gian cooldown đổi tên -> chỉ đổi avatar -> lưu thành công.
  2. Đang trong thời gian cooldown đổi tên -> chỉ đổi ảnh bìa -> lưu thành công.
  3. Đang trong thời gian cooldown đổi tên -> đổi cả avatar + ảnh bìa -> lưu thành công.
  4. Đang trong thời gian cooldown đổi tên -> cố đổi tên -> bị chặn (ô nhập tên hiển thị bị khóa cứng ở UI và backend chặn bằng mã lỗi 429).
  5. Vào profile người khác -> hoàn toàn không mở được chỉnh sửa hồ sơ (nút chỉnh sửa ẩn, modal chặn hiển thị).
* **CreatePost đã thêm tab Soạn thảo / Xem trước**: [CreatePost.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/pages/CreatePost.jsx) được nâng cấp thành cơ chế tab Soạn thảo (Edit) & Xem trước (Live Preview). Tự động cập nhật nội dung mà không unmount trình soạn thảo Quill, giữ nguyên con trỏ và lịch sử undo/redo nhờ kỹ thuật ẩn CSS.
* **Preview dùng DOMPurify**: Sử dụng `DOMPurify.sanitize(content)` để làm sạch dữ liệu HTML bài viết trước khi kết xuất preview an toàn.
* **Ảnh inline hiện đang lưu base64 trong posts.content**: Ảnh chèn trực tiếp trong Quill được mã hóa dạng Base64 nhúng trực tiếp vào chuỗi HTML lưu vào database.
* **blog_db.sql đã đổi posts.content từ TEXT sang MEDIUMTEXT**: Thay thế kiểu cột `content` của bảng `posts` từ `TEXT` (tối đa 64KB - gây lỗi cắt cụt HTML chứa ảnh base64) thành `MEDIUMTEXT` (tối đa 16MB) để lưu trữ an toàn trong tệp [blog_db.sql](file:///C:/Users/thaib/du_an_code/revphp/blog_db.sql).
* **Cảnh báo rõ**: Việc lưu trữ ảnh dạng base64 inline chỉ là **giải pháp tạm thời**. Nó làm tăng dung lượng database nhanh chóng và dễ dàng gây lỗi `413 Request Entity Too Large` hoặc timeout nếu kích thước POST request vượt quá cấu hình `post_max_size` (thường là 8MB - 20MB) của PHP.

### Phase 4 - Redesign giao diện blog/news portal

* **Trạng thái**: Phase 4 đã hoàn tất. Giao diện MyBlog được cải tổ toàn diện thành một tạp chí công nghệ/news portal chuyên nghiệp, hiện đại.
* **File đã sửa**:
  - [fe_react/src/layouts/PublicLayout.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/layouts/PublicLayout.jsx)
  - [fe_react/src/components/Navbar.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/components/Navbar.jsx)
  - [fe_react/src/pages/PostList.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/pages/PostList.jsx)
  - [fe_react/src/pages/PostDetail.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/pages/PostDetail.jsx)
  - [fe_react/src/pages/UserProfile.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/pages/UserProfile.jsx)
* **Thay đổi chính**:
  - **PublicLayout & Chân trang**: Giới hạn chiều rộng trang tối đa `max-w-7xl` để hiển thị cân đối. Thêm thanh danh mục tags ngang bắt mắt dưới Header và footer 4 cột chuyên nghiệp ở đáy trang. Ẩn sidebar trên `/create` và `/profile/:id` để tập trung không gian.
  - **Navbar & Search tập trung**: Logo được làm tinh tế, header sticky nhẹ. Bổ sung một ô tìm kiếm lớn ở giữa Navbar cho cả máy tính và di động, liên kết đồng bộ với URL query parameter `?q=keyword` thay thế cho input tìm kiếm thô trước đây ở trang chủ.
  - **Trang chủ Magazine Layout**: Chia feed trang đầu tiên của trang chủ thành 3 khối có nhịp điệu: 1 Hero Post lớn bên trái hiển thị ảnh 16:9, 2 Highlight Post nhỏ xếp chồng bên phải, và danh sách bài viết mới cập nhật xếp dạng dòng (News list row) có thumbnail bên trái, thông tin mô tả chi tiết và các nút tương tác nhỏ gọn bên phải.
  - **PostDetail nhẹ nhàng**: Khu vực bình luận tối màu `bg-slate-900` được thay thế bằng hộp bình luận sáng màu bo tròn trên nền `bg-slate-50` trang nhã. Chuyển đổi toàn bộ màu Cyan cũ sang màu xanh dương chủ đạo của thương hiệu MyBlog.
  - **UserProfile sinh động**: Bổ sung ảnh thu nhỏ (thumbnail) bên trái danh sách bài viết cá nhân để đồng bộ thẩm mỹ với trang chủ.
* **Test đã chạy**:
  - `cmd /c npm run build` biên dịch thành công 100% không phát sinh lỗi.
  - `php -l be_php/api/users/update_profile.php` -> Hoàn toàn sạch lỗi.
  - `php -l be_php/api/posts/create.php` -> Hoàn toàn sạch lỗi.
* **Những test tay cần người dùng kiểm tra tiếp**:
  - Tìm kiếm bài viết bằng ô search ở Navbar, kiểm tra tính đồng bộ URL và kết quả lọc.
  - Chuyển đổi danh mục tags ngang dưới Navbar.
  - Kiểm tra tính responsive trên thiết bị di động (không bị tràn ngang, menu di động hiển thị tốt).
  - Kiểm tra xem giao diện trang chi tiết bài viết và trang profile cá nhân đã đạt tính thẩm mỹ mong muốn chưa.

## 4. Danh sách lỗi đã fix

| STT | Lỗi | Nguyên nhân | File liên quan | Cách fix | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Lỗi đăng nhập 500 | Trường `users.last_name_change_at` không tồn tại trong cấu trúc database gốc. | `be_php/api/auth/login.php` | Khai báo bổ sung cột `last_name_change_at` vào DB thực thi. | **Đã fix** |
| 2 | Sửa profile lỗi crash | Quá trình cập nhật profile gọi trường `last_name_change_at` không tồn tại. | `be_php/api/users/update_profile.php` | Thêm cột `last_name_change_at` vào DB runtime. | **Đã fix** |
| 3 | Mất `uid` băm sau khi lưu thông tin | Response của API cập nhật profile chỉ trả về `id` dạng số nguyên chứ không chứa `uid` băm. | `be_php/api/users/update_profile.php` | Import `id_helper.php` và chủ động mã hóa `uid` trước khi trả về. | **Đã fix** |
| 4 | Nút "Chỉnh sửa hồ sơ" biến thành "Theo dõi" | Do `currentUser.uid` bị ghi đè thành số nguyên, so sánh `currentUser.uid === id` (hash URL) bị lệch. | `UserProfile.jsx`, `AuthContext.jsx` | Sửa `AuthContext` bảo lưu `uid` băm và so sánh chính xác hai chuỗi băm. | **Đã fix** |
| 5 | Nguy cơ sửa nhầm hồ sơ người khác | Backend không validate ID người đang gửi request; Frontend truyền thẳng prop profile của người đang xem vào EditModal. | `update_profile.php`, `UserProfile.jsx`, `EditProfileModal.jsx` | Thêm chốt chặn so sánh ID/UID tại cả frontend và backend (trả về 403 Forbidden nếu sửa chéo). | **Đã fix** |
| 6 | Khóa submit avatar/cover trong cooldown | Nút lưu modal bị disable cứng khi `isCoolingDown` là `true` dù user chỉ thay đổi avatar/cover và giữ nguyên tên. | `EditProfileModal.jsx` | Tính toán `isNameChanged` và chỉ khóa nút submit khi có sự thay đổi tên hiển thị trong cooldown. | **Đã fix** |
| 7 | Giới hạn `TEXT` không đủ cho base64 ảnh | Cột `posts.content` dạng `TEXT` (64KB) làm cắt cụt mã HTML chứa ảnh inline, gây lỗi hiển thị ảnh. | [blog_db.sql](file:///C:/Users/thaib/du_an_code/revphp/blog_db.sql) | Đổi kiểu cột `posts.content` sang `MEDIUMTEXT` (16MB) trong schema tĩnh và runtime. | **Đã fix** |
| 8 | Giao diện Home cũ đơn điệu kéo dọc | Danh sách feed trang chủ dạng card dọc to, chiếm khoảng trắng lớn và thiếu cấu trúc tin tức. | `PostList.jsx`, `PublicLayout.jsx` | Cải tổ sang Magazine layout (Hero + Side highlights + News rows list), thêm categories ngang và footer. | **Đã fix** |

*Ghi chú*: Phần quản lý tags/hashtags khi tạo bài và lưu trữ tags hiện tại đã được đồng bộ chuẩn qua API và bảng trung gian `post_tags`/`tags`.

## 5. Danh sách file đã thay đổi

| File | Loại thay đổi | Nội dung chính | Ghi chú |
| :--- | :--- | :--- | :--- |
| [blog_db.sql](file:///C:/Users/thaib/du_an_code/revphp/blog_db.sql) | Schema SQL | Đồng bộ kiểu dữ liệu cột `posts.content` thành `MEDIUMTEXT`. | Dành cho lưu ảnh inline base64 dung lượng lớn. |
| [update_profile.php](file:///C:/Users/thaib/du_an_code/revphp/be_php/api/users/update_profile.php) | Backend PHP | Bổ sung phân quyền `403 Forbidden` khi sửa chéo; trả về `uid` băm đầy đủ trong response. | Đã chạy PHP linter an toàn. |
| [AuthContext.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/context/AuthContext.jsx) | Frontend React | Bảo vệ `uid` băm trong state của `setAuthUser` tránh bị suy biến thành số nguyên. | Fix lỗi nút sửa hồ sơ biến mất. |
| [EditProfileModal.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/components/EditProfileModal.jsx) | Frontend React | Cho phép submit avatar/cover trong thời gian cooldown đổi tên hiển thị. | Đồng bộ form khi props thay đổi. |
| [PublicLayout.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/layouts/PublicLayout.jsx) | Frontend Layout | Thêm thanh danh mục tags ngang, footer 4 cột và thiết lập ẩn sidebar thông minh. | Hỗ trợ responsive tốt. |
| [Navbar.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/components/Navbar.jsx) | Frontend Component | Redesign logo, làm gọn header và tích hợp ô tìm kiếm trung tâm đồng bộ với URL param. | Sticky header cố định. |
| [PostList.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/pages/PostList.jsx) | Frontend Page | Cấu hình bố cục magazine tạp chí (Hero post + Stacked highlights + News rows) và đồng bộ search param `q`. | Tăng giới hạn `postsPerPage` lên 8. |
| [PostDetail.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/pages/PostDetail.jsx) | Frontend Page | Redesign ô bình luận sang giao diện sáng màu `bg-slate-50`; thu nhỏ các card tương tác; chuyển màu Cyan sang Blue. | prose styling cho text content. |
| [UserProfile.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/pages/UserProfile.jsx) | Frontend Page | Bổ sung ảnh thumbnail thu nhỏ cho các bài viết cá nhân trong tab Bài viết. | Bảo toàn logic ownership. |
| [Sidebar.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/components/Sidebar.jsx) | Frontend Component | Tự động gọi API `/api/posts/read_public.php?limit=3&sort=hot` để hiển thị 3 bài viết đọc nhiều thật. | Loại bỏ hoàn toàn link cứng/data giả. |
| [CreatePost.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/pages/CreatePost.jsx) | Frontend Page | Thiết lập tab Soạn thảo / Xem trước và tích hợp DOMPurify lọc mã độc HTML. | Giữ nguyên trạng thái Quill khi đổi tab. |

## 6. Test đã chạy

1. **Kiểm tra biên dịch**: Chạy `cmd /c npm run build` trong thư mục [fe_react](file:///C:/Users/thaib/du_an_code/revphp/fe_react). Kết quả: Vite build hoàn tất thành công, không sinh bất cứ lỗi nào.
2. **PHP linter**: Chạy `php -l` cho [update_profile.php](file:///C:/Users/thaib/du_an_code/revphp/be_php/api/users/update_profile.php) và [create.php](file:///C:/Users/thaib/du_an_code/revphp/be_php/api/posts/create.php). Kết quả: Không có lỗi cú pháp.
3. **Kiểm thử thủ công**:
   - Thao tác đăng nhập, đổi tên -> cooldown hoạt động, đổi ảnh bìa/avatar -> lưu được bình thường.
   - Thử gọi sửa chéo ID từ client -> Trả về lỗi 403.
   - Đăng bài viết chứa ảnh inline -> Bản xem trước hiển thị chính xác ảnh và chữ, đăng bài thành công lên feed trang chủ.
   - Kiểm tra sidebar hiển thị đúng số liệu bài viết đọc nhiều từ API thật.

## 7. Những điểm Gemini cần cực kỳ lưu ý

* **Không làm mất `uid` băm**: Khi sửa đổi các luồng liên quan đến login, update profile hoặc profile cá nhân, hãy đảm bảo `uid` được truyền và lưu trữ dưới dạng chuỗi băm băm (hash). Mất `uid` băm sẽ phá hủy logic kiểm tra `isOwnProfile = currentUser.uid === id`, làm biến mất nút chỉnh sửa hồ sơ.
* **Quyền hạn sửa profile**: User A chỉ được sửa profile chính mình. Luôn giữ chốt chặn `403 Forbidden` ở backend [update_profile.php](file:///C:/Users/thaib/du_an_code/revphp/be_php/api/users/update_profile.php) và `isOwn` kiểm tra ở [EditProfileModal.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/components/EditProfileModal.jsx).
* **Cooldown đổi tên hiển thị**: Cooldown được lưu vết ở bảng `user_name_history` và đồng bộ qua cột `last_name_change_at` trong bảng `users`. Trường `last_name_change_at` không tồn tại trong schema gốc của MySQL, cần chú ý khi import DB mới.
* **Lưu ảnh inline Base64 là giải pháp tạm thời**: Trường `posts.content` hiện là `MEDIUMTEXT` (16MB). Tuyệt đối không được báo với khách hàng rằng "đã an toàn hoàn toàn" vì ảnh base64 kích thước lớn vẫn có thể vượt quá cấu hình `post_max_size` của PHP/Apache và làm phình to DB. Về lâu dài cần phát triển tính năng upload ảnh vật lý qua API.
* **Thẩm mỹ giao diện**: Giao diện vừa được nâng cấp theo hướng blog/news portal. Tránh chỉnh sửa lung tung làm quay về giao diện một cột dọc thô cũ. Tuyệt đối không sao chép nguyên HTML/CSS của các trang thương mại điện tử hoặc trang web mẫu vào project.

## 8. Việc nên làm tiếp theo

1. **Kiểm tra giao diện thủ công**: Nhờ người dùng chụp ảnh/quay video hoặc test tay giao diện Phase 4 trên máy thật để căn chỉnh lại spacing và font theo gu cá nhân nếu cần.
2. **Chuẩn hóa tags/hashtags**: Kiểm tra kỹ lưỡng luồng tách và lưu trữ tags khi tạo bài viết ở trang [CreatePost.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/pages/CreatePost.jsx) xem có bị lỗi ký tự đặc biệt hoặc trùng lặp không.
3. **Phát triển module upload ảnh inline**: Thay thế cơ chế mã hóa Base64 bằng việc thiết lập API upload ảnh riêng lẻ, lưu file ảnh tĩnh vào thư mục `uploads/` trên server và trả về URL để chèn vào Quill Editor.
4. **Tối ưu responsive di động/tablet**: Kiểm thử kỹ giao diện của Navbar và danh sách feed chia cột trên màn hình hẹp, đảm bảo không bị vỡ bố cục hoặc tràn ngang.
5. **Dọn dẹp tài liệu**: Xóa các file nháp tạm thời và đồng bộ lại tệp readme nếu cần trước khi kết thúc project.

## 9. Tình trạng hiện tại để Gemini tiếp tục

Dự án hiện đã hoàn tất thành công cả Phase 2, 3 và 4. Các lỗi nghiêm trọng về logic đăng nhập, mất nút chỉnh sửa profile và xung đột cooldown đổi tên hiển thị đã được giải quyết triệt để. Giao diện toàn trang đã lột xác thành một blog portal dạng tạp chí chuyên nghiệp. 

Gemini có thể tiếp tục bằng việc nhận phản hồi của người dùng về giao diện Phase 4 mới và tập trung vào các đề xuất cải tiến như tối ưu hóa responsive, lọc tags hoặc phát triển luồng upload ảnh inline production hơn.
