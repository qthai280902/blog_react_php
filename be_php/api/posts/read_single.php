<?php

include_once '../../config/database.php';
include_once '../../config/id_helper.php';
include_once '../auth/token_helper.php';

$database = new Database();
$db = $database->getConnection();

$user = get_auth_user();
$user_id = $user ? (int)$user['id'] : 0;

$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    http_response_code(400);
    echo json_encode(["message" => "Thiếu ID bài viết."]);
    exit();
}

// ── QUERY CHÍNH: Lấy bài viết + author_followers ──
$query = "SELECT 
            p.id, 
            p.title, 
            p.content, 
            p.excerpt,
            p.created_at,
            p.cover_image,
            p.is_hidden,
            u.id as author_id,
            u.username as author_name,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as author_followers,
            GROUP_CONCAT(DISTINCT t.name) as tags,
            AVG(r.stars) as avg_rating,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as total_likes,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as total_comments,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = :user_id) > 0 as liked,
            (SELECT COUNT(*) FROM reposts WHERE post_id = p.id AND user_id = :user_id AND deleted_at IS NULL) > 0 as reposted
          FROM posts p
          INNER JOIN users u ON p.user_id = u.id
          LEFT JOIN post_tags pt ON p.id = pt.post_id
          LEFT JOIN tags t ON pt.tag_id = t.id
          LEFT JOIN ratings r ON p.id = r.post_id
          WHERE p.id = :id AND p.deleted_at IS NULL
          GROUP BY p.id";

$stmt = $db->prepare($query);
$stmt->bindValue(':id', $id, PDO::PARAM_INT);
$stmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
$stmt->execute();
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row) {
    $row['tags'] = $row['tags'] ? explode(',', $row['tags']) : [];
    $row['avg_rating'] = $row['avg_rating'] ? round((float)$row['avg_rating'], 1) : 0;
    $row['content'] = html_entity_decode($row['content']);
    $row['excerpt'] = html_entity_decode($row['excerpt'] ?? '');
    $row['total_likes'] = (int)$row['total_likes'];
    $row['total_comments'] = (int)$row['total_comments'];
    $row['author_followers'] = (int)$row['author_followers'];
    $row['author_uid'] = encodeId($row['author_id']);
    $row['liked'] = isset($row['liked']) ? (bool)$row['liked'] : false;
    $row['reposted'] = isset($row['reposted']) ? (bool)$row['reposted'] : false;

    // ── QUERY PHỤ: Lấy ảnh Gallery từ post_images ──
    $img_stmt = $db->prepare("SELECT id, image_url, created_at FROM post_images WHERE post_id = ? ORDER BY created_at ASC");
    $img_stmt->execute([$id]);
    $row['gallery'] = $img_stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($row);
} else {
    http_response_code(404);
    echo json_encode(["message" => "Không tìm thấy bài viết."]);
}
?>
