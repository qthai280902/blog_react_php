<?php
include_once '../../config/database.php';
include_once '../auth/token_helper.php';

// Kiểm tra phần mở rộng finfo (cần thiết để validate MIME type)
if (!class_exists('finfo')) {
    http_response_code(500);
    echo json_encode(["message" => "Server thiếu thành phần PHP 'finfo'. Vui lòng kích hoạt trong php.ini."]);
    exit();
}

// ============================================
// LUẬT GAMIFICATION V2 — Dựa trên Followers
// ============================================
$user = get_auth_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["message" => "Vui lòng đăng nhập để đăng bài."]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

// ── 1. KIỂM TRA QUOTA (Gamification) ──
$f_stmt = $db->prepare("SELECT COUNT(*) as total FROM follows WHERE following_id = ?");
$f_stmt->execute([$user['id']]);
$followers_count = (int)$f_stmt->fetch(PDO::FETCH_ASSOC)['total'];

if ($followers_count >= 10000) {
    $allowed_limit = 20; $tier = 'Legendary';
} elseif ($followers_count >= 1000) {
    $allowed_limit = 10; $tier = 'KOL';
} elseif ($followers_count >= 100) {
    $allowed_limit = 5;  $tier = 'Rising Star';
} else {
    $allowed_limit = 3;  $tier = 'Newcomer';
}

$tp_stmt = $db->prepare("SELECT COUNT(*) as total FROM posts WHERE user_id = ? AND DATE(created_at) = CURDATE()");
$tp_stmt->execute([$user['id']]);
$today_post_count = (int)$tp_stmt->fetch(PDO::FETCH_ASSOC)['total'];

if ($today_post_count >= $allowed_limit) {
    http_response_code(403);
    echo json_encode([
        "message" => "Bạn đã hết lượt đăng bài hôm nay! Hạng: {$tier} — Giới hạn: {$allowed_limit} bài/ngày.",
        "tier" => $tier, "limit" => $allowed_limit, "used" => $today_post_count,
    ]);
    exit();
}

// ── 2. NHẬN DỮ LIỆU TỪ MULTIPART/FORM-DATA ──
$title   = isset($_POST['title'])   ? trim($_POST['title'])   : '';
$content = isset($_POST['content']) ? trim($_POST['content']) : '';
$hashtags = isset($_POST['hashtags']) ? trim($_POST['hashtags']) : (isset($_POST['tags']) ? trim($_POST['tags']) : '');

if (empty($title) || empty($content)) {
    http_response_code(400);
    echo json_encode(["message" => "Dữ liệu không đầy đủ. Cần có tiêu đề và nội dung."]);
    exit();
}

// Chống XSS cho tiêu đề, nhưng giữ nguyên HTML cho Content (vì dùng Rich Text)
$title   = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
// [RICH TEXT SYNC]: Không dùng htmlspecialchars ở đây vì Frontend đã dùng DOMPurify
$content = $content; 

// ── 3. CẤU HÌNH VALIDATE FILE ──
$ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
$ALLOWED_EXTS  = ['jpg', 'jpeg', 'png', 'webp'];
$MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
$UPLOAD_DIR    = realpath(__DIR__ . '/../../') . '/uploads/';

// Tạo thư mục uploads nếu chưa có
if (!is_dir($UPLOAD_DIR)) {
    mkdir($UPLOAD_DIR, 0755, true);
}

/**
 * Validate và lưu file ảnh.
 * Trả về tên file đã lưu, hoặc throw Exception nếu lỗi.
 */
function validateAndSaveImage($file, $upload_dir, $allowed_types, $allowed_exts, $max_size) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("Lỗi upload file: " . $file['name']);
    }

    // Check dung lượng
    if ($file['size'] > $max_size) {
        throw new Exception("File '{$file['name']}' vượt quá 2MB (" . round($file['size'] / 1024 / 1024, 2) . "MB).");
    }

    // Check MIME type thực tế (không tin extension)
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $real_mime = $finfo->file($file['tmp_name']);
    if (!in_array($real_mime, $allowed_types)) {
        throw new Exception("File '{$file['name']}' có MIME type không hợp lệ: {$real_mime}. Chỉ chấp nhận: jpg, png, webp.");
    }

    // Check extension
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed_exts)) {
        throw new Exception("File '{$file['name']}' có đuôi mở rộng không hợp lệ: .{$ext}.");
    }

    // Tạo tên file an toàn: timestamp + random + extension gốc
    $safe_name = time() . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
    $dest_path = $upload_dir . $safe_name;

    if (!move_uploaded_file($file['tmp_name'], $dest_path)) {
        throw new Exception("Không thể lưu file '{$file['name']}' lên server.");
    }

    return $safe_name;
}

