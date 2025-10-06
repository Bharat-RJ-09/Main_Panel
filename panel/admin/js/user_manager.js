// admin/js/user_manager.js - FINAL WITH FREEZE/BAN LOGIC

document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_SESSION_KEY = 'nextEarnXAdminSession';
    const USER_STORAGE_KEY = "nextEarnXUsers";
    const userTableBody = document.getElementById('userTableBody');
    const userSearchInput = document.getElementById('userSearchInput');
    const searchBtn = document.getElementById('searchBtn');
    const userCountElement = document.getElementById('userCount');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn'); 
    
    // Modal Elements
    const modal = document.getElementById('editUserModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalUsername = document.getElementById('modalUsername');
    const editUsernameHidden = document.getElementById('editUsernameHidden');
    const editUserForm = document.getElementById('editUserForm');
    const newPasswordInput = document.getElementById('newPassword');
    const subscriptionPlanSelect = document.getElementById('subscriptionPlan');
    const expiryDateInput = document.getElementById('expiryDate');
    // NEW: Ban/Freeze Element
    const accountStatusSelect = document.getElementById('accountStatus'); 

    // --- 1. SECURITY CHECK ---
    function checkAdminSession() {
        if (localStorage.getItem(ADMIN_SESSION_KEY) !== 'true') {
            alert('Access Denied. Please log in.');
            window.location.href = 'admin_login.html';
        }
    }
    checkAdminSession();
    
    // Logout handler for robustness
    if(adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem(ADMIN_SESSION_KEY);
            window.location.href = 'admin_login.html';
        });
    }

    // --- 2. DATA UTILITY (CRUD CORE) ---
    function loadUsers() {
        try {
            return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "[]");
        } catch {
            return [];
        }
    }
    
    function saveUsers(users) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
    }

    function deleteUser(usernameToDelete) {
        let users = loadUsers();
        const initialLength = users.length;
        users = users.filter(user => user.username !== usernameToDelete);
        
        if (users.length < initialLength) {
            saveUsers(users);
            return true;
        } else {
            return false;
        }
    }

    function findUser(username) {
        return loadUsers().find(user => user.username === username);
    }
    
    function updateUser(usernameToUpdate, updates) {
        let users = loadUsers();
        let userIndex = users.findIndex(user => user.username === usernameToUpdate);

        if (userIndex !== -1) {
            // Apply updates
            users[userIndex] = { ...users[userIndex], ...updates };
            saveUsers(users);
            return true;
        }
        return false;
    }

    // --- 3. MODAL HANDLERS ---
    function openEditModal(username) {
        const user = findUser(username);
        if (!user) {
            alert("Error: User data not found.");
            return;
        }
        
        modalUsername.textContent = username;
        editUsernameHidden.value = username;
        newPasswordInput.value = ''; // Clear password field on open

        // Subscription Fields
        const currentPlan = user.plan || 'none';
        const currentExpiry = user.expiry ? new Date(user.expiry).toISOString().substring(0, 10) : '';
        subscriptionPlanSelect.value = currentPlan;
        expiryDateInput.value = currentExpiry;
        
        // NEW: Ban/Freeze Field
        const currentStatus = user.status || 'active'; // Default to active
        if (accountStatusSelect) {
            accountStatusSelect.value = currentStatus;
        }

        modal.style.display = 'flex';
    }

    function closeEditModal() {
        modal.style.display = 'none';
        editUserForm.reset();
    }
    
    closeModalBtn.addEventListener('click', closeEditModal);

    editUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = editUsernameHidden.value;
        const updates = {};
        
        // 1. Password Update
        if (newPasswordInput.value.trim() !== '') {
            updates.password = newPasswordInput.value.trim();
        }

        // 2. Subscription Update
        const selectedPlan = subscriptionPlanSelect.value;
        const expiryDate = expiryDateInput.value;

        if (selectedPlan === 'none') {
            updates.plan = null;
            updates.expiry = null;
        } else {
            updates.plan = selectedPlan;
            updates.expiry = new Date(expiryDate).getTime();
            
            if (selectedPlan === '1 Week Free Trial') {
                 updates.hasTakenFreeTrial = true;
            }
        }
        
        // 3. NEW: Account Status Update (Ban/Freeze)
        if (accountStatusSelect) {
            updates.status = accountStatusSelect.value;
        }


        if (updateUser(username, updates)) {
            alert(`✅ User ${username} updated successfully!`);
            closeEditModal();
            renderUserTable(loadUsers()); // Re-render table
        } else {
            alert('❌ Failed to update user.');
        }
    });


    // --- 4. RENDERING & INITIALIZATION ---
    function renderUserTable(users) {
        userTableBody.innerHTML = ''; 
        
        if (users.length === 0) {
            userTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No users found.</td></tr>';
            userCountElement.textContent = '0 users displayed.';
            return;
        }

        users.forEach((user, index) => {
            const row = userTableBody.insertRow();
            const userId = index + 1; 
            
            // Highlight row if banned/frozen
            if (user.status === 'banned') {
                row.style.backgroundColor = 'rgba(255, 0, 0, 0.2)'; // Red tint for ban
                row.style.color = '#ffaaaa';
            }


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

        // CRITICAL: Yeh call hona zaroori hai har baar table render hone ke baad
        attachActionListeners();
    }

    // --- 5. SEARCH/FILTERING (Remains the same) ---
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
    userSearchInput.addEventListener('keyup', searchUsers); 

    // --- 6. ACTION LISTENERS ---
    function attachActionListeners() {
        // Edit button listener (NOW OPENS MODAL)
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const username = e.currentTarget.dataset.username;
                openEditModal(username); // Call the new modal function
            });
        });

        // Delete button listener (Remains the same)
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const username = e.currentTarget.dataset.username;
                if (confirm(`WARNING: Are you sure you want to delete user "${username}"? This cannot be undone.`)) {
                    if (deleteUser(username)) {
                        alert(`✅ User ${username} deleted successfully!`);
                        renderUserTable(loadUsers());
                    } else {
                        alert(`❌ Error: User ${username} not found.`);
                    }
                }
            });
        });
    }

    // --- INITIALIZE ---
    renderUserTable(loadUsers());
});