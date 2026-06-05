<?php

include_once '../../config/database.php';
include_once '../auth/token_helper.php';

$auth_user = get_auth_user();
if (!$auth_user || !isset($auth_user['role']) || $auth_user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["message" => "Access denied. Admin only."]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

$keyword   = isset($_GET['keyword'])   ? trim($_GET['keyword'])   : '';
$author    = isset($_GET['author'])    ? trim($_GET['author'])    : '';
$hashtag   = isset($_GET['hashtag'])   ? trim($_GET['hashtag'])   : '';
$date_from = isset($_GET['date_from']) ? trim($_GET['date_from']) : '';
$date_to   = isset($_GET['date_to'])   ? trim($_GET['date_to'])   : '';

$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 15;
$offset = ($page - 1) * $limit;

// Filter clauses
$where_clauses = ["p.deleted_at IS NULL"];
$params = [];

if ($keyword !== '') {
    $where_clauses[] = "p.title LIKE ?";
    $params[] = '%' . $keyword . '%';
}
if ($author !== '') {
    $where_clauses[] = "u.username LIKE ?";
    $params[] = '%' . $author . '%';
}
if ($date_from !== '') {
    $where_clauses[] = "DATE(p.created_at) >= ?";
    $params[] = $date_from;
}
if ($date_to !== '') {
    $where_clauses[] = "DATE(p.created_at) <= ?";
    $params[] = $date_to;
}
if ($hashtag !== '') {
    $where_clauses[] = "p.id IN (
        SELECT pt2.post_id FROM post_tags pt2
        JOIN tags t2 ON pt2.tag_id = t2.id
        WHERE t2.name LIKE ?
    )";
    $params[] = '%' . $hashtag . '%';
}

$where_sql = " WHERE " . implode(" AND ", $where_clauses);

// 1. Count Total matching posts
$count_sql = "SELECT COUNT(DISTINCT p.id) as total FROM posts p INNER JOIN users u ON p.user_id = u.id" . $where_sql;
try {
    $count_stmt = $db->prepare($count_sql);
    $count_stmt->execute($params);
    $total_posts = (int)$count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
    $total_pages = max(1, ceil($total_posts / $limit));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "SQL error count: " . $e->getMessage()]);
    exit();
}

// 2. Fetch data
$sql = "SELECT 
            p.id,
            p.title,
            LEFT(p.content, 120) AS content,
            p.created_at,
            u.id   AS author_id,
            u.username AS author_name,
            (SELECT GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR ',') 
             FROM post_tags pt JOIN tags t ON pt.tag_id = t.id WHERE pt.post_id = p.id) AS tags,
            (SELECT ROUND(AVG(r.stars), 1) FROM ratings r WHERE r.post_id = p.id) AS avg_rating,
            (SELECT COUNT(*) FROM likes lk WHERE lk.post_id = p.id) AS total_likes,
            (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id) AS total_comments
        FROM posts p
        INNER JOIN users u ON p.user_id = u.id
        " . $where_sql . "
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?";

try {
    $stmt = $db->prepare($sql);
    
    // Bind position variables
    $idx = 1;
    foreach ($params as $p) {
        $stmt->bindValue($idx++, $p);
    }
    $stmt->bindValue($idx++, $limit, PDO::PARAM_INT);
    $stmt->bindValue($idx++, $offset, PDO::PARAM_INT);
    $stmt->execute();

    $posts = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $row['tags']           = $row['tags'] ? explode(',', $row['tags']) : [];
        $row['avg_rating']     = $row['avg_rating'] ? (float)$row['avg_rating'] : 0;
        $row['total_likes']    = (int)$row['total_likes'];
        $row['total_comments'] = (int)$row['total_comments'];
        $posts[] = $row;
    }

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "posts" => $posts,
        "total_posts" => $total_posts,
        "total_pages" => $total_pages,
        "page" => $page,
        "limit" => $limit
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "SQL error data: " . $e->getMessage()]);
}
?>
