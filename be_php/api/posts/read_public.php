<?php

include_once '../../config/database.php';
include_once '../../config/id_helper.php';
include_once '../auth/token_helper.php';

$database = new Database();
$db = $database->getConnection();

$user = get_auth_user();
$user_id = $user ? (int)$user['id'] : 0;

// 1. Nhận tham số từ Request
$tag_filter = isset($_GET['tag']) ? trim($_GET['tag']) : '';
$keyword    = isset($_GET['keyword']) ? trim($_GET['keyword']) : '';
$page       = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit      = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
$sort       = isset($_GET['sort']) ? $_GET['sort'] : 'newest';

if ($page < 1) $page = 1;
$offset = ($page - 1) * $limit;

// --- XÂY DỰNG ĐIỀU KIỆN WHERE ĐỘNG ---
// Luôn lọc bỏ bài ẩn và bài đã xóa mềm
$where_clauses = ['p.is_hidden = 0', 'p.deleted_at IS NULL'];
$bind_params   = [];

if (!empty($tag_filter)) {
    $where_clauses[] = "p.id IN (
        SELECT pt.post_id FROM post_tags pt
        JOIN tags t ON pt.tag_id = t.id
        WHERE t.name = :tag
    )";
    $bind_params[':tag'] = $tag_filter;
}

if (!empty($keyword)) {
    $where_clauses[] = "(p.title LIKE :kw OR p.content LIKE :kw2)";
    $bind_params[':kw']  = '%' . $keyword . '%';
    $bind_params[':kw2'] = '%' . $keyword . '%';
}

$where_sql = 'WHERE ' . implode(' AND ', $where_clauses);

// --- BƯỚC 1: ĐẾM TỔNG ---
$count_query = "SELECT COUNT(DISTINCT p.id) as total FROM posts p $where_sql";
$count_stmt  = $db->prepare($count_query);
foreach ($bind_params as $k => $v) {
    $count_stmt->bindValue($k, $v);
}
$count_stmt->execute();
$total_posts = (int)$count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
$total_pages = max(1, ceil($total_posts / $limit));

// --- BƯỚC 2: LẤY DỮ LIỆU ---
$query = "SELECT 
            p.id, p.title, p.content, p.created_at, p.cover_image, 
            u.id as author_id, u.username as author_name,
            GROUP_CONCAT(DISTINCT tg.name) as tags,
            AVG(r.stars) as avg_rating,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as total_likes,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as total_comments,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = :user_id) > 0 as liked,
            (SELECT COUNT(*) FROM reposts WHERE post_id = p.id AND user_id = :user_id AND deleted_at IS NULL) > 0 as reposted
          FROM posts p
          INNER JOIN users u ON p.user_id = u.id
          LEFT JOIN post_tags pt ON p.id = pt.post_id
          LEFT JOIN tags tg ON pt.tag_id = tg.id
          LEFT JOIN ratings r ON p.id = r.post_id
          $where_sql
          GROUP BY p.id";

switch ($sort) {
    case 'top_rated':
        $query .= " ORDER BY avg_rating DESC, p.created_at DESC";
        break;
    case 'hot':
        $query .= " ORDER BY (total_likes + total_comments) DESC, p.created_at DESC";
        break;
    case 'newest':
    default:
        $query .= " ORDER BY p.created_at DESC";
        break;
}

$query .= " LIMIT :limit OFFSET :offset";

$stmt = $db->prepare($query);
foreach ($bind_params as $k => $v) {
    $stmt->bindValue($k, $v);
}
$stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
$stmt->execute();

$posts = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $row['tags']       = $row['tags'] ? explode(',', $row['tags']) : [];
    $row['avg_rating'] = $row['avg_rating'] ? round((float)$row['avg_rating'], 1) : 0;
    $row['content']    = html_entity_decode($row['content']);
    $row['hot_score']  = (int)$row['total_likes'] + (int)$row['total_comments'];
    $row['author_uid'] = encodeId($row['author_id']);
    $row['liked']      = isset($row['liked']) ? (bool)$row['liked'] : false;
    $row['reposted']   = isset($row['reposted']) ? (bool)$row['reposted'] : false;
    $posts[] = $row;
}

http_response_code(200);
echo json_encode([
    "status"     => "success",
    "pagination" => [
        "total_posts"  => $total_posts,
        "total_pages"  => $total_pages,
        "current_page" => $page,
        "limit"        => $limit,
    ],
    "data" => $posts,
]);
?>
