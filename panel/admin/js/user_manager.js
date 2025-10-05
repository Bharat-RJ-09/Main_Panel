// admin/js/user_manager.js

document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_SESSION_KEY = 'nextEarnXAdminSession';
    const userTableBody = document.getElementById('userTableBody');
    const userSearchInput = document.getElementById('userSearchInput');
    const searchBtn = document.getElementById('searchBtn');
    const userCountElement = document.getElementById('userCount');

    // --- 1. SECURITY CHECK (Copied from dashboard.js) ---
    function checkAdminSession() {
        if (localStorage.getItem(ADMIN_SESSION_KEY) !== 'true') {
            alert('Access Denied. Please log in.');
            window.location.href = 'admin_login.html';
        }
    }
    checkAdminSession();

    // --- 2. DATA UTILITY (Reads User Data) ---
    function loadUsers() {
        try {
            // NOTE: We rely on the key set by panel/js/signup.js
            return JSON.parse(localStorage.getItem("nextEarnXUsers") || "[]");
        } catch {
            return [];
        }
    }

    // --- 3. RENDERING ---
    function renderUserTable(users) {
        userTableBody.innerHTML = ''; // Clear table
        
        if (users.length === 0) {
            userTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No users found.</td></tr>';
            userCountElement.textContent = '0 users displayed.';
            return;
        }

        users.forEach((user, index) => {
            const row = userTableBody.insertRow();
            // Simple unique ID based on index + 1
            const userId = index + 1; 

            row.innerHTML = `
                <td>${userId}</td>
                <td>${user.username}</td>
                <td>${user.fullname}</td>
                <td>${user.email}</td>
                <td>${user.mobile}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-username="${user.username}"><i class="ri-edit-2-line"></i> Edit</button>
                    <button class="delete-btn" data-username="${user.username}"><i class="ri-delete-bin-line"></i> Delete</button>
                </td>
            `;
        });
        userCountElement.textContent = `${users.length} users displayed. Total registered users: ${loadUsers().length}`;

        // Re-attach event listeners after rendering
        attachActionListeners();
    }

    // --- 4. SEARCH/FILTERING ---
    function searchUsers() {
        const query = userSearchInput.value.toLowerCase();
        const allUsers = loadUsers();
        
        const filteredUsers = allUsers.filter(user => 
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.fullname.toLowerCase().includes(query)
        );
        
        renderUserTable(filteredUsers);
    }

    searchBtn.addEventListener('click', searchUsers);
    userSearchInput.addEventListener('keyup', searchUsers); // Live search

    // --- 5. ACTION LISTENERS (MOCK FUNCTIONS) ---
    function attachActionListeners() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const username = e.currentTarget.dataset.username;
                alert(`MOCK: Editing user ${username}. (Future feature: Modal for changing password/subscription status)`);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const username = e.currentTarget.dataset.username;
                if (confirm(`WARNING: Are you sure you want to delete user "${username}"? This cannot be undone.`)) {
                    alert(`MOCK: Deleting user ${username}. (Future feature: implement actual deletion)`);
                    // TODO: Implement actual deletion logic here
                }
            });
        });
    }

    // --- INITIALIZE ---
    renderUserTable(loadUsers());
});