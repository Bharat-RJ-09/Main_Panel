// admin/js/user_manager.js - WITH EDIT/UPDATE LOGIC

document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_SESSION_KEY = 'nextEarnXAdminSession';
    const USER_STORAGE_KEY = "nextEarnXUsers";
    const userTableBody = document.getElementById('userTableBody');
    const userSearchInput = document.getElementById('userSearchInput');
    const searchBtn = document.getElementById('searchBtn');
    const userCountElement = document.getElementById('userCount');
    
    // Modal Elements
    const modal = document.getElementById('editUserModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalUsername = document.getElementById('modalUsername');
    const editUsernameHidden = document.getElementById('editUsernameHidden');
    const editUserForm = document.getElementById('editUserForm');
    const newPasswordInput = document.getElementById('newPassword');
    // START: ADDED new element
    const userStatusSelect = document.getElementById('userStatus');
    // END: ADDED new element
    const subscriptionPlanSelect = document.getElementById('subscriptionPlan');
    const expiryDateInput = document.getElementById('expiryDate');

    // --- 1. SECURITY CHECK ---
    function checkAdminSession() {
        if (localStorage.getItem(ADMIN_SESSION_KEY) !== 'true') {
            alert('Access Denied. Please log in.');
            window.location.href = 'admin_login.html';
        }
    }
    checkAdminSession();

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

    // NEW: Function to find user by username
    function findUser(username) {
        return loadUsers().find(user => user.username === username);
    }
    
    // NEW: Function to update user details
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

        // START: NEW STATUS CONTROL LOAD
        const currentStatus = user.status || 'active'; // Default to active
        userStatusSelect.value = currentStatus;
        // END: NEW STATUS CONTROL LOAD
        
        // Mock: Set current subscription status
        const currentPlan = user.plan || 'none';
        const currentExpiry = user.expiry ? new Date(user.expiry).toISOString().substring(0, 10) : '';

        subscriptionPlanSelect.value = currentPlan;
        expiryDateInput.value = currentExpiry;

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

        // START: NEW STATUS SAVE
        updates.status = userStatusSelect.value;
        // END: NEW STATUS SAVE

        // 2. Subscription Update
        const selectedPlan = subscriptionPlanSelect.value;
        const expiryDate = expiryDateInput.value;

        if (selectedPlan === 'none') {
            updates.plan = null;
            updates.expiry = null;
        } else {
            updates.plan = selectedPlan;
            // Convert expiry date string to timestamp for consistency with user panel logic
            updates.expiry = new Date(expiryDate).getTime();
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
            // Updated colspan to 7
            userTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No users found.</td></tr>';
            userCountElement.textContent = '0 users displayed.';
            return;
        }

        users.forEach((user, index) => {
            const row = userTableBody.insertRow();
            const userId = index + 1; 
            
            // START: NEW STATUS DISPLAY
            const userStatus = user.status || 'active'; 
            const statusClass = userStatus === 'banned' ? 'status-banned' : userStatus === 'frozen' ? 'status-frozen' : 'status-active';
            // END: NEW STATUS DISPLAY

            row.innerHTML = `
                <td>${userId}</td>
                <td>${user.username}</td>
                <td>${user.fullname}</td>
                <td>${user.email}</td>
                <td>${user.mobile}</td>
                <td class="${statusClass}">${userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-username="${user.username}"><i class="ri-edit-2-line"></i> Edit</button>
                    <button class="delete-btn" data-username="${user.username}"><i class="ri-delete-bin-line"></i> Delete</button>
                </td>
            `;
        });
        userCountElement.textContent = `${users.length} users displayed. Total registered users: ${loadUsers().length}`;

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

    // --- 6. ACTION LISTENERS (UPDATED EDIT LOGIC) ---
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