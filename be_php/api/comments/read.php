<?php

include_once '../../config/database.php';
include_once '../../config/id_helper.php';

$database = new Database();
$db = $database->getConnection();

$post_id = isset($_GET['post_id']) ? $_GET['post_id'] : null;

if (!$post_id) {
    http_response_code(400);
    echo json_encode(array("message" => "Thiếu ID bài viết."));
    exit();
}

$query = "SELECT 
            c.id, 
            c.content, 
            c.created_at, 
            c.parent_id,
            u.id as user_id,
            u.username,
            u.avatar_image,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers
          FROM comments c
          INNER JOIN users u ON c.user_id = u.id
          WHERE c.post_id = ?
          ORDER BY c.created_at DESC";

$stmt = $db->prepare($query);
$stmt->execute([$post_id]);

$comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

// [URL HARDENING V2]: Bổ sung uid cho mỗi người bình luận
foreach ($comments as &$c) {
    $c['user_uid'] = encodeId($c['user_id']);
    $c['followers'] = (int)$c['followers'];
    $c['parent_id'] = $c['parent_id'] !== null ? (int)$c['parent_id'] : null;
}

http_response_code(200);
echo json_encode($comments);
?>
