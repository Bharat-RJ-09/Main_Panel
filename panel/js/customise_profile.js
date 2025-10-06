// panel/js/customise_profile.js - Full Profile Customization Logic (Logo, Edit Name, Copy Info)

document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements
    const profileLogoImg = document.getElementById('profileLogoImg');
    const customLogoInput = document.getElementById('customLogoInput');
    const uploadLogoBtn = document.getElementById('uploadLogoBtn');
    const resetLogoBtn = document.getElementById('resetLogoBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const welcomeUsername = document.getElementById('welcomeUsername');
    
    // Info Display Elements
    const mainUsernameDisplay = document.getElementById('mainUsername');
    const mainMobileDisplay = document.getElementById('mainMobile');
    const infoElements = {
        fullname: document.getElementById('infoFullname'),
        username: document.getElementById('infoUsername'),
        email: document.getElementById('infoEmail'),
        mobile: document.getElementById('infoMobileNumber'),
    };
    
    // Keys
    const USER_KEY = 'nextEarnXCurrentUser';
    const USERS_LIST_KEY = 'nextEarnXUsers';
    const CUSTOM_LOGO_KEY = 'nextEarnXCustomLogo';
    const DEFAULT_LOGO_PATH = 'logo.png'; 
    let currentUser = null;


    // --- UTILITIES ---
    function loadUsersList() {
        try { return JSON.parse(localStorage.getItem(USERS_LIST_KEY) || "[]"); }
        catch { return []; }
    }
    
    function saveUsersList(users) {
        localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
    }
    
    function getCurrentUser() {
        try {
            currentUser = JSON.parse(localStorage.getItem(USER_KEY));
            if (!currentUser) {
                window.location.href = 'login.html'; // Redirect if not logged in
                return null;
            }
            return currentUser;
        } catch { return null; }
    }
    
    function saveCurrentUser() {
         localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    }

    // Function to update user in the main list
    function updateMainUserList(updatedUser) {
        let allUsers = loadUsersList();
        const index = allUsers.findIndex(u => u.username === updatedUser.username);
        if (index !== -1) {
            allUsers[index] = updatedUser;
            saveUsersList(allUsers);
        }
    }
    
    function updateUI() {
        if (!currentUser) return;
        
        // Header Info
        mainUsernameDisplay.textContent = currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1);
        mainMobileDisplay.textContent = currentUser.mobile;
        welcomeUsername.textContent = currentUser.username;
        
        // Profile Info Fields
        infoElements.fullname.textContent = currentUser.fullname || 'N/A';
        infoElements.username.textContent = currentUser.username || 'N/A';
        infoElements.email.textContent = currentUser.email || 'N/A';
        infoElements.mobile.textContent = currentUser.mobile || 'N/A';
        
        // Logo Load
        const savedLogo = localStorage.getItem(CUSTOM_LOGO_KEY);
        profileLogoImg.src = savedLogo || DEFAULT_LOGO_PATH;
    }
    
    // --- CORE LOGIC: LOGO CHANGE ---
    
    if (profileLogoImg && customLogoInput && uploadLogoBtn) {
        
        // 1. Trigger file input when upload button is clicked
        uploadLogoBtn.addEventListener('click', () => {
            customLogoInput.click();
        });

        // 2. Handle file selection and save to localStorage
        customLogoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    localStorage.setItem(CUSTOM_LOGO_KEY, e.target.result);
                    profileLogoImg.src = e.target.result;
                    alert("✅ Logo updated successfully! Reload dashboard to see the change.");
                };
                reader.readAsDataURL(file);
            }
        });
        
        // 3. Reset to Default
        resetLogoBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to reset the app logo to default?")) {
                localStorage.removeItem(CUSTOM_LOGO_KEY);
                profileLogoImg.src = DEFAULT_LOGO_PATH; // Load default path
                alert("✅ Logo reset to default. Reload dashboard to see the change.");
            }
        });
    }

    // --- CORE LOGIC: EDIT FULLNAME (Password is mock edit) ---
    
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const field = e.target.dataset.field;
            const group = e.target.closest('.info-group');
            const valueElement = group.querySelector('.info-value');
            
            if (field === 'password-mock') {
                 alert("⚠️ Password change feature is under development. Please contact admin if urgent.");
                 return;
            }
            
            if (field === 'fullname') {
                const currentValue = valueElement.textContent;
                
                // Replace P tag with Input field
                const input = document.createElement('input');
                input.type = 'text';
                input.value = currentValue;
                input.id = 'tempEditInput';
                
                valueElement.style.display = 'none';
                group.insertBefore(input, valueElement.nextSibling);

                // Change icon to Save
                e.target.classList.remove('ri-pencil-line');
                e.target.classList.add('ri-save-line');
                e.target.removeEventListener('click', arguments.callee); // Remove current listener

                // New Save Listener
                e.target.addEventListener('click', () => {
                    const newValue = input.value.trim();
                    if (newValue && newValue !== currentValue) {
                        
                        // Save to localStorage
                        currentUser.fullname = newValue;
                        saveCurrentUser();
                        updateMainUserList(currentUser);
                        
                        valueElement.textContent = newValue;
                        alert("✅ Full Name updated!");
                    }
                    
                    // Cleanup
                    input.remove();
                    valueElement.style.display = 'block';
                    e.target.classList.remove('ri-save-line');
                    e.target.classList.add('ri-pencil-line');
                    updateUI(); // Refresh UI
                });
            }
        });
    });

    // --- CORE LOGIC: COPY INFORMATION ---
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const group = e.target.closest('.info-group');
            const value = group.querySelector('.info-value').textContent;
            
            navigator.clipboard.writeText(value)
                .then(() => {
                    alert(`✅ Copied: ${value}`);
                })
                .catch(err => {
                    console.error('Could not copy text: ', err);
                    alert('❌ Failed to copy text.');
                });
        });
    });


    // --- LOGOUT HANDLER (For consistency) ---
    const handleLogout = () => {
        localStorage.removeItem('session'); 
        localStorage.removeItem('nextEarnXCurrentUser'); 
        alert("Logged out from NextEarnX!");
        window.location.href = 'login.html';
    };

    if(logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // --- INITIALIZE ---
    getCurrentUser();
    updateUI();
});