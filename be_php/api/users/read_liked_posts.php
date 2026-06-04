<?php
/**
 * [API READ LIKED POSTS] - HIỂN THỊ BÀI VIẾT ĐÃ THÍCH CHO CHÍNH CHỦ
 */

include_once '../../config/database.php';
include_once '../../config/id_helper.php';
include_once '../auth/token_helper.php';

$database = new Database();
$db = $database->getConnection();

// Lấy ID/UID của trang Profile đang xem
$uid_raw = isset($_GET['user_id']) ? $_GET['user_id'] : null;

// Nếu không có UID, trả về 200 OK với mảng rỗng
if (!$uid_raw) {
    http_response_code(200);
    echo json_encode(["status" => "success", "data" => []]);
    exit();
}

// Giải mã UID
$profile_id = decodeId($uid_raw);
if (!$profile_id && is_numeric($uid_raw)) {
    $profile_id = (int)$uid_raw;
}

// Nếu giải mã thất bại, trả về danh sách rỗng (200 OK)
if (!$profile_id) {
    http_response_code(200);
    echo json_encode(["status" => "success", "data" => []]);
    exit();
}

// KIỂM TRA QUYỀN RIÊNG TƯ: Chỉ hiển thị "Đã thích" cho chính chủ
$current_user = get_auth_user();
$is_owner = ($current_user && (int)$current_user['id'] === $profile_id);

if (!$is_owner) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Bạn không có quyền xem danh sách bài viết đã thích của người khác."]);
    exit();
}

// Query lấy danh sách bài viết được user like
$query = "SELECT 
            p.id, 
            p.title, 
            p.content, 
            p.created_at, 
            p.cover_image, 
            u.username as author_name,
            u.id as author_id,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as total_likes,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as total_comments,
            GROUP_CONCAT(DISTINCT tg.name) as tags
          FROM likes l
          INNER JOIN posts p ON l.post_id = p.id
          INNER JOIN users u ON p.user_id = u.id
          LEFT JOIN post_tags pt ON p.id = pt.post_id
          LEFT JOIN tags tg ON pt.tag_id = tg.id
          WHERE l.user_id = ? AND p.deleted_at IS NULL AND p.is_hidden = 0
          GROUP BY p.id
          ORDER BY l.created_at DESC";

try {
    $stmt = $db->prepare($query);
    $stmt->execute([$profile_id]);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Xử lý dữ liệu trước khi trả về
    foreach ($posts as &$p) {
        $p['tags'] = $p['tags'] ? explode(',', $p['tags']) : [];
        $p['content'] = html_entity_decode($p['content']);
        $p['total_likes'] = (int)$p['total_likes'];
        $p['total_comments'] = (int)$p['total_comments'];
        $p['author_uid'] = encodeId($p['author_id']);
    }

    http_response_code(200);
    echo json_encode(["status" => "success", "data" => $posts]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
