<?php
include_once __DIR__ . '/../../config/database.php';
include_once __DIR__ . '/../auth/token_helper.php';

// ── JWT AUTH ──
$user = get_auth_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["message" => "Yêu cầu xác thực."]);
    exit();
}

include_once __DIR__ . '/../../config/id_helper.php';

$database = new Database();
$db = $database->getConnection();
$input = json_decode(file_get_contents("php://input"), true) ?? [];
$post_id_raw = $input['post_id'] ?? $_POST['post_id'] ?? null;

if (empty($post_id_raw)) {
    http_response_code(400);
    echo json_encode(["message" => "Thiếu post_id."]);
    exit();
}

// Decode post_id
$post_id = decodeId($post_id_raw);
if (!$post_id && is_numeric($post_id_raw)) {
    $post_id = (int)$post_id_raw;
}

if (!$post_id) {
    http_response_code(400);
    echo json_encode(["message" => "post_id không hợp lệ."]);
    exit();
}

// ── IDOR CHECK ──
$stmt = $db->prepare("SELECT user_id FROM posts WHERE id = ? AND deleted_at IS NULL");
$stmt->execute([$post_id]);
$post = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$post) {
    http_response_code(404);
    echo json_encode(["message" => "Bài viết không tồn tại hoặc đã ở trong thùng rác."]);
    exit();
}

$is_admin = (isset($user['role']) && $user['role'] === 'admin');
if ($user['id'] != $post['user_id'] && !$is_admin) {
    http_response_code(403);
    echo json_encode(["message" => "Bạn không có quyền xóa bài viết này."]);
    exit();
}

// ── SOFT DELETE: set deleted_at = NOW() ──
$upd = $db->prepare("UPDATE posts SET deleted_at = NOW() WHERE id = ?");
$upd->execute([$post_id]);

http_response_code(200);
echo json_encode([
    "message" => "Bài viết đã được chuyển vào Thùng rác. Bạn có 30 ngày để khôi phục.",
]);
?>
