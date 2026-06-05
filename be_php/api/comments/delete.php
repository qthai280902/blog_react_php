<?php
include_once __DIR__ . '/../../config/database.php';
include_once __DIR__ . '/../auth/token_helper.php';

$user = get_auth_user();
if (!$user) {
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized"
    ]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$commentId = $input['comment_id'] ?? $_POST['comment_id'] ?? $input['id'] ?? $_POST['id'] ?? null;

if (empty($commentId)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Thiếu ID bình luận."
    ]);
    exit();
}

// ── LẤY THÔNG TIN BÌNH LUẬN + BÀI VIẾT ──
$stmt = $db->prepare("
    SELECT 
        c.user_id  AS comment_author_id, 
        p.user_id  AS post_author_id
    FROM comments c
    INNER JOIN posts p ON c.post_id = p.id
    WHERE c.id = ?
");
$stmt->execute([$commentId]);
$comment = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$comment) {
    http_response_code(404);
    echo json_encode([
        "status" => "error",
        "message" => "Bình luận không tồn tại."
    ]);
    exit();
}

// ── KIỂM TRA QUYỀN XÓA (3 cấp) ──
$can_delete = false;
$reason = '';

// Cấp 1: Admin luôn có quyền tối thượng
if (isset($user['role']) && $user['role'] === 'admin') {
    $can_delete = true;
    $reason = 'admin_authority';
}

// Cấp 2: Chủ sở hữu bình luận
if (!$can_delete && $user['id'] == $comment['comment_author_id']) {
    $can_delete = true;
    $reason = 'comment_owner';
}

// Cấp 3: Chủ bài viết — được phép xóa mọi bình luận trong bài của mình
if (!$can_delete && $user['id'] == $comment['post_author_id']) {
    $can_delete = true;
    $reason = 'post_owner';
}

// ── THỰC THI XÓA ──
if ($can_delete) {
    try {
        $db->beginTransaction();
        
        // 1. Xóa thông báo liên quan đến các phản hồi con trước
        $stmt_child_notif = $db->prepare("
            DELETE FROM notifications 
            WHERE comment_id IN (SELECT id FROM comments WHERE parent_id = ?)
        ");
        $stmt_child_notif->execute([$commentId]);
        
        // 2. Xóa thông báo liên quan đến chính bình luận này
        $stmt_notif = $db->prepare("DELETE FROM notifications WHERE comment_id = ?");
        $stmt_notif->execute([$commentId]);
        
        // 3. Xóa các phản hồi con
        $stmt_child_comments = $db->prepare("DELETE FROM comments WHERE parent_id = ?");
        $stmt_child_comments->execute([$commentId]);
        
        // 4. Xóa chính bình luận này
        $del_stmt = $db->prepare("DELETE FROM comments WHERE id = ?");
        $del_stmt->execute([$commentId]);
        
        $db->commit();
        
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Đã xóa bình luận",
            "deleted_by" => $reason,
        ]);
    } catch (Throwable $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Lỗi hệ thống: " . $e->getMessage()
        ]);
    }
} else {
    http_response_code(403);
    echo json_encode([
        "status" => "error",
        "message" => "Bạn không có quyền xóa bình luận này."
    ]);
}
?>
