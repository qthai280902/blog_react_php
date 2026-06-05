<?php
include_once __DIR__ . '/../../config/database.php';
include_once __DIR__ . '/../auth/token_helper.php';
include_once __DIR__ . '/../../config/id_helper.php';

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
$input = json_decode(file_get_contents("php://input"), true) ?? [];
$post_id_raw = $input['post_id'] ?? $_POST['post_id'] ?? null;
$item_type = $input['item_type'] ?? $_POST['item_type'] ?? null;

if (empty($post_id_raw)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Thiếu post_id."
    ]);
    exit();
}

try {
    // ── REPOST RESTORATION ──
    if (isset($item_type) && $item_type === 'repost') {
        $repost_id = decodeId($post_id_raw);
        if (!$repost_id && is_numeric($post_id_raw)) {
            $repost_id = (int)$post_id_raw;
        }
        
        if (!$repost_id) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "post_id (repost) không hợp lệ."
            ]);
            exit();
        }
        
        $stmt = $db->prepare("SELECT user_id FROM reposts WHERE id = ? AND deleted_at IS NOT NULL");
        $stmt->execute([$repost_id]);
        $repost = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$repost) {
            http_response_code(404);
            echo json_encode([
                "status" => "error",
                "message" => "Lượt đăng lại không tồn tại trong thùng rác."
            ]);
            exit();
        }
        
        $is_admin = (isset($user['role']) && $user['role'] === 'admin');
        if ($user['id'] != $repost['user_id'] && !$is_admin) {
            http_response_code(403);
            echo json_encode([
                "status" => "error",
                "message" => "Bạn không có quyền khôi phục lượt đăng lại này."
            ]);
            exit();
        }
        
        $upd = $db->prepare("UPDATE reposts SET deleted_at = NULL, is_hidden = 0 WHERE id = ?");
        $upd->execute([$repost_id]);
        
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Lượt đăng lại đã được khôi phục thành công!",
        ]);
        exit();
    }

    // Decode post_id
    $post_id = decodeId($post_id_raw);
    if (!$post_id && is_numeric($post_id_raw)) {
        $post_id = (int)$post_id_raw;
    }

    if (!$post_id) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "post_id không hợp lệ."
        ]);
        exit();
    }

    // ── IDOR CHECK: Chỉ lấy bài đã bị soft-delete ──
    $stmt = $db->prepare("SELECT user_id FROM posts WHERE id = ? AND deleted_at IS NOT NULL");
    $stmt->execute([$post_id]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$post) {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "Bài viết không tồn tại trong thùng rác."
        ]);
        exit();
    }

    $is_admin = (isset($user['role']) && $user['role'] === 'admin');
    if ($user['id'] != $post['user_id'] && !$is_admin) {
        http_response_code(403);
        echo json_encode([
            "status" => "error",
            "message" => "Bạn không có quyền khôi phục bài viết này."
        ]);
        exit();
    }

    // ── RESTORE: set deleted_at = NULL ──
    $upd = $db->prepare("UPDATE posts SET deleted_at = NULL WHERE id = ?");
    $upd->execute([$post_id]);

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "Bài viết đã được khôi phục thành công!",
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Lỗi hệ thống: " . $e->getMessage()
    ]);
}
?>
