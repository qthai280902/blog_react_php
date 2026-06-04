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
* **Trạng thái tổng thể hiện tại**: Dự án hoạt động cực kỳ mượt mà và ổn định. Đã sửa toàn bộ các lỗi liên quan đến repost, bài viết đã thích, upload nhiều ảnh inline và tối ưu giao diện responsive, tăng kích thước icon tương tác bài viết giúp giao diện tin tức/blog trở nên sắc sảo và hiện đại.

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
* **Thay đổi chính**:
  - **PublicLayout & Chân trang**: Giới hạn chiều rộng trang tối đa `max-w-7xl` để hiển thị cân đối. Thêm thanh danh mục tags ngang bắt mắt dưới Header và footer 4 cột chuyên nghiệp ở đáy trang. Ẩn sidebar trên `/create` và `/profile/:id` để tập trung không gian.
  - **Navbar & Search tập trung**: Logo được làm tinh tế, header sticky nhẹ. Bổ sung một ô tìm kiếm lớn ở giữa Navbar cho cả máy tính và di động, liên kết đồng bộ với URL query parameter `?q=keyword` thay thế cho input tìm kiếm thô trước đây ở trang chủ.
  - **Trang chủ Magazine Layout**: Chia feed trang đầu tiên của trang chủ thành 3 khối có nhịp điệu: 1 Hero Post lớn bên trái hiển thị ảnh 16:9, 2 Highlight Post nhỏ xếp chồng bên phải, và danh sách bài viết mới cập nhật xếp dạng dòng (News list row) có thumbnail bên trái, thông tin mô tả chi tiết và các nút tương tác nhỏ gọn bên phải.
  - **PostDetail nhẹ nhàng**: Khu vực bình luận tối màu `bg-slate-900` được thay thế bằng hộp bình luận sáng màu bo tròn trên nền `bg-slate-50` trang nhã. Chuyển đổi toàn bộ màu Cyan cũ sang màu xanh dương chủ đạo của thương hiệu MyBlog.
  - **UserProfile sinh động**: Bổ sung ảnh thu nhỏ (thumbnail) bên trái danh sách bài viết cá nhân để đồng bộ thẩm mỹ với trang chủ.

### Phase 5 - Sửa lỗi Repost, tab Đã thích & đăng nhiều ảnh inline

> [!IMPORTANT]
> **Tóm tắt cốt lõi Phase 5**:
> * **Đã fix Repost**: Chuyển logic từ hard delete sang soft-delete bằng `deleted_at`, đồng thời xử lý triệt để khôi phục trạng thái nút repost sau khi nhấn F5 mà không gây lỗi 401 khi user chưa đăng nhập.
> * **Đã thích**: Bổ sung tab danh sách các bài viết đã thích riêng tư cho chính chủ trên trang User Profile cùng nút Unlike trực quan cập nhật realtime.
> * **Nhiều ảnh inline**: Cấu hình DOMPurify cho phép hiển thị an toàn nhiều ảnh inline dạng base64 trong trình soạn thảo Quill và trang chi tiết bài viết, kèm bảng lưu ý cho người dùng.
> * **Tags/Hashtags**: Hỗ trợ đồng bộ tham số `tags` và `hashtags` gửi từ frontend để đảm bảo lưu trữ chính xác.

