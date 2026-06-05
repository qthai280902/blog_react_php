<div align="center">

# 🚀 MyBlog

### Blog & Social Platform — Nền tảng viết bài, chia sẻ kiến thức và tương tác cộng đồng

<p>
  <img src="https://img.shields.io/badge/Frontend-React_19-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-PHP_8.2+-777BB4?style=for-the-badge&logo=php" />
  <img src="https://img.shields.io/badge/Database-MySQL/MariaDB-4479A1?style=for-the-badge&logo=mysql" />
  <img src="https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite" />
</p>

<p>
  <b>Write. Share. Connect.</b>
</p>

</div>

---

## 📌 Giới thiệu

**MyBlog** là một nền tảng blog kết hợp mạng xã hội, cho phép người dùng viết bài, chia sẻ kiến thức, theo dõi tác giả, tương tác bằng Like/Repost/Comment/Rating và xây dựng hồ sơ cá nhân.

Dự án được xây dựng theo mô hình tách riêng Frontend và Backend:

* **Frontend:** React + Vite + Tailwind CSS
* **Backend:** PHP thuần dạng REST API
* **Database:** MySQL/MariaDB
* **UI:** Blog/News portal hiện đại với trang chủ dạng magazine layout

---

## ✨ Tính năng nổi bật

### 👤 Tài khoản & phân quyền

* Đăng ký, đăng nhập người dùng.
* Mật khẩu được hash an toàn.
* Phân quyền:

  * `admin`
  * `user`
* Người dùng chỉ được chỉnh sửa hồ sơ của chính mình.
* Backend có kiểm tra quyền để chặn sửa chéo profile.

---

### 🧑‍💻 Trang cá nhân

Profile người dùng hỗ trợ:

* Avatar
* Ảnh bìa
* Tên hiển thị
* Số bài viết
* Số follower/following
* Danh sách bài đã đăng
* Danh sách bài đã Repost
* Danh sách bài đã Like
* Thùng rác bài viết nếu là chính chủ

Cơ chế đổi tên có cooldown **7 ngày**:

* Trong thời gian cooldown: không đổi được tên.
* Vẫn đổi được avatar.
* Vẫn đổi được ảnh bìa.

---

### 🏆 Follow & cúp nổi tiếng

MyBlog có hệ thống theo dõi giữa người dùng.

Số follower được lưu thật trong bảng `follows`, dùng để kiểm thử hệ thống cúp nổi tiếng.

| Tài khoản | Followers | Mục đích                    |
| --------- | --------: | --------------------------- |
| `user10k` |    10.001 | Test cúp cấp cao            |
| `user1k`  |     1.001 | Test cúp cấp trung          |
| `user100` |       101 | Test cúp cấp thấp           |
| `user1`   |         0 | Test tài khoản không có cúp |

---

### 📝 Viết bài

Người dùng có thể tạo bài viết với:

* Tiêu đề
* Tags/hashtags
* Ảnh bìa
* Nội dung rich text
* Nhiều ảnh inline trong bài viết
* Tab **Soạn thảo**
* Tab **Xem trước**

Ảnh inline hiện được lưu dạng Base64 trong nội dung bài viết. Cột `posts.content` đã được nâng lên `MEDIUMTEXT` để hỗ trợ nội dung lớn hơn.

> Lưu ý: Base64 inline image phù hợp cho demo/local. Nếu triển khai production, nên nâng cấp sang upload ảnh thành file và chèn URL vào bài viết.

---

### ❤️ Tương tác bài viết

MyBlog hỗ trợ:

* Like
* Repost
* Comment
* Rating sao
* Giữ trạng thái Like/Repost sau khi F5
* Tab bài viết đã thích trong profile

Nếu người dùng chưa đăng nhập, hệ thống vẫn cho xem bài viết bình thường, trạng thái Like/Repost mặc định là `false`.

---

### 🔁 Repost

Repost hoạt động theo cơ chế toggle:

* Chưa Repost → tạo Repost.
* Đã Repost → soft delete bằng `deleted_at`.
* Đã từng Repost nhưng đã soft delete → restore lại.

Tab Repost trong profile hiển thị các bài người dùng đã đăng lại.

---

### 🔎 Search & Tag Filter

* Search nằm trên Navbar.
* Search đồng bộ với URL, ví dụ:

```txt
/?q=react
```

