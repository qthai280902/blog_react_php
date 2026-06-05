-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th4 17, 2026 lúc 11:43 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `blog_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `comments`
--

INSERT INTO `comments` (`id`, `user_id`, `post_id`, `content`, `created_at`) VALUES
(1, 3, 1, 'hay quá admin ơi\n', '2026-04-10 15:05:33'),
(2, 2, 3, 'hay quá em ôi', '2026-04-14 20:36:14'),
(3, 5, 27, 'Bài viết rất hữu ích, cảm ơn tác giả!', '2026-04-14 19:49:44'),
(4, 6, 39, 'Mình đã áp dụng thành công, performance tăng rõ rệt.', '2026-04-14 18:49:44'),
(5, 7, 30, 'PHP 8.3 thật sự ấn tượng, đặc biệt là typed constants!', '2026-04-14 17:49:44'),
(6, 9, 43, 'hay\n', '2026-04-14 22:36:45'),
(9, 10211, 55, 'đây là con iphone rất ngon của năm 2023\n', '2026-04-15 10:37:44');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `follows`
--

CREATE TABLE `follows` (
  `follower_id` int(11) NOT NULL,
  `following_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `follows`
--

INSERT INTO `follows` (`follower_id`, `following_id`, `created_at`) VALUES
(2, 1, '2026-04-10 15:16:54'),
(3, 1, '2026-04-10 15:54:45'),
(5, 4, '2026-04-14 20:49:44'),
(6, 4, '2026-04-14 20:49:44'),
(7, 5, '2026-04-14 20:49:44'),
(8, 6, '2026-04-14 20:49:44'),
(11, 10, '2026-04-14 22:39:02'),
(12, 10, '2026-04-14 22:39:02'),
(13, 10, '2026-04-14 22:39:02'),
(14, 10, '2026-04-14 22:39:02'),
(15, 10, '2026-04-14 22:39:02'),
(16, 10, '2026-04-14 22:39:02'),
(17, 10, '2026-04-14 22:39:02'),
(18, 10, '2026-04-14 22:39:02'),
(19, 10, '2026-04-14 22:39:02'),
(20, 10, '2026-04-14 22:39:02'),
(21, 10, '2026-04-14 22:39:02'),
(22, 10, '2026-04-14 22:39:02'),
(23, 10, '2026-04-14 22:39:02'),
(24, 10, '2026-04-14 22:39:02'),
(25, 10, '2026-04-14 22:39:02'),
(26, 10, '2026-04-14 22:39:02'),
(27, 10, '2026-04-14 22:39:02'),
(28, 10, '2026-04-14 22:39:02'),
(29, 10, '2026-04-14 22:39:02'),
(30, 10, '2026-04-14 22:39:02'),
(31, 10, '2026-04-14 22:39:02'),
(32, 10, '2026-04-14 22:39:02'),
(33, 10, '2026-04-14 22:39:02'),
(34, 10, '2026-04-14 22:39:02'),
(35, 10, '2026-04-14 22:39:02'),
(36, 10, '2026-04-14 22:39:02'),
(37, 10, '2026-04-14 22:39:02'),
(38, 10, '2026-04-14 22:39:02'),
(39, 10, '2026-04-14 22:39:02'),
(40, 10, '2026-04-14 22:39:02'),
(41, 10, '2026-04-14 22:39:02'),
(42, 10, '2026-04-14 22:39:02'),
(43, 10, '2026-04-14 22:39:02'),
(44, 10, '2026-04-14 22:39:02'),
(45, 10, '2026-04-14 22:39:02'),
(46, 10, '2026-04-14 22:39:02'),
(47, 10, '2026-04-14 22:39:02'),
(48, 10, '2026-04-14 22:39:02'),
(49, 10, '2026-04-14 22:39:02'),
(50, 10, '2026-04-14 22:39:02'),
(51, 10, '2026-04-14 22:39:02'),
(52, 10, '2026-04-14 22:39:02'),
(53, 10, '2026-04-14 22:39:02'),
(54, 10, '2026-04-14 22:39:02'),
(55, 10, '2026-04-14 22:39:02'),
(56, 10, '2026-04-14 22:39:02'),
(57, 10, '2026-04-14 22:39:02'),
(58, 10, '2026-04-14 22:39:02'),
(59, 10, '2026-04-14 22:39:02'),
(60, 10, '2026-04-14 22:39:02'),
(61, 10, '2026-04-14 22:39:02'),
(62, 10, '2026-04-14 22:39:02'),
(63, 10, '2026-04-14 22:39:02'),
(64, 10, '2026-04-14 22:39:02'),
(65, 10, '2026-04-14 22:39:02'),
(66, 10, '2026-04-14 22:39:02'),
(67, 10, '2026-04-14 22:39:02'),
(68, 10, '2026-04-14 22:39:02'),
(69, 10, '2026-04-14 22:39:02'),
(70, 10, '2026-04-14 22:39:02'),
(71, 10, '2026-04-14 22:39:02'),
(72, 10, '2026-04-14 22:39:02'),
(73, 10, '2026-04-14 22:39:02'),
(74, 10, '2026-04-14 22:39:02'),
(75, 10, '2026-04-14 22:39:02'),
(76, 10, '2026-04-14 22:39:02'),
(77, 10, '2026-04-14 22:39:02'),
(78, 10, '2026-04-14 22:39:02'),
(79, 10, '2026-04-14 22:39:02'),
(80, 10, '2026-04-14 22:39:02'),
(81, 10, '2026-04-14 22:39:02'),
(82, 10, '2026-04-14 22:39:02'),
(83, 10, '2026-04-14 22:39:02'),
(84, 10, '2026-04-14 22:39:02'),
(85, 10, '2026-04-14 22:39:02'),
(86, 10, '2026-04-14 22:39:02'),
(87, 10, '2026-04-14 22:39:02'),
(88, 10, '2026-04-14 22:39:02'),
(89, 10, '2026-04-14 22:39:02'),
(90, 10, '2026-04-14 22:39:02'),
(91, 10, '2026-04-14 22:39:02'),
(92, 10, '2026-04-14 22:39:02'),
(93, 10, '2026-04-14 22:39:02'),
(94, 10, '2026-04-14 22:39:02'),
(95, 10, '2026-04-14 22:39:02'),
(96, 10, '2026-04-14 22:39:02'),
(97, 10, '2026-04-14 22:39:02'),
(98, 10, '2026-04-14 22:39:02'),
(99, 10, '2026-04-14 22:39:02'),
(100, 10, '2026-04-14 22:39:02'),
(101, 10, '2026-04-14 22:39:02'),
(102, 10, '2026-04-14 22:39:02'),
(103, 10, '2026-04-14 22:39:02'),
(104, 10, '2026-04-14 22:39:02'),
(105, 10, '2026-04-14 22:39:02'),
(106, 10, '2026-04-14 22:39:02'),
(107, 10, '2026-04-14 22:39:02'),
(108, 10, '2026-04-14 22:39:02'),
(109, 10, '2026-04-14 22:39:02'),
(110, 10, '2026-04-14 22:39:02');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `likes`
--

