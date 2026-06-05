# TIẾN ĐỘ DỰ ÁN

## Tổng quan
- Tên dự án: MyBlog (PHP Backend + React Frontend)
- Ngày cập nhật gần nhất: 05/06/2026
- Trạng thái hiện tại: Hoàn thành Hotfix Phase 7D (Trash 100%, Xóa bình luận 100%, CORS 100%)

## Danh sách phase

| Phase | Ngày | Mục tiêu | Trạng thái | Ghi chú |
|---|---|---|---|---|
| Phase 1 | - | ... | Hoàn tất | |
| Phase 2 | 04/06/2026 | Sửa logic trang cá nhân + Redesign giao diện Profile/Home/CreatePost | **Hoàn tất** | Fix triệt để bug logic uid/id; Redesign giao diện hiện đại mượt mà |
| Phase 3 | 04/06/2026 | Fix lỗi Media Lock, Redesign Editor & Bố cục Home tạp chí | **Hoàn tất** | Cho phép đổi avatar/cover khi bị khóa tên; Viết bài có Live Preview; Trang chủ có Hero Post & Sidebar bài viết hot |
| Phase 4 | 04/06/2026 | Redesign toàn bộ giao diện theo hướng blog/news portal | **Hoàn tất** | Cải tổ bố cục trang chủ tạp chí, đồng bộ Navbar, PostDetail, UserProfile |
| Phase 5 | 04/06/2026 | Sửa lỗi Repost, Tab Đã thích, Đăng nhiều ảnh, Responsive | **Hoàn tất** | Sửa logic toggle repost, thêm tab Đã thích riêng tư, cho phép hiển thị ảnh inline Base64, responsive no-scrollbar |
| Phase 5B | 04/06/2026 | Polish giao diện ảnh inline và khu tương tác Like/Repost | **Hoàn tất** | Khống chế kích thước ảnh inline bằng CSS; Cập nhật label "Like"/"Repost", phóng to icon và làm mới nút active |
| Phase 6 | 04/06/2026 | Reset dữ liệu test cuối cùng | **Hoàn tất** | Dọn dẹp sạch database và tạo bộ tài khoản test với follower bot thật |
| Phase 7 | 05/06/2026 | Hoàn thiện content flow, Trash, Comments, Notifications & Admin | **Hoàn tất** | Bổ sung Excerpt, fix Trash ID decoding, comment lồng 1 cấp & phân quyền xóa, chuông thông báo (Bell dropdown), Server-side pagination Admin, và polish nút bấm. |
| Phase 7B | 05/06/2026 | Hotfix sau test Phase 7 (Nút đen, Trash, Comments, Notifications) | **Hoàn tất** | Khắc phục các lỗi nút đen, thùng rác không đồng bộ count, xóa bình luận bị chặn FK, logic reply 1 lần và redesign dropdown UI thông báo. |
| Phase 7C | 05/06/2026 | Hotfix Bắt buộc: Trash 0% + Delete Comment 0% | **Hoàn tất** | Khắc phục triệt để lỗi Thùng rác (sửa logic check isOwnProfile hỗ trợ cả URL ID số/chữ băm và load token động) và lỗi Xóa bình luận (bảo vệ PHP input tránh warning). |
| Phase 7D | 05/06/2026 | Hotfix Thực tế: CORS Delete Comment + Trash.php Response 0B | **Hoàn tất** | Khắc phục triệt để lỗi CORS preflight bằng cách di chuyển include database.php lên đầu và gỡ bỏ exit sớm. |

