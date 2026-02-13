<?php
session_start();

// ==================== CONFIG ====================
$DB_HOST     = 'localhost';
$DB_NAME     = 'craviing_margivisal';
$DB_USER     = 'craviing_adyems';
$DB_PASS     = '#adyems123AD';
$ADMIN_PASSWORD = 'SERVER0023573JH'; // ← CHANGE THIS IN PRODUCTION!

$PER_PAGE = 50; // Entries per page

// Simple session-based login
$isLoggedIn = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

// Handle login
if (isset($_POST['login'])) {
    $pass = trim($_POST['password'] ?? '');
    if ($pass === $ADMIN_PASSWORD) {
        $_SESSION['admin_logged_in'] = true;
        header("Location: word_display.php");
        exit;
    } else {
        $loginError = "Incorrect password";
    }
}

// Handle logout
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: word_display.php");
    exit;
}

// Only proceed if logged in
if (!$isLoggedIn) {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                font-family: system-ui, -apple-system, sans-serif;
                background: #0F0F0F;
                color: #ddd;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .login-container {
                background: #1A1A1A;
                border-radius: 16px;
                padding: 40px;
                width: 100%;
                max-width: 420px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.6);
                border: 1px solid #2A2A2A;
            }
            h1 {
                text-align: center;
                color: #fff;
                margin-bottom: 32px;
                font-size: 28px;
            }
            .form-group {
                margin-bottom: 24px;
            }
            label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #ccc;
            }
            .password-wrapper {
                position: relative;
            }
            input[type="password"],
            input[type="text"] {
                width: 100%;
                padding: 14px 16px;
                background: #222;
                border: 1px solid #444;
                border-radius: 10px;
                color: #fff;
                font-size: 16px;
                transition: border-color 0.2s;
            }
            input:focus {
                outline: none;
                border-color: #6366f1;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
            }
            .toggle-password {
                position: absolute;
                right: 16px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #aaa;
                font-size: 18px;
                cursor: pointer;
            }
            button {
                width: 100%;
                padding: 16px;
                background: #6366f1;
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
            }
            button:hover {
                background: #4f46e5;
            }
            button:disabled {
                background: #444;
                cursor: not-allowed;
            }
            .error {
                background: #7f1d1d;
                color: #fecaca;
                padding: 12px;
                border-radius: 8px;
                margin-bottom: 20px;
                text-align: center;
            }
            .loading {
                display: none;
                text-align: center;
                margin-top: 16px;
                color: #6366f1;
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <h1>Admin Login</h1>

            <?php if (isset($loginError)): ?>
                <div class="error"><?= htmlspecialchars($loginError) ?></div>
            <?php endif; ?>

            <form method="post" id="loginForm">
                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="password-wrapper">
                        <input type="password" id="password" name="password" required autofocus>
                        <button type="button" class="toggle-password" onclick="togglePassword()">👁️</button>
                    </div>
                </div>

                <button type="submit" name="login" id="loginBtn">Login</button>
                <div class="loading" id="loading">Logging in...</div>
            </form>
        </div>

        <script>
            function togglePassword() {
                const pass = document.getElementById('password');
                const icon = document.querySelector('.toggle-password');
                if (pass.type === 'password') {
                    pass.type = 'text';
                    icon.textContent = '🙈';
                } else {
                    pass.type = 'password';
                    icon.textContent = '👁️';
                }
            }

            // Show loading on submit
            document.getElementById('loginForm').addEventListener('submit', () => {
                document.getElementById('loginBtn').disabled = true;
                document.getElementById('loading').style.display = 'block';
            });
        </script>
    </body>
    </html>
    <?php
    exit;
}

// Database connection
try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    die("Database connection failed: " . htmlspecialchars($e->getMessage()));
}

// Pagination
$page = max(1, (int)($_GET['page'] ?? 1));
$offset = ($page - 1) * $PER_PAGE;

