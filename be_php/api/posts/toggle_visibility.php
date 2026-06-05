<?php

include_once '../../config/database.php';
include_once '../auth/token_helper.php';

// ── JWT AUTH ──
$user = get_auth_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["message" => "Yêu cầu xác thực."]);
    exit();
}

include_once '../../config/id_helper.php';

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

if (empty($data->post_id)) {
    http_response_code(400);
    echo json_encode(["message" => "Thiếu post_id."]);
    exit();
}

// Decode post_id
$post_id = decodeId($data->post_id);
if (!$post_id && is_numeric($data->post_id)) {
    $post_id = (int)$data->post_id;
}

if (!$post_id) {
    http_response_code(400);
    echo json_encode(["message" => "post_id không hợp lệ."]);
    exit();
}

// ── IDOR CHECK: Lấy bài viết và xác minh quyền ──
$stmt = $db->prepare("SELECT user_id, is_hidden FROM posts WHERE id = ? AND deleted_at IS NULL");
$stmt->execute([$post_id]);
$post = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$post) {
    http_response_code(404);
    echo json_encode(["message" => "Bài viết không tồn tại."]);
    exit();
}

$is_admin = (isset($user['role']) && $user['role'] === 'admin');
if ($user['id'] != $post['user_id'] && !$is_admin) {
    http_response_code(403);
    echo json_encode(["message" => "Bạn không có quyền thao tác bài viết này."]);
    exit();
}

// ── TOGGLE ──
$new_hidden = $post['is_hidden'] ? 0 : 1;
$upd = $db->prepare("UPDATE posts SET is_hidden = ? WHERE id = ?");
$upd->execute([$new_hidden, $post_id]);

http_response_code(200);
echo json_encode([
    "message" => $new_hidden ? "Bài viết đã được ẩn." : "Bài viết đã được hiện lại.",
    "is_hidden" => $new_hidden,
]);
?>
