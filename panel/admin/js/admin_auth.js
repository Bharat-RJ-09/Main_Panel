// admin/js/admin_auth.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('adminLoginForm');
    const usernameInput = document.getElementById('adminUsername');
    const passwordInput = document.getElementById('adminPassword');
    const togglePasswordBtn = document.getElementById('togglePassword');

    // --- HARDCODED ADMIN CREDENTIALS ---
    const ADMIN_USER = 'nextEarnAdmin';
    const ADMIN_PASS = 'admin@786'; 
    const ADMIN_SESSION_KEY = 'nextEarnXAdminSession';

    // Password Toggle Logic (Copied from user panel)
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener("click", () => {
            const currentType = passwordInput.getAttribute("type");
            if (currentType === "password") {
                passwordInput.setAttribute("type", "text");
                togglePasswordBtn.textContent = "🔒"; 
            } else {
                passwordInput.setAttribute("type", "password");
                togglePasswordBtn.textContent = "👁";
            }
        });
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (username === ADMIN_USER && password === ADMIN_PASS) {
            // Success: Store simple session token
            localStorage.setItem(ADMIN_SESSION_KEY, 'true');
            alert('✅ Admin Login Successful! Redirecting to Dashboard.');
            window.location.href = 'dashboard.html'; // Redirect to the Admin Dashboard
        } else {
            alert('❌ Invalid Admin Credentials.');
        }
    });

    // Optional: Auto-redirect if already logged in
    if (localStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
        window.location.href = 'dashboard.html';
    }
});