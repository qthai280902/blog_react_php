<?php

include_once '../../config/database.php';
include_once '../auth/token_helper.php';

$user = get_auth_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(array("message" => "Vui lòng đăng nhập để Repost."));
    exit();
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->post_id)) {
    http_response_code(400);
    echo json_encode(array("message" => "Thiếu ID bài viết."));
    exit();
}

// 1. Kiểm tra xem đã repost chưa (Toggle)
$check_query = "SELECT id, deleted_at FROM reposts WHERE user_id = ? AND post_id = ?";
$stmt_check = $db->prepare($check_query);
$stmt_check->execute([$user['id'], $data->post_id]);
$repost = $stmt_check->fetch(PDO::FETCH_ASSOC);

if ($repost) {
    if (is_null($repost['deleted_at'])) {
        // Đã repost active -> Hủy Repost
        $upd_query = "UPDATE reposts SET deleted_at = NOW() WHERE id = ?";
        $stmt_upd = $db->prepare($upd_query);
        $stmt_upd->execute([$repost['id']]);
        
        http_response_code(200);
        echo json_encode(array("status" => "unreposted", "message" => "Đã hủy Repost bài viết."));
    } else {
        // Đang bị soft delete -> Kích hoạt lại (restore)
        $upd_query = "UPDATE reposts SET deleted_at = NULL, is_hidden = 0 WHERE id = ?";
        $stmt_upd = $db->prepare($upd_query);
        $stmt_upd->execute([$repost['id']]);
        
        http_response_code(200);
        echo json_encode(array("status" => "reposted", "message" => "Đã Repost bài viết về trang cá nhân!"));
    }
} else {
    // 2. Chưa Repost -> Thêm mới
    // Lấy origin_user_id (tác giả gốc của bài viết)
    $origin_query = "SELECT user_id FROM posts WHERE id = ?";
    $stmt_origin = $db->prepare($origin_query);
    $stmt_origin->execute([$data->post_id]);
    $origin = $stmt_origin->fetch(PDO::FETCH_ASSOC);

    if (!$origin) {
        http_response_code(404);
        echo json_encode(array("message" => "Bài viết không tồn tại."));
        exit();
    }

    $ins_query = "INSERT INTO reposts (user_id, post_id, origin_user_id) VALUES (?, ?, ?)";
    $stmt_ins = $db->prepare($ins_query);
    if ($stmt_ins->execute([$user['id'], $data->post_id, $origin['user_id']])) {
        http_response_code(201);
        echo json_encode(array("status" => "reposted", "message" => "Đã Repost bài viết về trang cá nhân!"));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Lỗi server."));
    }
}
?>
