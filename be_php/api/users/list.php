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

// Parameters
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 15;
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$offset = ($page - 1) * $limit;

// Base query parts
$where_clauses = [];
$bind_params = [];

if ($search !== '') {
    $where_clauses[] = "(username LIKE ? OR full_name LIKE ?)";
    $bind_params[] = '%' . $search . '%';
    $bind_params[] = '%' . $search . '%';
}

$where_sql = '';
if (!empty($where_clauses)) {
    $where_sql = ' WHERE ' . implode(' AND ', $where_clauses);
}

// 1. Count Total
$count_query = "SELECT COUNT(*) as total FROM users" . $where_sql;
$count_stmt = $db->prepare($count_query);
$count_stmt->execute($bind_params);
$total_users = (int)$count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
$total_pages = max(1, ceil($total_users / $limit));

// 2. Fetch Data
$query = "SELECT id, username, role, created_at FROM users" . $where_sql . " ORDER BY id ASC LIMIT ? OFFSET ?";
$stmt = $db->prepare($query);

// Bind params: PDO execute handles positional parameters, but LIMIT/OFFSET must be bound as INTs
$param_idx = 1;
foreach ($bind_params as $val) {
    $stmt->bindValue($param_idx++, $val);
}
$stmt->bindValue($param_idx++, $limit, PDO::PARAM_INT);
$stmt->bindValue($param_idx++, $offset, PDO::PARAM_INT);
$stmt->execute();

$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

http_response_code(200);
echo json_encode([
    "status" => "success",
    "users" => $users,
    "total_users" => $total_users,
    "total_pages" => $total_pages,
    "page" => $page,
    "limit" => $limit
]);
?>