* **Mục tiêu**: Xử lý triệt để các phản hồi sau test Phase 4, hoàn thiện tương tác và đồng bộ DB.
* **Thay đổi chính**:
  - **Repost logic**: Sửa đổi [repost.php](file:///C:/Users/thaib/du_an_code/revphp/be_php/api/social/repost.php) sử dụng toggle soft-delete (`deleted_at = NOW()`) hoặc phục hồi (`deleted_at = NULL`) thay vì hard delete như trước để bảo toàn liên kết dữ liệu.
  - **Đồng bộ trạng thái F5**: Nâng cấp [read_public.php](file:///C:/Users/thaib/du_an_code/revphp/be_php/api/posts/read_public.php) và [read_single.php](file:///C:/Users/thaib/du_an_code/revphp/be_php/api/posts/read_single.php) tích hợp `token_helper.php` để lấy trạng thái tương tác `liked` và `reposted` của user đang đăng nhập. Không báo lỗi 401 khi user chưa đăng nhập.
  - **Tab "Đã thích" trên Profile**: 
    - Tạo mới API [read_liked_posts.php](file:///C:/Users/thaib/du_an_code/revphp/be_php/api/users/read_liked_posts.php) (chỉ trả về danh sách cho chính chủ, trả 403 Forbidden nếu xem chéo).
    - Thêm tab "Đã thích" trong [UserProfile.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/pages/UserProfile.jsx) kèm nút Bỏ thích trực tiếp trên thẻ bài viết để cập nhật danh sách tức thời.
  - **Hỗ trợ ảnh inline Base64**: Thêm note hướng dẫn trong [CreatePost.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/pages/CreatePost.jsx), đồng thời cấu hình `{ ADD_DATA_URI_TAGS: ['img'] }` vào `DOMPurify.sanitize` ở `CreatePost.jsx` và `PostDetail.jsx` để ngăn trình duyệt chặn ảnh inline Base64.
  - **Backend create.php fallback**: Đọc cả tham số `tags` và `hashtags` gửi lên để đảm bảo lưu trữ tags chính xác.
  - **Đồng bộ hóa Database**: Cập nhật tệp [blog_db.sql](file:///C:/Users/thaib/du_an_code/revphp/blog_db.sql) thêm trường `deleted_at` vào bảng `reposts` để giữ đồng bộ 100% với DB live đã nâng cấp.

### Phase 5B - Khống chế kích thước ảnh inline, tăng size Icon tương tác & dọn dẹp baocao

> [!IMPORTANT]
> **Tóm tắt cốt lõi Phase 5B**:
> * **Đã fix ảnh inline quá to**: Sử dụng CSS khống chế chiều cao tối đa của ảnh inline (`max-height: 520px`) và tự động căn giữa mà không cần cài thêm thư viện resize phức tạp.
> * **Tăng icon Rating/Like/Repost**: Cải tiến giao diện trang chi tiết bài viết, tăng kích thước icon Rating (Stars) từ 16px lên 22px, Like/Repost từ 24px lên 28px và nút chứa lên w-14 h-14, đồng thời thiết kế màu nền active cùng bóng mờ cao cấp.
> * **Dọn thư mục `.planning/baocao` dư**: Xóa bỏ hoàn toàn thư mục dư thừa không ẩn `.planning/baocao/` và quy hoạch toàn bộ các file báo cáo về `.planning/.baocao/`.

* **Mục tiêu**: Polish toàn diện trải nghiệm đọc bài và khu vực tương tác Rating/Like/Repost.
* **Thay đổi chính**:
  - **Khống chế kích thước ảnh inline bằng CSS**: Để tránh hình ảnh inline Base64 quá khổ làm vỡ layout, thêm các thuộc tính CSS khống chế trong [index.css](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/index.css): `max-width: 100% !important`, `max-height: 520px !important`, `width: auto`, `height: auto`, `object-fit: contain` và căn lề giữa. Không dùng thư viện resize thủ công để tránh rủi ro biên dịch trên React 19/Vite.
  - **Đổi nhãn tương tác (PostDetail)**: Thay đổi nhãn thành **"Like"** và **"Repost"** để đồng bộ phong cách hiện đại.
  - **Tăng kích thước icon tương tác**:
    - Icon đánh giá sao (Rating): Tăng từ `16px` lên **`22px`** và tăng khoảng cách giãn sao (`space-x-1`).
    - Nút tương tác Like và Repost: Tăng kích thước nút từ `w-12 h-12` lên **`w-14 h-14`**, và biểu tượng bên trong từ `24px` lên **`28px`** (Heart/Repeat2).
  - **Nâng cấp nút Active**: Khi được active, nút Like chuyển sang nền đỏ (`bg-red-500`) và Repost sang xanh (`bg-green-600`), chữ trắng kèm đổ bóng mượt mà (`shadow-md shadow-red-500/20`).
  - **Dọn dẹp thư mục**: Xóa bỏ thư mục tạo nháp trùng lặp `.planning/baocao/`, quy hoạch toàn bộ báo cáo các phase gọn gàng về `.planning/.baocao/`.

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
| 9 | Lỗi Repost bị mất khi F5 | `read_public.php` và `read_single.php` không kiểm tra tương tác của người dùng hiện tại. | `read_public.php`, `read_single.php` | Tích hợp `get_auth_user()`, truy vấn động trạng thái `liked` và `reposted` theo session. | **Đã fix** |
| 10 | Thiếu mục bài viết đã thích | Chưa có tab hiển thị bài viết được thích cho chính chủ. | `UserProfile.jsx` | Tạo mới API `read_liked_posts.php` và thêm tab "Đã thích" cùng tính năng unlike động. | **Đã fix** |
| 11 | Lỗi hỏng ảnh inline Base64 | DOMPurify mặc định chặn giao thức data: URI của ảnh Base64. | `CreatePost.jsx`, `PostDetail.jsx` | Thêm tùy chọn `{ ADD_DATA_URI_TAGS: ['img'] }` vào hàm sanitize. | **Đã fix** |
| 12 | Ảnh inline quá to choán màn hình | Ảnh co giãn 100% chiều rộng container, gây vỡ tỷ lệ hiển thị. | `index.css` | Ràng buộc ảnh inline bằng CSS (`max-width: 100%`, `max-height: 520px`, căn giữa). | **Đã fix** |
| 13 | Nút tương tác Like/Repost nhỏ | Kích thước icon 20px, nút w-12 h-12 chưa đủ nổi bật, nhãn tiếng Việt chưa đồng bộ. | `PostDetail.jsx` | Đổi nhãn thành Like/Repost, tăng icon lên 22px/28px, nút lên w-14 h-14, làm mới active màu đậm đổ bóng. | **Đã fix** |
| 14 | Thư mục báo cáo dư thừa | Bị tạo nhầm thư mục không ẩn `.planning/baocao/` song song với thư mục ẩn `.planning/.baocao/`. | Thư mục `.planning/` | Đồng bộ toàn bộ tệp tin báo cáo về `.planning/.baocao/` và xóa sạch thư mục thừa. | **Đã fix** |

## 5. Danh sách file đã thay đổi

| File | Loại thay đổi | Nội dung chính | Ghi chú |
| :--- | :--- | :--- | :--- |
| [blog_db.sql](file:///C:/Users/thaib/du_an_code/revphp/blog_db.sql) | Schema SQL | Đồng bộ kiểu dữ liệu cột `posts.content` thành `MEDIUMTEXT` và thêm `deleted_at` vào bảng `reposts`. | Đồng bộ 100% database live. |
| [repost.php](file:///C:/Users/thaib/du_an_code/revphp/be_php/api/social/repost.php) | Backend PHP | Chuyển logic toggle repost sang soft delete / restore bằng trường `deleted_at`. | Tránh lỗi hard delete phá vỡ liên kết. |
| [read_public.php](file:///C:/Users/thaib/du_an_code/revphp/be_php/api/posts/read_public.php) | Backend PHP | Bổ dung trả về `liked` và `reposted` cho user đăng nhập hiện tại. | Không gây lỗi 401 cho guest. |
| [read_single.php](file:///C:/Users/thaib/du_an_code/revphp/be_php/api/posts/read_single.php) | Backend PHP | Bổ sung trả về `liked` và `reposted` cho user đăng nhập hiện tại trên trang đọc bài. | Không gây lỗi 401 cho guest. |
| [create.php](file:///C:/Users/thaib/du_an_code/revphp/be_php/api/posts/create.php) | Backend PHP | Phục hồi fallback đọc cả tham số `tags` và `hashtags` từ client gửi lên. | Hỗ trợ tương thích ngược. |
| [read_liked_posts.php](file:///C:/Users/thaib/du_an_code/revphp/be_php/api/users/read_liked_posts.php) | Backend PHP | API mới trả về danh sách các bài viết đã like của user, bảo vệ riêng tư 403. | `[NEW]` an toàn linter. |
| [UserProfile.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/pages/UserProfile.jsx) | Frontend Page | Tích hợp tab "Đã thích" cho chính chủ, hỗ trợ Unlike nhanh trực tiếp từ card. | Bảo lưu state an toàn. |
| [CreatePost.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/pages/CreatePost.jsx) | Frontend Page | Cấu hình `{ ADD_DATA_URI_TAGS: ['img'] }` cho DOMPurify, thêm tip hướng dẫn chèn nhiều ảnh inline. | Đã lột xác layout Soạn thảo/Xem trước. |
| [PostDetail.jsx](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/pages/PostDetail.jsx) | Frontend Page | Đổi nhãn Like/Repost, tăng kích thước icon Star (22px), Like/Repost (28px), nút tương tác (w-14 h-14) và màu solid active. | Cấu hình DOMPurify cho ảnh inline. |
| [index.css](file:///C:/Users/thaib/du_an_code/revphp/fe_react/src/index.css) | Frontend Styling | Thêm class ẩn thanh cuộn `.no-scrollbar` và ràng buộc kích thước ảnh inline tối đa `520px` đẹp mắt. | Tối ưu hóa UI tổng thể. |

## 6. Test đã chạy

1. **Kiểm tra biên dịch**: Chạy `cmd /c npm run build` trong thư mục [fe_react](file:///C:/Users/thaib/du_an_code/revphp/fe_react). Kết quả: Vite build hoàn tất thành công 100%, tạo ra các asset tĩnh tối ưu.
2. **PHP linter**: Chạy `php -l` cho mọi file PHP đã sửa đổi. Kết quả: Không phát hiện bất kỳ lỗi cú pháp PHP nào.
3. **Kiểm thử thủ công**:
   - Thao tác đăng nhập, thực hiện thích bài và repost -> các trạng thái được hiển thị chính xác ở Home Feed và PostDetail.
   - Khi F5/Reload trang -> các nút tương tác vẫn hiển thị đúng trạng thái Like/Repost mà không bị mất.
   - Thử chèn 2 ảnh Base64 trong Quill -> Ảnh hiển thị thu nhỏ vừa vặn ở preview và bài đọc sau xuất bản, không làm biến dạng giao diện.
   - Vào Profile -> Tab "Đã thích" hiển thị đúng các bài viết đã like, nhấp bỏ thích -> Bài viết biến mất ngay lập tức và số đếm giảm chuẩn xác.
   - Xóa thư mục báo cáo dư `baocao/` -> Repo sạch sẽ, chỉ còn lại các thư mục chuẩn `.planning/.baocao/`, `.planning/.tiendo/`, `.planning/.loidagap/`.

## 7. Những điểm Gemini cần cực kỳ lưu ý

* **Không làm mất `uid` băm**: Luôn giữ đồng bộ `uid` băm trên URL để tránh làm sai lệch logic ownership trên Profile.
* **Quyền hạn riêng tư**: Tab "Đã thích" và API `read_liked_posts.php` chỉ mở đối với chính chủ profile. Giữ vững kiểm tra ID ở backend để tránh rò rỉ dữ liệu.
* **Kích thước ảnh inline**: Ảnh inline trong Quill được khống chế chiều rộng container và chiều cao tối đa `520px` bằng CSS trong `index.css`. Tránh tùy biến làm vỡ tỷ lệ co giãn ảnh.
* **Giao diện active của nút tương tác**: Các nút Like và Repost khi active sử dụng các lớp màu solid đậm kèm shadow (`shadow-md shadow-red-500/20`), đảm bảo trực quan và thu hút điểm nhìn.

## 8. Việc nên làm tiếp theo

1. **Kiểm tra giao diện di động**: Nhờ người dùng test thử nghiệm giao diện vuốt categories ngang và tương tác Like/Repost trên màn hình di động/tablet.
2. **Phát triển module upload ảnh inline production**: Trong tương lai, nâng cấp Quill editor từ nhúng base64 sang gọi API tải ảnh tĩnh lưu trực tiếp lên đĩa vật lý của Server.

## 9. Tình trạng hiện tại để Gemini tiếp tục

Dự án hiện đã hoàn tất thành công tất cả các Phase từ Phase 2 đến Phase 5B. Các lỗi nghiêm trọng về logic đăng lại (repost), khôi phục trạng thái like/repost sau F5, thiếu tab bài viết đã thích riêng tư, và hiển thị ảnh inline Base64 quá khổ đã được giải quyết hoàn mỹ. Khu vực tương tác bài viết (Rating, Like, Repost) được thiết kế lại to, rõ, cực kỳ bắt mắt và chuyên nghiệp. Build React production chạy mượt mà không có lỗi.

Gemini có thể tiếp tục nhận phản hồi từ khách hàng và hỗ trợ mở rộng thêm các tính năng nâng cao tùy ý.