* Thanh tag/category ngang hỗ trợ lọc bài theo chủ đề.
* Có thể search từ trang chủ, trang viết bài hoặc profile; hệ thống tự điều hướng về feed chính.

---

### 🎨 Giao diện Blog/News Portal

Giao diện MyBlog được thiết kế theo hướng hiện đại:

* Navbar sticky
* Search bar trung tâm
* Category/tag bar ngang
* Trang chủ dạng magazine layout:

  * Hero post lớn
  * Highlight posts
  * News row list
* Sidebar:

  * Từ khóa hot
  * Bài viết đọc nhiều
  * CTA viết bài
* PostDetail sáng màu, dễ đọc
* Comment box gọn gàng
* Footer 4 cột
* Responsive cơ bản cho desktop, tablet và mobile

---

## 🛠️ Công nghệ sử dụng

### Frontend

* React 19
* Vite
* Tailwind CSS
* React Router
* Axios
* React Hot Toast
* Quill Editor
* DOMPurify
* Lucide React Icons

### Backend

* PHP 8.2+
* REST API PHP thuần
* PDO MySQL
* Password Hashing
* Token helper nội bộ

### Database

* MySQL / MariaDB
* Schema chính: `blog_db.sql`

---

## 📂 Cấu trúc thư mục

```txt
react-php/
├── be_php/
│   ├── api/
│   │   ├── auth/
│   │   ├── posts/
│   │   ├── users/
│   │   └── social/
│   ├── config/
│   └── uploads/
│
├── fe_react/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   └── pages/
│   └── package.json
│
├── .planning/
│   ├── .baocao/
│   ├── .tiendo/
│   └── .loidagap/
│
└── blog_db.sql
```

---

## ⚙️ Cài đặt dự án

### 1. Clone repository

```bash
git clone https://github.com/qthai280902/react-php.git
cd react-php
```

Hoặc nếu muốn clone về thư mục `revphp`:

```bash
git clone https://github.com/qthai280902/react-php.git revphp
cd revphp
```

---

### 2. Tạo database

Tạo database tên `blog_db`:

