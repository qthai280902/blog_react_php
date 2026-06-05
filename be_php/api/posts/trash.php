<?php
include_once __DIR__ . '/../../config/database.php';
include_once __DIR__ . '/../../config/id_helper.php';
include_once __DIR__ . '/../auth/token_helper.php';

// ── JWT AUTH ──
$user = get_auth_user();
if (!$user) {
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "message" => "Yêu cầu xác thực."
    ]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

// [DỌN DẸP THÙNG RÁC]: Xóa vĩnh viễn bài quá 30 ngày (Đợt quét mới cho cả Reposts)
// Logically we should purge reposts too, but focus on the merge first as requested.

try {
    // ── LẤY DANH SÁCH THÙNG RÁC TỔNG HỢP (POSTS + REPOSTS) ──
    $query = "
        (SELECT 
            'post' as item_type,
            p.id as original_id,
            p.title, 
            p.cover_image, 
            p.deleted_at, 
            p.created_at,
            DATEDIFF(DATE_ADD(p.deleted_at, INTERVAL 30 DAY), NOW()) as days_remaining
        FROM posts p
        WHERE p.deleted_at IS NOT NULL AND p.user_id = ?)
        
        UNION ALL
        
        (SELECT 
            'repost' as item_type,
            r.id as original_id,
            p.title, 
            p.cover_image, 
            r.deleted_at, 
            r.created_at,
            DATEDIFF(DATE_ADD(r.deleted_at, INTERVAL 30 DAY), NOW()) as days_remaining
        FROM reposts r
        JOIN posts p ON r.post_id = p.id
        WHERE r.deleted_at IS NOT NULL AND r.user_id = ?)
        
        ORDER BY deleted_at DESC";

    $stmt = $db->prepare($query);
    $stmt->execute([$user['id'], $user['id']]);
    $trash_items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // [URL HARDENING & DATA CLEANUP]
    foreach ($trash_items as &$item) {
        // Mã hóa ID cho an toàn
        $item['id'] = encodeId($item['original_id']);
        $item['days_remaining'] = max(0, (int)$item['days_remaining']);
        
        // Xóa ID gốc để tránh bị soi
        unset($item['original_id']);
    }

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "trash" => $trash_items
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Lỗi hệ thống: " . $e->getMessage()
    ]);
}
?>
