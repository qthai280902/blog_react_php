<?php
/**
 * [API READ REPOSTS V2] - HỖ TRỢ UID & PHÒNG THỦ DỮ LIỆU
 */

include_once '../../config/database.php';
include_once '../../config/id_helper.php';
include_once '../auth/token_helper.php';

$database = new Database();
$db = $database->getConnection();

// Lấy ID/UID của trang Profile đang xem
$uid_raw = isset($_GET['user_id']) ? $_GET['user_id'] : null;

// [TIÊU CHUẨN JSON RỖNG]: Nếu không có UID, trả về 200 OK với mảng rỗng
if (!$uid_raw) {
    http_response_code(200);
    echo json_encode(["status" => "success", "data" => []]);
    exit();
}

// [UID DECODING]
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

// Kiểm tra danh tính người đang request (để xử lý is_hidden)
$current_user = get_auth_user();
$is_owner = ($current_user && $current_user['id'] == $profile_id);

// Query JOIN để lấy bài gốc của bài đã Repost
$query = "SELECT 
            r.id as repost_id, 
            r.is_hidden, 
            r.created_at as repost_date,
            p.id, 
            p.title, 
            p.content, 
            p.excerpt,
            p.created_at, 
            u.username as author_name,
            u.id as author_id
          FROM reposts r
          INNER JOIN posts p ON r.post_id = p.id
          INNER JOIN users u ON p.user_id = u.id
          WHERE r.user_id = ? AND r.deleted_at IS NULL";

// LOGIC BẢO MẬT: Nếu không phải chủ profile, chỉ hiện bài public
if (!$is_owner) {
    $query .= " AND r.is_hidden = 0";
}

$query .= " ORDER BY r.created_at DESC";

try {
    $stmt = $db->prepare($query);
    $stmt->execute([$profile_id]);
    $reposts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($reposts as &$r) {
        $excerpt = isset($r['excerpt']) ? trim($r['excerpt']) : '';
        if ($excerpt === '') {
            $plain = strip_tags(html_entity_decode($r['content']));
            $plain = preg_replace('/\s+/', ' ', $plain);
            if (mb_strlen($plain, 'UTF-8') > 150) {
                $excerpt = mb_substr($plain, 0, 150, 'UTF-8') . '...';
            } else {
                $excerpt = $plain;
            }
        } else {
            $excerpt = html_entity_decode($excerpt);
        }
        $r['excerpt'] = $excerpt;
        unset($r['content']); // Clean full content
    }

    http_response_code(200);
    echo json_encode(["status" => "success", "data" => $reposts]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