CREATE TABLE `likes` (
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `likes`
--

INSERT INTO `likes` (`user_id`, `post_id`, `created_at`) VALUES
(2, 1, '2026-04-10 15:12:40'),
(2, 2, '2026-04-10 15:12:41'),
(2, 3, '2026-04-10 15:25:58'),
(3, 3, '2026-04-12 07:23:11'),
(3, 4, '2026-04-12 09:56:49'),
(3, 7, '2026-04-10 15:55:06'),
(6, 27, '2026-04-14 20:49:44'),
(7, 27, '2026-04-14 20:49:44'),
(8, 30, '2026-04-14 20:49:44');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` mediumtext NOT NULL,
  `excerpt` text DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `is_hidden` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `posts`
--

INSERT INTO `posts` (`id`, `user_id`, `title`, `content`, `cover_image`, `is_hidden`, `deleted_at`, `created_at`) VALUES
(1, 1, 'Bài viết đầu tiên của tôi', 'Xin chào mọi người, đây là bài viết test từ hệ thống Database chuẩn.', NULL, 0, NULL, '2026-04-09 17:25:20'),
(2, 1, 'Học React và PHP REST API', 'Kiến trúc Decoupled thực sự rất mạnh mẽ và dễ mở rộng!', NULL, 0, NULL, '2026-04-09 17:25:20'),
(3, 1, 'Lộ trình trở thành Fullstack Developer 2024', 'Chia sẻ con đường từ con số 0 đến khi có thể xây dựng ứng dụng web hoàn chỉnh...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(4, 1, 'Tại sao nên chọn React cho dự án khởi nghiệp?', 'React giúp tăng tốc độ phát triển và tối ưu hiệu năng cho các ứng dụng single-page...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(5, 1, 'Tối ưu Query MySQL cho hệ thống lớn', 'Các kỹ thuật đánh Index và tối ưu hóa câu lệnh SELECT giúp giảm tải cho server...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(6, 1, 'Hướng dẫn sử dụng Eloquent trong Laravel', 'Eloquent ORM là một công cụ mạnh mẽ trong Laravel giúp xử lý database cực kỳ đơn giản...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(7, 1, '10 Tips viết JavaScript sạch (Clean Code)', 'Viết code không chỉ để chạy được, mà còn để đồng nghiệp có thể đọc và bảo trì...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(8, 1, 'So sánh PHP 8.3 và những cải tiến mới', 'PHP vẫn đang sống tốt và mạnh mẽ hơn bao giờ hết với phiên bản 8.3 mới nhất...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(9, 1, 'Tương lai của Frontend: Server Components', 'Khám phá cách thức Next.js và React Server Components thay đổi cuộc chơi...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(10, 1, 'Kiến trúc Microservices với Node.js và PHP', 'Cách kết hợp nhiều ngôn ngữ trong một hệ sinh thái backend linh hoạt...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(11, 1, 'Làm chủ CSS Grid và Flexbox trong 15 phút', 'Web design hiện đại không thể thiếu bộ đôi quyền lực này để dàn trang chuẩn...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(12, 1, 'Bảo mật ứng dụng Web chống lại tấn công SQL Injection', 'Những nguyên tắc vàng để bảo vệ dữ liệu khách hàng an toàn tuyệt đối...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(13, 1, 'Xây dựng REST API chuẩn với Laravel 11', 'Làm quen với cấu trúc thư mục tối giản và mạnh mẽ của Laravel phiên bản 11...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(14, 1, 'Tại sao JavaScript vẫn là vua của ngành Web?', 'Dù có bao nhiêu ngôn ngữ mới ra đời, JS vẫn giữ vững vị thế không thể thay thế...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(15, 1, 'Thiết kế Database cho hệ thống thương mại điện tử', 'Cách thức thiết kế bảng sản phẩm, đơn hàng và quản lý kho hiệu quả...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(16, 1, 'Frontend Performance: Tối ưu LCP và CLS', 'Làm thế nào để trang web của bạn đạt điểm 100/100 trên Google PageSpeed...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(17, 1, 'PHP Laravel: Xử lý Queue và Background Job', 'Giải phóng tài nguyên cho request bằng cách đẩy các tác vụ nặng vào hàng đợi...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(18, 1, 'React Hooks: Luôn dùng đúng, đừng dùng sai', 'Hiểu sâu về useEffect và useMemo để tránh lỗi render vòng lặp vô tận...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(19, 1, 'Webdev: Cách chọn Hosting và VPS phù hợp', 'Đừng lãng phí tiền vào những cấu hình không cần thiết khi mới bắt đầu...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(20, 1, 'Javascript Async/Await: Xử lý bất đồng bộ', 'Không còn nỗi lo \"Callback Hell\" với cú pháp hiện đại và dễ hiểu hơn...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(21, 1, 'Sử dụng Tailwind CSS để thiết kế UI nhanh chóng', 'Tailwind mang lại sự linh hoạt tối đa mà không cần viết quá nhiều dòng CSS thuần...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(22, 1, 'Database Indexing: Khi nào nên dùng và không nên dùng', 'Index là con dao hai lưỡi, hãy cùng tìm hiểu cách sử dụng thông minh...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(23, 1, 'Laravel Middleware: Chặn lọc request thông minh', 'Tạo ra các lớp bảo vệ và tiền xử lý dữ liệu trước khi vào Controller...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(24, 1, 'Backend Security: Quản lý JWT và Token', 'Hướng dẫn lưu trữ và xác thực Token an toàn chống lại các vụ tấn công XSS...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(25, 1, 'React Context API vs Redux: Lựa chọn nào?', 'Dự án quy mô nào thì cần đến Redux và khi nào Context là đủ...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(26, 1, 'Javascript ES2024 có gì mới?', 'Cập nhật những tính năng lập trình mới nhất vừa được đưa vào chuẩn ECMAScript...', NULL, 0, NULL, '2026-04-10 15:13:22'),
(27, 4, 'Tìm hiểu React Hooks từ A đến Z', 'React Hooks là một cuộc cách mạng trong cách viết component. Bài viết này sẽ hướng dẫn bạn sử dụng useState, useEffect và useContext một cách thành thạo...', NULL, 0, NULL, '2026-04-13 20:49:44'),
(28, 4, 'Cách deploy ứng dụng Node.js lên VPS Ubuntu', 'Bạn đã viết xong ứng dụng nhưng không biết đưa lên server? Bài viết này sẽ đi từng bước: cài Nginx, cấu hình PM2 và SSL miễn phí...', NULL, 0, NULL, '2026-04-11 20:49:44'),
(29, 4, 'Sai lầm phổ biến khi học lập trình web', 'Nhiều người mới bắt đầu thường cố học quá nhiều framework cùng lúc. Hãy tập trung vào nền tảng HTML, CSS, JS trước khi chuyển sang React hay Vue...', NULL, 0, NULL, '2026-04-09 20:49:44'),
(30, 5, 'Tại sao nên dùng PHP 8.3 cho dự án mới?', 'PHP 8.3 mang đến nhiều cải tiến đáng kể: Typed class constants, cải thiện hiệu suất Opcache và cú pháp readonly ngắn gọn hơn...', NULL, 0, NULL, '2026-04-12 20:49:44'),
(31, 5, 'So sánh REST API và GraphQL: Khi nào nên dùng cái nào?', 'REST phù hợp cho CRUD đơn giản, nhưng GraphQL tỏa sáng khi frontend cần linh hoạt trong việc lấy dữ liệu. Hãy cùng phân tích ưu nhược điểm...', NULL, 0, NULL, '2026-04-10 20:49:44'),
(32, 5, 'Xây dựng Authentication System hoàn chỉnh với JWT', 'Bài viết hướng dẫn từ đầu: tạo token, refresh token, middleware xác thực và quản lý session an toàn...', NULL, 0, NULL, '2026-04-08 20:49:44'),
(33, 6, 'Database Design: Nghệ thuật thiết kế bảng quan hệ', 'Một cơ sở dữ liệu tốt bắt đầu từ việc phân tích yêu cầu nghiệp vụ. Hãy cùng học cách chuẩn hóa và tối ưu query performance...', NULL, 0, NULL, '2026-04-13 20:49:44'),
(34, 6, 'Tailwind CSS vs Bootstrap: Trận chiến thế kỉ', 'Bootstrap cho bạn các component sẵn có, Tailwind cho bạn sự tự do tuyệt đối. Bài viết phân tích DX, performance và ecosystem...', NULL, 0, NULL, '2026-04-11 20:49:44'),
(35, 6, 'Microservices không phải là Silver Bullet', 'Đừng vội chuyển sang Microservices chỉ vì nó trending. Monolith được thiết kế tốt vẫn tốt hơn Microservices được thiết kế tệ...', NULL, 0, NULL, '2026-04-07 20:49:44'),
(36, 7, 'Clean Code: 10 quy tắc vàng nhất định phải biết', 'Code không chỉ để máy hiểu mà còn để đồng nghiệp đọc. Đặt tên biến rõ ràng, hàm ngắn gọn, và tránh side effects...', NULL, 0, NULL, '2026-04-12 20:49:44'),
(37, 7, 'Git Flow: Quy trình làm việc nhóm chuyên nghiệp', 'Branching strategy quyết định sự thành bại của teamwork. Tìm hiểu về main, develop, feature branch và hotfix...', NULL, 0, NULL, '2026-04-10 20:49:44'),
(38, 7, 'Docker cho developer: Từ zero đến production', 'Dockerfile, docker-compose, volume mount và network. Tất cả những gì bạn cần để container hóa ứng dụng web...', NULL, 0, NULL, '2026-04-06 20:49:44'),
(39, 8, 'MySQL Performance Tuning: Tối ưu query chạy nhanh gấp 10 lần', 'Sử dụng EXPLAIN ANALYZE, đánh index đúng cách và viết JOIN hiệu quả. Những kỹ thuật giúp database của bạn bay...', NULL, 0, NULL, '2026-04-13 20:49:44'),
(40, 8, 'Laravel Eloquent: ORM hay Query Builder?', 'Eloquent đẹp và dễ dùng, nhưng đôi khi Query Builder cho performance tốt hơn. Hãy biết khi nào nên dùng cái nào...', NULL, 0, NULL, '2026-04-09 20:49:44'),
(41, 8, 'Bảo mật web application: Checklist 2024', 'SQL Injection, XSS, CSRF, CORS misconfiguration — Danh sách các lỗ hổng phổ biến và cách phòng chống hiệu quả...', NULL, 0, NULL, '2026-04-05 20:49:44'),
(42, 9, 'hôm nay là 15 tháng 4 năm 2026', 'hôm nay là 15 tháng 4 năm 2026', NULL, 0, NULL, '2026-04-14 20:51:10'),
(43, 9, 'bài số 2 ngày 1504', 'bài số 2 ngày 1504', NULL, 0, '2026-04-15 17:58:21', '2026-04-14 20:59:01'),
(45, 10, 'Hành trình 100 ngày học React', 'Nội dung chia sẻ về quá trình chinh phục React...', NULL, 0, NULL, '2026-04-04 22:39:02'),
(46, 10, 'Tại sao SQL vẫn là vua?', 'Phân tích sức mạnh của ngôn ngữ truy vấn quan hệ...', NULL, 0, NULL, '2026-04-05 22:39:02'),
(47, 10, 'Xây dựng UI với Tailwind CSS', 'Cách tạo ra giao diện đẹp cực nhanh...', NULL, 0, NULL, '2026-04-06 22:39:02'),
(48, 10, 'UI/UX Design cho dev', 'Những quy tắc thiết kế cơ bản cần biết...', NULL, 0, NULL, '2026-04-07 22:39:02'),
(49, 10, 'Tối ưu hiệu năng PHP 8', 'Sử dụng JIT và Opcache hiệu quả...', NULL, 0, NULL, '2026-04-08 22:39:02'),
(50, 10, 'Clean Code với SOLID', 'Áp dụng 5 nguyên lý vào dự án thực tế...', NULL, 0, NULL, '2026-04-09 22:39:02'),
(51, 10, 'Kinh nghiệm viết Unit Test', 'Tại sao chúng ta ghét nhưng vẫn cần viết test...', NULL, 0, NULL, '2026-04-10 22:39:02'),
(52, 10, 'Docker và Kubernetes cơ bản', 'Containerization là gì?...', NULL, 0, NULL, '2026-04-11 22:39:02'),
(53, 10, 'Cấu trúc dữ liệu và thuật toán', 'Tầm quan trọng của nền tảng...', NULL, 0, NULL, '2026-04-12 22:39:02'),
(54, 10, 'Social Blog Platform Version 7', 'Cập nhật những tính năng mới nhất...', NULL, 0, NULL, '2026-04-13 22:39:02'),
(55, 10211, 'iPhone 14 Pro năm nay', 'iPhone 14 Pro năm nay', '1776249421_add9a8c3123d02fe.jpg', 1, NULL, '2026-04-15 10:37:01'),
(56, 10211, '1', '1', '1776253010_99f1d1fd11836e51.jpg', 1, NULL, '2026-04-15 11:36:50');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `post_images`
--

CREATE TABLE `post_images` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `post_images`
--

INSERT INTO `post_images` (`id`, `post_id`, `image_url`, `created_at`) VALUES
(1, 55, '1776249421_da52fbf66b3fd7a8.jpg', '2026-04-15 17:37:01'),
(2, 56, '1776253010_6b8e9a2529740121.jpg', '2026-04-15 18:36:50');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `post_tags`
--

CREATE TABLE `post_tags` (
  `post_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `post_tags`
--

INSERT INTO `post_tags` (`post_id`, `tag_id`) VALUES
(3, 3),
(3, 7),
(3, 8),
(4, 2),
(4, 4),
(4, 7),
(5, 5),
(5, 8),
(6, 1),
(6, 5),
(6, 6),
(7, 3),
(7, 4),
(8, 1),
(8, 8),
(9, 2),
(9, 7),
(10, 1),
(10, 3),
(10, 8),
(11, 3),
(11, 7),
(12, 3),
(12, 5),
(12, 8),
(13, 1),
(13, 6),
(13, 8),
(14, 4),
(14, 7),
(15, 5),
(15, 8),
(16, 3),
(16, 7),
(17, 1),
(17, 6),
(18, 2),
(18, 4),
(19, 3),
(19, 8),
(20, 4),
(21, 3),
(21, 7),
(22, 5),
(23, 1),
(23, 6),
(24, 3),
(24, 8),
(25, 2),
(25, 7),
(26, 4),
(27, 2),
(27, 4),
(27, 7),
(28, 3),
(28, 8),
(29, 3),
(29, 7),
(30, 1),
(30, 8),
(31, 3),
(31, 4),
(31, 8),
(32, 1),
(32, 3),
(32, 8),
(33, 5),
(33, 8),
(34, 3),
(34, 7),
(35, 3),
(35, 8),
(36, 3),
(36, 4),
(37, 3),
(38, 3),
(38, 8),
(39, 1),
(39, 5),
(39, 8),
(40, 1),
(40, 5),
(40, 6),
(41, 1),
(41, 3),
(41, 8),
(45, 3),
(46, 3),
(47, 3),
(48, 3),
(49, 3),
(50, 3),
(51, 3),
(52, 3),
(53, 3),
(54, 3),
(55, 10),
(55, 11),
(56, 12);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ratings`
--

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `stars` tinyint(4) NOT NULL CHECK (`stars` >= 1 and `stars` <= 5),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `ratings`
--

INSERT INTO `ratings` (`id`, `user_id`, `post_id`, `stars`, `created_at`) VALUES
(1, 3, 1, 5, '2026-04-10 15:05:40'),
(2, 2, 1, 1, '2026-04-10 15:06:47'),
(5, 2, 11, 5, '2026-04-10 15:16:42'),
(6, 2, 3, 5, '2026-04-10 15:25:49'),
(14, 3, 3, 5, '2026-04-10 15:54:53'),
(16, 3, 7, 1, '2026-04-10 15:55:03'),
(20, 3, 4, 5, '2026-04-12 09:56:47'),
(21, 5, 33, 5, '2026-04-14 20:49:44'),
(22, 7, 36, 4, '2026-04-14 20:49:45'),
(23, 4, 39, 5, '2026-04-14 20:49:45');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reposts`
--

CREATE TABLE `reposts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `origin_user_id` int(11) NOT NULL,
  `is_hidden` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `reposts`
--

INSERT INTO `reposts` (`id`, `user_id`, `post_id`, `origin_user_id`, `is_hidden`, `created_at`) VALUES
(1, 2, 1, 1, 1, '2026-04-10 15:12:31'),
(2, 2, 3, 1, 1, '2026-04-10 15:25:55'),
(4, 3, 3, 1, 0, '2026-04-10 15:54:51'),
(5, 3, 4, 1, 0, '2026-04-12 09:56:50');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tags`
--

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `tags`
--

INSERT INTO `tags` (`id`, `name`) VALUES
(12, '1'),
(8, 'backend'),
(5, 'database'),
(7, 'frontend'),
(10, 'iphone'),
(11, 'iphone14'),
(4, 'javascript'),
(6, 'laravel'),
(1, 'php'),
(2, 'react'),
(3, 'webdev');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `avatar_image` varchar(255) DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `role` enum('admin','user') DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `avatar_image`, `cover_image`, `created_at`, `role`) VALUES
(1, 'admin', '$2y$10$O9y8B.0707H36Y6Y6Y6Y6Y6Y6Y6Y6Y6Y6Y6Y6Y6Y6Y6Y6Y6Y6Y6Y6', NULL, NULL, NULL, '2026-04-09 17:25:19', 'admin'),
(2, 'admin2', '$2y$10$GZycq3hCZkMlrIiIyPFnD.QVqIzehA4/n/AnaLYgGeU/Gjul6Hyr2', '', NULL, 'cover_image_69e00b187c805_663298ea.jpg', '2026-04-09 18:05:45', 'admin'),
(3, 'u1', '$2y$10$vPmL0VrH1CKPFX6xjXuU0ekPp4MSEXUa0Utpd8wT0XQ6cJm4E22hq', NULL, NULL, NULL, '2026-04-10 14:52:42', 'user'),
(4, 'user1', '$2y$10$YWVyb25hdXRpY3MAAAAAAOHqG3xI6sFPnMO0Q4nFQnAGf5XYHKUy6', NULL, NULL, NULL, '2026-04-14 20:49:44', 'user'),
(5, 'dev_pro', '$2y$10$YWVyb25hdXRpY3MAAAAAAOHqG3xI6sFPnMO0Q4nFQnAGf5XYHKUy6', NULL, NULL, NULL, '2026-04-14 20:49:44', 'user'),
(6, 'tech_guru', '$2y$10$YWVyb25hdXRpY3MAAAAAAOHqG3xI6sFPnMO0Q4nFQnAGf5XYHKUy6', NULL, NULL, NULL, '2026-04-14 20:49:44', 'user'),
(7, 'code_ninja', '$2y$10$YWVyb25hdXRpY3MAAAAAAOHqG3xI6sFPnMO0Q4nFQnAGf5XYHKUy6', NULL, NULL, NULL, '2026-04-14 20:49:44', 'user'),
(8, 'data_queen', '$2y$10$YWVyb25hdXRpY3MAAAAAAOHqG3xI6sFPnMO0Q4nFQnAGf5XYHKUy6', NULL, NULL, NULL, '2026-04-14 20:49:44', 'user'),
(9, 'user2', '$2y$10$jHglQtWavDJsmL5lAkjei./7EEaU3uk3r6hGOdwiItIQnmV4aKioy', '', NULL, 'cover_image_69e00cfe30d0d_2e7ee427.jpg', '2026-04-14 20:50:41', 'user'),
(10, 'user3', '$2y$10$mC7pGVDuC8lW94Tz7WJpY.L8H7O1A1A1A1A1A1A1A1A1A1A1A1A1A', NULL, NULL, NULL, '2026-04-14 22:39:01', 'user'),
(11, 'bot_fan_1', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(12, 'bot_fan_2', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(13, 'bot_fan_3', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(14, 'bot_fan_4', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(15, 'bot_fan_5', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(16, 'bot_fan_6', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(17, 'bot_fan_7', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(18, 'bot_fan_8', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(19, 'bot_fan_9', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(20, 'bot_fan_10', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(21, 'bot_fan_11', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(22, 'bot_fan_12', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(23, 'bot_fan_13', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(24, 'bot_fan_14', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(25, 'bot_fan_15', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(26, 'bot_fan_16', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(27, 'bot_fan_17', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(28, 'bot_fan_18', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(29, 'bot_fan_19', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(30, 'bot_fan_20', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(31, 'bot_fan_21', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(32, 'bot_fan_22', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(33, 'bot_fan_23', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(34, 'bot_fan_24', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(35, 'bot_fan_25', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(36, 'bot_fan_26', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(37, 'bot_fan_27', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(38, 'bot_fan_28', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(39, 'bot_fan_29', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(40, 'bot_fan_30', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(41, 'bot_fan_31', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(42, 'bot_fan_32', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(43, 'bot_fan_33', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(44, 'bot_fan_34', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(45, 'bot_fan_35', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(46, 'bot_fan_36', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(47, 'bot_fan_37', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(48, 'bot_fan_38', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(49, 'bot_fan_39', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(50, 'bot_fan_40', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(51, 'bot_fan_41', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(52, 'bot_fan_42', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(53, 'bot_fan_43', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(54, 'bot_fan_44', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(55, 'bot_fan_45', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(56, 'bot_fan_46', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(57, 'bot_fan_47', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(58, 'bot_fan_48', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(59, 'bot_fan_49', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(60, 'bot_fan_50', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(61, 'bot_fan_51', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(62, 'bot_fan_52', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(63, 'bot_fan_53', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(64, 'bot_fan_54', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(65, 'bot_fan_55', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(66, 'bot_fan_56', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(67, 'bot_fan_57', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(68, 'bot_fan_58', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(69, 'bot_fan_59', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(70, 'bot_fan_60', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(71, 'bot_fan_61', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(72, 'bot_fan_62', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(73, 'bot_fan_63', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(74, 'bot_fan_64', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(75, 'bot_fan_65', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(76, 'bot_fan_66', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(77, 'bot_fan_67', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(78, 'bot_fan_68', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(79, 'bot_fan_69', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(80, 'bot_fan_70', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(81, 'bot_fan_71', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(82, 'bot_fan_72', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(83, 'bot_fan_73', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(84, 'bot_fan_74', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(85, 'bot_fan_75', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(86, 'bot_fan_76', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(87, 'bot_fan_77', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(88, 'bot_fan_78', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(89, 'bot_fan_79', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(90, 'bot_fan_80', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(91, 'bot_fan_81', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(92, 'bot_fan_82', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(93, 'bot_fan_83', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(94, 'bot_fan_84', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(95, 'bot_fan_85', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(96, 'bot_fan_86', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(97, 'bot_fan_87', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(98, 'bot_fan_88', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(99, 'bot_fan_89', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(100, 'bot_fan_90', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(101, 'bot_fan_91', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(102, 'bot_fan_92', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(103, 'bot_fan_93', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(104, 'bot_fan_94', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(105, 'bot_fan_95', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(106, 'bot_fan_96', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(107, 'bot_fan_97', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(108, 'bot_fan_98', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(109, 'bot_fan_99', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(110, 'bot_fan_100', 'hidden_pass', NULL, NULL, NULL, '2026-04-14 22:39:02', 'user'),
(10211, 'user4', '$2y$10$UjghDFRXrbwf1FmJxPhgtO0zt8qofjvR9zIEPBqvO6j6CTp8ZbYXy', NULL, NULL, NULL, '2026-04-15 09:43:19', 'user');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_name_history`
--

CREATE TABLE `user_name_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `old_name` varchar(255) DEFAULT NULL,
  `new_name` varchar(255) NOT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `actor_id` int(11) NOT NULL,
  `post_id` int(11) DEFAULT NULL,
  `comment_id` int(11) DEFAULT NULL,
  `type` enum('comment','like','repost','reply') NOT NULL,
  `message` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `post_id` (`post_id`);

--
-- Chỉ mục cho bảng `follows`
--
ALTER TABLE `follows`
  ADD PRIMARY KEY (`follower_id`,`following_id`),
  ADD KEY `following_id` (`following_id`);

--
-- Chỉ mục cho bảng `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`user_id`,`post_id`),
  ADD KEY `post_id` (`post_id`);

--
-- Chỉ mục cho bảng `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_posts_hidden` (`is_hidden`),
  ADD KEY `idx_posts_deleted` (`deleted_at`),
  ADD KEY `idx_posts_visibility_lookup` (`is_hidden`,`deleted_at`);

--
-- Chỉ mục cho bảng `post_images`
--
ALTER TABLE `post_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_post_images_post` (`post_id`),
  ADD KEY `idx_post_images_mapping` (`post_id`);

--
-- Chỉ mục cho bảng `post_tags`
--
ALTER TABLE `post_tags`
  ADD PRIMARY KEY (`post_id`,`tag_id`),
  ADD KEY `tag_id` (`tag_id`);

--
-- Chỉ mục cho bảng `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_post_rating` (`user_id`,`post_id`),
  ADD KEY `post_id` (`post_id`);

--
-- Chỉ mục cho bảng `reposts`
--
ALTER TABLE `reposts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `origin_user_id` (`origin_user_id`);

--
-- Chỉ mục cho bảng `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Chỉ mục cho bảng `user_name_history`
--
ALTER TABLE `user_name_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name_history_user_id` (`user_id`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `actor_id` (`actor_id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `comment_id` (`comment_id`),
  ADD KEY `idx_notifications_user_read` (`user_id`, `is_read`),
  ADD KEY `idx_notifications_created_at` (`created_at`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT cho bảng `post_images`
--
ALTER TABLE `post_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT cho bảng `reposts`
--
ALTER TABLE `reposts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10212;

--
-- AUTO_INCREMENT cho bảng `user_name_history`
--
ALTER TABLE `user_name_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `follows`
--
ALTER TABLE `follows`
  ADD CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `post_images`
--
ALTER TABLE `post_images`
  ADD CONSTRAINT `post_images_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `post_tags`
--
ALTER TABLE `post_tags`
  ADD CONSTRAINT `post_tags_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `reposts`
--
ALTER TABLE `reposts`
  ADD CONSTRAINT `reposts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reposts_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reposts_ibfk_3` FOREIGN KEY (`origin_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `user_name_history`
--
ALTER TABLE `user_name_history`
  ADD CONSTRAINT `fk_name_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_4` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