// Handle actions
$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'update') {
        $id              = (int)($_POST['id'] ?? 0);
        $local_phrase    = trim($_POST['local_phrase'] ?? '');
        $english_meaning = trim($_POST['english_meaning'] ?? '');
        $context         = trim($_POST['context'] ?? '');

        if ($id > 0 && $local_phrase && $english_meaning) {
            try {
                $stmt = $pdo->prepare("
                    UPDATE suggestions
                    SET local_phrase    = ?,
                        english_meaning = ?,
                        context         = ?,
                        submitted_at    = NOW()
                    WHERE id = ?
                ");
                $stmt->execute([$local_phrase, $english_meaning, $context ?: null, $id]);
                $message = "Entry #$id updated successfully.";
            } catch (Exception $e) {
                $message = "Update failed: " . $e->getMessage();
            }
        } else {
            $message = "Missing required fields.";
        }
    } elseif ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        if ($id > 0) {
            try {
                $stmt = $pdo->prepare("DELETE FROM suggestions WHERE id = ?");
                $stmt->execute([$id]);
                $message = "Entry #$id deleted.";
            } catch (Exception $e) {
                $message = "Delete failed: " . $e->getMessage();
            }
        }
    }

    // Redirect to avoid form resubmit
    header("Location: word_display.php?page=$page&msg=" . urlencode($message));
    exit;
}

// Get message from redirect
$message = $_GET['msg'] ?? '';

// Count total approved entries
$totalStmt = $pdo->query("SELECT COUNT(*) FROM suggestions WHERE status = 'approved'");
$totalEntries = (int)$totalStmt->fetchColumn();
$totalPages = max(1, ceil($totalEntries / $PER_PAGE));

