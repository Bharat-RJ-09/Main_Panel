// panel/js/customise_profile.js - Profile Customization Logic (Logo Change)

document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements
    const logoImg = document.getElementById('logoImg');
    const customLogoInput = document.getElementById('customLogoInput');
    const resetLogoBtn = document.getElementById('resetLogoBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Keys
    const CUSTOM_LOGO_KEY = 'nextEarnXCustomLogo';
    const DEFAULT_LOGO_PATH = 'logo.png'; // Assuming default logo is at panel/logo.png

    // --- UTILITIES ---
    function loadCustomLogo() {
        const savedLogo = localStorage.getItem(CUSTOM_LOGO_KEY);
        if (savedLogo && logoImg) {
            logoImg.src = savedLogo;
        } else if (logoImg) {
            // Ensure default is loaded if no custom logo is found
            logoImg.src = DEFAULT_LOGO_PATH;
        }
    }
    
    function handleLogout() {
        localStorage.removeItem('session'); 
        localStorage.removeItem('nextEarnXCurrentUser'); 
        alert("Logged out from NextEarnX!");
        window.location.href = 'login.html';
    }

    if(logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // --- LOGO CHANGE LOGIC ---
    
    if (logoImg && customLogoInput) {
        // 1. Trigger file input when image is clicked
        logoImg.addEventListener('click', () => {
            customLogoInput.click();
        });

        // 2. Handle file selection and save to localStorage
        customLogoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    localStorage.setItem(CUSTOM_LOGO_KEY, e.target.result);
                    logoImg.src = e.target.result;
                    alert("✅ Logo updated successfully! Reload dashboard to see the change.");
                };
                reader.readAsDataURL(file);
            }
        });
        
        // 3. Reset to Default
        resetLogoBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to reset the logo to default?")) {
                localStorage.removeItem(CUSTOM_LOGO_KEY);
                logoImg.src = DEFAULT_LOGO_PATH; // Load default path
                alert("✅ Logo reset to default. Reload dashboard to see the change.");
            }
        });
        
        loadCustomLogo(); // Load custom logo on page initialization
    }
});