```sql
CREATE DATABASE blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Import schema:

```bash
mysql -u root -p blog_db < blog_db.sql
```

Hoặc import file `blog_db.sql` bằng phpMyAdmin.

---

### 3. Cấu hình Backend

Mở file:

```txt
be_php/config/database.php
```

Cấu hình lại thông tin kết nối database theo máy local:

```php
$host = 'localhost';
$dbname = 'blog_db';
$username = 'root';
$password = '';
```

Nếu dùng XAMPP mặc định, mật khẩu MySQL thường để trống.

---

### 4. Chạy Frontend

```bash
cd fe_react
npm install
npm run dev
```

Build production:

```bash
npm run build
```

Trên Windows, nếu PowerShell chặn script, dùng:

```bash
cmd /c npm run build
```

---

### 5. Chạy Backend

Backend PHP chạy qua Apache/XAMPP hoặc server PHP local.

Ví dụ nếu đặt repo trong `htdocs/react-php`, API sẽ có dạng:

```txt
http://localhost/react-php/be_php/api/...
```

Frontend cần cấu hình base URL API đúng với đường dẫn backend local.

---

## 🧪 Dữ liệu test cuối

Dự án có script reset dữ liệu test cuối:

```txt
be_php/config/reset_final_test_data.php
```

Script này dùng để:

* Xóa sạch dữ liệu cũ.
* Xóa bài viết, like, repost, comment, rating, tags cũ.
* Tạo lại tài khoản admin.
* Tạo lại user test follower.
* Tạo follower bot thật trong bảng `follows`.
* Dùng để kiểm thử hệ thống cúp nổi tiếng.

Chạy script:

```bash
php be_php/config/reset_final_test_data.php
```

> Cảnh báo: Script này chỉ dùng cho local/dev. Không chạy trên production.

---

## 👤 Tài khoản test

Sau khi chạy script reset dữ liệu test cuối, có thể đăng nhập bằng các tài khoản sau.

### Admin

| Username | Password | Role  |
| -------- | -------- | ----- |
| `admin1` | `123456` | admin |
| `admin2` | `123456` | admin |

### User

| Username  | Password | Followers |
| --------- | -------- | --------: |
| `user10k` | `123456` |    10.001 |
| `user1k`  | `123456` |     1.001 |
| `user100` | `123456` |       101 |
| `user1`   | `123456` |         0 |

---

## 🧰 Script hỗ trợ

### Backup database

```txt
be_php/config/backup_db.php
```

Dùng để sao lưu database trước khi reset dữ liệu.

### Reset dữ liệu test

```txt
be_php/config/reset_final_test_data.php
```

Dùng để tạo lại dữ liệu sạch phục vụ test cuối.

> Không chạy các script này trên production.

---

## 🔌 API tiêu biểu

### Auth

```txt
POST /api/auth/login.php
POST /api/auth/register.php
```

### User/Profile

```txt
POST /api/users/update_profile.php
GET  /api/users/read_user_posts.php
GET  /api/users/read_reposts.php
GET  /api/users/read_liked_posts.php
```

### Posts

```txt
GET  /api/posts/read_public.php
GET  /api/posts/read_single.php
POST /api/posts/create.php
```

### Social

```txt
POST /api/social/repost.php
```

Tùy cấu hình local, đường dẫn đầy đủ có thể là:

```txt
http://localhost/react-php/be_php/api/...
```

---

## ✅ Kiểm tra nhanh

### PHP syntax

```bash
php -l be_php/api/posts/create.php
php -l be_php/api/posts/read_public.php
php -l be_php/api/posts/read_single.php
php -l be_php/api/social/repost.php
php -l be_php/api/users/update_profile.php
php -l be_php/api/users/read_liked_posts.php
```

### Frontend build

```bash
cd fe_react
cmd /c npm run build
```

---

## 🧪 Checklist test cuối

Sau khi reset dữ liệu, nên kiểm tra:

```txt
[ ] Login được admin1/admin2
[ ] Login được user10k/user1k/user100/user1
[ ] Cúp nổi tiếng hiển thị đúng theo follower
[ ] Trang chủ không lỗi khi chưa có bài viết
[ ] Tạo bài viết mới được
[ ] Bài viết có ảnh bìa hiển thị đúng
[ ] Bài viết có nhiều ảnh inline hiển thị đúng
[ ] Like hoạt động và giữ trạng thái sau F5
[ ] Repost hoạt động và giữ trạng thái sau F5
[ ] Comment hoạt động
[ ] Rating hoạt động
[ ] Tab Đã thích trong profile hoạt động
[ ] Tab Repost trong profile hoạt động
[ ] Profile chính chủ chỉnh sửa được avatar/cover
[ ] Profile người khác không chỉnh sửa được
[ ] Search Navbar hoạt động
[ ] Tag/category filter hoạt động
[ ] Responsive không vỡ nặng
```

---

## 🗂️ Tài liệu tiến độ

Tài liệu theo dõi dự án nằm trong:

```txt
.planning/
├── .baocao/
├── .tiendo/
└── .loidagap/
```

Trong đó:

* `.planning/.baocao/`: báo cáo theo từng phase.
* `.planning/.tiendo/TIEN_DO_DU_AN.md`: tiến độ tổng thể.
* `.planning/.loidagap/LOI_DA_GAP.md`: lỗi đã gặp và cách xử lý.

---

## 📌 Trạng thái hiện tại

Dự án đã hoàn thành các nhóm chính:

* Sửa lỗi login và đồng bộ schema.
* Sửa lỗi profile ownership và mất `uid`.
* Sửa cooldown đổi tên.
* Sửa avatar/cover bị khóa nhầm.
* Nâng cấp giao diện blog/news portal.
* Sửa Like/Repost.
* Thêm tab Đã thích.
* Hỗ trợ nhiều ảnh inline trong bài viết.
* Reset dữ liệu test cuối để kiểm tra cúp nổi tiếng.

Trạng thái hiện tại phù hợp để test tổng thể lần cuối trên môi trường local/dev.

---

## ⚠️ Lưu ý bảo mật và vận hành

* Không chạy script reset database trên production.
* Không commit file backup database nếu chứa dữ liệu thật.
* Không lưu mật khẩu plain text trong database.
* Không dùng Base64 inline image lâu dài nếu triển khai production.
* Nên nâng cấp upload ảnh inline thành file URL trong phiên bản sau.

---

## 📄 Giấy phép

Dự án phục vụ mục đích học tập, thực hành và phát triển nội bộ.

---

<div align="center">

### MyBlog

<i>Write. Share. Connect.</i>

</div>