// ── 4. BẮT ĐẦU TRANSACTION ──
$saved_files = []; // Theo dõi file đã lưu để xóa nếu rollback
$db->beginTransaction();

try {
    // ── 4a. XỬ LÝ ẢNH BÌA ──
    $cover_filename = null;
    if (isset($_FILES['cover_image']) && $_FILES['cover_image']['error'] !== UPLOAD_ERR_NO_FILE) {
        $cover_filename = validateAndSaveImage(
            $_FILES['cover_image'], $UPLOAD_DIR, $ALLOWED_TYPES, $ALLOWED_EXTS, $MAX_FILE_SIZE
        );
        $saved_files[] = $UPLOAD_DIR . $cover_filename;
    }

    // ── 4b. XỬ LÝ ẢNH PHỤ ──
    $sub_filenames = [];
    if (isset($_FILES['sub_images'])) {
        $sub_count = count($_FILES['sub_images']['name']);
        for ($i = 0; $i < $sub_count; $i++) {
            if ($_FILES['sub_images']['error'][$i] === UPLOAD_ERR_NO_FILE) continue;

            $single_file = [
                'name'     => $_FILES['sub_images']['name'][$i],
                'type'     => $_FILES['sub_images']['type'][$i],
                'tmp_name' => $_FILES['sub_images']['tmp_name'][$i],
                'error'    => $_FILES['sub_images']['error'][$i],
                'size'     => $_FILES['sub_images']['size'][$i],
            ];
            $fname = validateAndSaveImage(
                $single_file, $UPLOAD_DIR, $ALLOWED_TYPES, $ALLOWED_EXTS, $MAX_FILE_SIZE
            );
            $sub_filenames[] = $fname;
            $saved_files[] = $UPLOAD_DIR . $fname;
        }
    }

    // ── 4c. INSERT BÀI VIẾT ──
    $stmt = $db->prepare("INSERT INTO posts (user_id, title, content, cover_image) VALUES (?, ?, ?, ?)");
    $stmt->execute([$user['id'], $title, $content, $cover_filename]);
    $post_id = (int)$db->lastInsertId();

    // ── 4d. INSERT ẢNH PHỤ VÀO post_images ──
    if (!empty($sub_filenames)) {
        $img_stmt = $db->prepare("INSERT INTO post_images (post_id, image_url) VALUES (?, ?)");
        foreach ($sub_filenames as $fname) {
            $img_stmt->execute([$post_id, $fname]);
        }
    }

    // ── 4e. XỬ LÝ HASHTAGS ──
    if (!empty($hashtags)) {
        $tag_list = array_filter(array_map('trim', explode(',', $hashtags)));
        $tag_list = array_unique($tag_list);

        foreach ($tag_list as $tag_name) {
            if (empty($tag_name)) continue;

            $safe_tag = strtolower(preg_replace('/[^a-zA-Z0-9_\-\p{L}]/u', '', $tag_name));
            if (empty($safe_tag)) continue;

            // INSERT IGNORE: nếu tag đã tồn tại thì bỏ qua
            $db->prepare("INSERT IGNORE INTO tags (name) VALUES (?)")->execute([$safe_tag]);

            // Lấy tag_id
            $t_stmt = $db->prepare("SELECT id FROM tags WHERE name = ?");
            $t_stmt->execute([$safe_tag]);
            $tag_id = $t_stmt->fetchColumn();

            if ($tag_id) {
                $db->prepare("INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)")
                   ->execute([$post_id, $tag_id]);
            }
        }
    }

    // ── 5. COMMIT THÀNH CÔNG ──
    $db->commit();

    $remaining = $allowed_limit - $today_post_count - 1;
    http_response_code(201);
    echo json_encode([
        "message" => "Đăng bài thành công! Bạn còn {$remaining} lượt đăng trong ngày.",
        "post_id" => $post_id,
        "tier" => $tier,
        "remaining" => $remaining,
        "cover_image" => $cover_filename,
        "sub_images" => $sub_filenames,
    ]);

} catch (Exception $e) {
    // ── ROLLBACK: Hoàn tác toàn bộ ──
    $db->rollBack();

    // Xóa các file đã lưu trên disk để không để lại rác
    foreach ($saved_files as $filepath) {
        if (file_exists($filepath)) {
            unlink($filepath);
        }
    }

    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Lỗi hệ thống: " . $e->getMessage() . " ở dòng " . $e->getLine()]);
}
?>