// Fetch paginated approved suggestions
try {
    $stmt = $pdo->prepare("
        SELECT id, language_key, local_phrase, english_meaning, context,
               full_name, submitted_at
        FROM suggestions
        WHERE status = 'approved'
        ORDER BY submitted_at DESC
        LIMIT :limit OFFSET :offset
    ");
    $stmt->bindValue(':limit', $PER_PAGE, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $entries = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    $entries = [];
    $message = "Could not load entries: " . $e->getMessage();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin – All Approved Words</title>
    <style>
        * { box-sizing: border-box; margin:0; padding:0; }
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background: #0F0F0F;
            color: #ddd;
            min-height: 100vh;
            padding: 20px;
            line-height: 1.5;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #2A2A2A;
        }
        h1 {
            color: #fff;
            font-size: 28px;
        }
        .logout {
            color: #ff6b6b;
            text-decoration: none;
            font-weight: 600;
        }
        .logout:hover { text-decoration: underline; }

        .message {
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .success { background: #064e3b; color: #6ee7b7; }
        .error   { background: #7f1d1d; color: #fecaca; }

        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 16px;
            margin: 24px 0;
            flex-wrap: wrap;
        }
        .pagination a, .pagination span {
            padding: 10px 16px;
            border-radius: 8px;
            background: #1A1A1A;
            color: #ddd;
            text-decoration: none;
            border: 1px solid #2A2A2A;
        }
        .pagination a:hover { background: #2A2A2A; }
        .pagination .current {
            background: #6366f1;
            color: white;
            border-color: #6366f1;
        }
        .pagination .disabled { opacity: 0.5; pointer-events: none; }

        table {
            width: 100%;
            border-collapse: collapse;
            background: #1A1A1A;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        th, td {
            padding: 14px 16px;
            text-align: left;
            border-bottom: 1px solid #2A2A2A;
        }
        th {
            background: #222;
            color: #ccc;
            font-weight: 600;
        }
        tr:hover { background: #222; }
        .actions { white-space: nowrap; }
        .btn {
            padding: 8px 14px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            margin-right: 8px;
            transition: 0.2s;
        }
        .edit-btn   { background: #dbeafe; color: #1d4ed8; }
        .delete-btn { background: #fee2e2; color: #991b1b; }
        .save-btn   { background: #10b981; color: white; }
        .btn:hover  { opacity: 0.9; }

        .edit-form {
            display: none;
            background: #222;
            padding: 20px;
            border-radius: 12px;
            margin: 12px 0;
        }
        .edit-form input,
        .edit-form textarea {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            background: #1A1A1A;
            border: 1px solid #444;
            border-radius: 8px;
            color: #ddd;
            font-size: 15px;
        }
        .edit-form textarea { min-height: 100px; resize: vertical; }

        .empty {
            text-align: center;
            color: #888;
            padding: 60px 20px;
            font-size: 1.2rem;
        }
    </style>
</head>
<body>

<div class="container">
    <header>
        <h1>All Approved Words / Suggestions</h1>
        <a href="?logout=1" class="logout">Logout</a>
    </header>

    <?php if ($message): ?>
        <div class="message <?= strpos($message, 'success') !== false ? 'success' : 'error' ?>">
            <?= htmlspecialchars($message) ?>
        </div>
    <?php endif; ?>

    <!-- Pagination -->
    <?php if ($totalPages > 1): ?>
        <div class="pagination">
            <a href="?page=<?= max(1, $page - 1) ?>" class="<?= $page <= 1 ? 'disabled' : '' ?>">← Previous</a>

            <?php
            $startPage = max(1, $page - 2);
            $endPage   = min($totalPages, $page + 2);

            for ($i = $startPage; $i <= $endPage; $i++): ?>
                <a href="?page=<?= $i ?>" class="<?= $i === $page ? 'current' : '' ?>">
                    <?= $i ?>
                </a>
            <?php endfor; ?>

            <a href="?page=<?= min($totalPages, $page + 1) ?>" class="<?= $page >= $totalPages ? 'disabled' : '' ?>">Next →</a>
        </div>
    <?php endif; ?>

    <?php if (empty($entries)): ?>
        <div class="empty">No approved entries found in the database.</div>
    <?php else: ?>
        <p style="color:#aaa; margin: 16px 0; text-align:center;">
            Showing <?= count($entries) ?> of <?= $totalEntries ?> approved entries (Page <?= $page ?> of <?= $totalPages ?>)
        </p>

        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Language</th>
                    <th>Local Phrase</th>
                    <th>English Meaning</th>
                    <th>Context</th>
                    <th>Submitted by</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
            <?php foreach ($entries as $row): ?>
                <tr id="row-<?= $row['id'] ?>">
                    <td><?= $row['id'] ?></td>
                    <td><?= htmlspecialchars($row['language_key']) ?></td>
                    <td><?= htmlspecialchars($row['local_phrase']) ?></td>
                    <td><?= htmlspecialchars($row['english_meaning']) ?></td>
                    <td><?= htmlspecialchars($row['context'] ?? '—') ?></td>
                    <td><?= htmlspecialchars($row['full_name'] ?? '—') ?></td>
                    <td><?= date('Y-m-d H:i', strtotime($row['submitted_at'])) ?></td>
                    <td class="actions">
                        <button class="btn edit-btn"
                                onclick="toggleEditForm(<?= $row['id'] ?>)">Edit</button>
                        <form method="post" style="display:inline;"
                              onsubmit="return confirm('Really delete entry #<?= $row['id'] ?>? This cannot be undone.');">
                            <input type="hidden" name="action" value="delete">
                            <input type="hidden" name="id" value="<?= $row['id'] ?>">
                            <button type="submit" class="btn delete-btn">Delete</button>
                        </form>
                    </td>
                </tr>

                <!-- Edit form -->
                <tr>
                    <td colspan="8">
                        <div id="edit-<?= $row['id'] ?>" class="edit-form">
                            <form method="post">
                                <input type="hidden" name="action" value="update">
                                <input type="hidden" name="id" value="<?= $row['id'] ?>">

                                <input type="text" name="local_phrase"
                                       value="<?= htmlspecialchars($row['local_phrase']) ?>"
                                       placeholder="Local phrase" required>

                                <input type="text" name="english_meaning"
                                       value="<?= htmlspecialchars($row['english_meaning']) ?>"
                                       placeholder="English meaning" required>

                                <textarea name="context"
                                          placeholder="Context (optional)"><?= htmlspecialchars($row['context'] ?? '') ?></textarea>

                                <button type="submit" class="btn save-btn">Save Changes</button>
                                <button type="button" class="btn"
                                        onclick="toggleEditForm(<?= $row['id'] ?>)">Cancel</button>
                            </form>
                        </div>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>

        <!-- Bottom pagination -->
        <?php if ($totalPages > 1): ?>
            <div class="pagination" style="margin-top: 32px;">
                <a href="?page=<?= max(1, $page - 1) ?>" class="<?= $page <= 1 ? 'disabled' : '' ?>">← Previous</a>

                <?php for ($i = $startPage; $i <= $endPage; $i++): ?>
                    <a href="?page=<?= $i ?>" class="<?= $i === $page ? 'current' : '' ?>">
                        <?= $i ?>
                    </a>
                <?php endfor; ?>

                <a href="?page=<?= min($totalPages, $page + 1) ?>" class="<?= $page >= $totalPages ? 'disabled' : '' ?>">Next →</a>
            </div>
        <?php endif; ?>
    <?php endif; ?>
</div>

<script>
function toggleEditForm(id) {
    const form = document.getElementById('edit-' + id);
    form.style.display = form.style.display === 'block' ? 'none' : 'block';
}
</script>

</body>
</html>