## Việc đã hoàn thành
- [x] Loại bỏ hoàn toàn các nút/tab màu đen còn sót ở Navbar dropdown, UserProfile tabs, EditProfileModal và ConfirmModal.
- [x] Khắc phục lỗi Thùng rác: gọi fetchTrash() ở mount, load lại thùng rác sau khi soft-delete/khôi phục/xóa vĩnh viễn, truyền tham số item_type cho repost.
- [x] Khắc phục lỗi Xóa bình luận: cập nhật comments/delete.php xóa tuần tự thông báo và các reply con trước khi xóa comment để tránh lỗi foreign key constraint.
- [x] Khắc phục lỗi Phản hồi bình luận: sửa crash 500 khi thông báo, đồng thời hiển thị avatar thật của commenter.
- [x] Thiết kế lại giao diện comment replies: thụt lề, có viền xanh dương trái, nền xám nhạt và nhãn "Phản hồi".
- [x] Polish dropdown chuông thông báo: nâng width lên 380px, đổi tab sang dạng pill nền xám/active trắng shadow, hiển thị badge số unread có nhịp đập, làm mịn scrollbar.
- [x] Chạy build frontend Vite (npm run build) và lint backend PHP (php -l) thành công.
- [x] Chạy script PHP CLI `reset_final_test_data.php` để dọn sạch database và seed 10,001 follower bot thật cho các tài khoản test.
- [x] Tạo file backup an toàn trước khi reset dữ liệu: `.planning/blog_db_backup_04-06-2026.sql`.
- [x] Tạo bộ tài khoản test chuẩn xác: `admin1`/`admin2` (admin), `user10k` (10,001 followers), `user1k` (1,001 followers), `user100` (101 followers), `user1` (0 followers) với mật khẩu hash của `123456`.
- [x] Tăng kích thước các biểu tượng đánh giá sao (22px), trái tim Like (28px), Repost (28px) và nút tương tác (w-14 h-14) trong `PostDetail.jsx`.
- [x] Khống chế kích thước hình ảnh inline trong `.rich-text-content` và `.ql-editor` qua CSS để an toàn và đẹp mắt.
- [x] Đổi nhãn tương tác thành "Like" và "Repost", nâng kích thước icon trong `PostDetail.jsx`.
- [x] Thiết kế UI nút Like/Repost trạng thái active dạng solid màu rực rỡ kèm đổ bóng thời thượng.
- [x] Dọn dẹp các thư mục báo cáo dư thừa, gom toàn bộ về thư mục chuẩn `.planning/.baocao/`.
- [x] Đồng bộ hóa `blog_db.sql` và DB live thêm cột `deleted_at` vào bảng `reposts`.
- [x] Cải tiến API `repost.php` toggle bằng soft delete / restore.
- [x] Nâng cấp `read_public.php` và `read_single.php` tự động nhận diện và trả về trạng thái `liked`/`reposted` của user.
- [x] Tạo API `read_liked_posts.php` để lấy danh sách bài viết đã thích riêng tư cho chính chủ.
- [x] Cập nhật tab "Đã thích" trong profile cùng tính năng unlike động ngay trên tab card.
- [x] Hỗ trợ và hướng dẫn đăng bài có nhiều hình ảnh inline Base64 qua editor Quill và DOMPurify.
- [x] Sửa logic backend `update_profile.php` trả về `uid` băm đầy đủ và chặn quyền sửa chéo (trả lỗi 403).
- [x] Sửa frontend `AuthContext.jsx` để bảo lưu `uid` băm tránh bị ghi đè thành id số.
- [x] Đồng bộ thông tin form và kiểm soát quyền sở hữu chặt chẽ ở modal `EditProfileModal.jsx`.
- [x] Redesign layout Home (`PostList.jsx`) sang dạng list card mượt mà, tối giản hóa search & sort.
- [x] Redesign layout Profile (`UserProfile.jsx`) cân đối ảnh bìa, avatar, căn chỉnh stats và tối ưu giao diện tab.
- [x] Redesign Sidebar (`Sidebar.jsx`) với các chip tag hiện đại và icon Lucide.
- [x] Redesign trang viết bài (`CreatePost.jsx`) tập trung tiêu điểm soạn thảo, hỗ trợ preview và xóa ảnh bìa vừa chọn.
- [x] Fix lỗi khóa submit avatar/cover trong cooldown tại `EditProfileModal.jsx`.
- [x] Nâng cấp `CreatePost.jsx` thành giao diện soạn thảo kiêm Xem trước (Live Preview) mượt mà không mất trạng thái Quill.
- [x] Bố cục trang chủ `PostList.jsx` với Hero Post nổi bật ở trang đầu tiên.
- [x] `Sidebar.jsx` tự động fetch bài viết Hot làm danh sách "Bài viết đọc nhiều" động.
- [x] Tích hợp thanh chủ đề ngang (categories) và footer 4 cột chuyên nghiệp trong `PublicLayout.jsx`.
- [x] Đưa thanh tìm kiếm tập trung vào giữa Header tại `Navbar.jsx` và đồng bộ với URL query parameter `q`.
- [x] Tổ chức lại `PostList.jsx` chia khối Hero Post và Stacked Highlights ở trang đầu, kết hợp feed rows gọn gàng.
- [x] Refine giao diện đọc bài `PostDetail.jsx` với khối bình luận sáng màu đồng điệu và thu nhỏ các widget tương tác.
- [x] Cải tiến giao diện cá nhân `UserProfile.jsx` bổ sung ảnh thu nhỏ (thumbnail) cho danh sách bài viết.
- [x] Đã tạo tệp báo cáo bàn giao chi tiết cho Gemini: `.planning/.baocao/bao-cao-ban-giao-cho-gemini-04-06-2026.md`
- [x] Khắc phục lỗi CORS preflight trên comments/delete.php bằng cách di chuyển database.php include lên đầu.
- [x] Khắc phục lỗi trash.php response 0B bằng cách đồng bộ preflight OPTIONS và CORS headers.
- [x] Đưa tất cả các include liên quan về dạng absolute sử dụng __DIR__ để loại bỏ rủi ro về CWD.

## Việc đang làm
- Không có.

## Ghi chú quan trọng
- Luôn sử dụng `encodeId` ở Backend để giữ đồng bộ dữ liệu `uid` dạng băm trên URL và trong LocalStorage.
- Ở Frontend, `AuthContext` đã được gia cố để bảo vệ trạng thái `uid` không bị suy biến thành số nguyên.
- Trình soạn thảo Quill hỗ trợ chèn ảnh inline tự động nén dạng base64, lưu trữ an toàn trong DB với trường content dạng `MEDIUMTEXT`.


