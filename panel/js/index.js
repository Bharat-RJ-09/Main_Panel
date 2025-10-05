// panel/js/index.js - Final Merged Code for NextEarnX Dashboard

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. NEW: WALLET UTILITY (Required to show balance) ---
    function getBalance() {
        try {
            return parseFloat(localStorage.getItem('nextEarnXBalance') || '0.00');
        } catch(e) { return 0.00; }
    }


    // --- 1. CORE LOGOUT LOGIC ---
    const logoutBtn = document.getElementById('logoutBtn');

    if(logoutBtn){
        logoutBtn.addEventListener('click', ()=>{
            localStorage.removeItem('session'); 
            localStorage.removeItem('nextEarnXCurrentUser'); 
            alert("Logged out from NextEarnX!");
            window.location.href = 'login.html';
        });
    }

    // --- 2. SIDEBAR TOGGLE LOGIC ---
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarLogoutBtn = document.getElementById('sidebarLogout');

    function toggleSidebar() {
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    }

    if(menuBtn) menuBtn.addEventListener('click', toggleSidebar);
    if(closeSidebarBtn) closeSidebarBtn.addEventListener('click', toggleSidebar);

    if(sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            if(logoutBtn) logoutBtn.click(); 
        });
    }
    
    // --- 3. LOGO CUSTOMIZATION LOGIC ---
    const logoImg = document.getElementById('logoImg');
    const customLogoInput = document.getElementById('customLogoInput');

    function loadCustomLogo() {
        const savedLogo = localStorage.getItem('nextEarnXCustomLogo');
        if (savedLogo && logoImg) {
            logoImg.src = savedLogo;
        }
    }

    if (logoImg && customLogoInput) {
        // Trigger file input when image is clicked
        logoImg.addEventListener('click', () => {
            customLogoInput.click();
        });

        // Handle file selection and save to localStorage
        customLogoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    localStorage.setItem('nextEarnXCustomLogo', e.target.result);
                    logoImg.src = e.target.result;
                    alert("Logo updated successfully!");
                };
                reader.readAsDataURL(file);
            }
        });
        loadCustomLogo(); // Load on page initialization
    }
    
    // --- 4. SUBSCRIPTION UTILITIES ---

    function getSubscription() {
        try {
            const sub = JSON.parse(localStorage.getItem('subscription'));
            if (!sub || Date.now() > sub.expiry) { 
                localStorage.removeItem('subscription');
                return null;
            }
            return sub;
        } catch(e) { return null; }
    }

    function isSubscribed() { return !!getSubscription(); }

    // --- 5. USERNAME UTILITY ---
    function getCurrentUsername() {
        try {
            const user = JSON.parse(localStorage.getItem('nextEarnXCurrentUser'));
            return user ? user.username : 'Guest'; 
        } catch(e) { 
            return 'Guest'; 
        }
    }

    // --- 6. DASHBOARD UI UPDATES (STATUS, BALANCE & LOCKS) ---

    function updateUsernameUI() {
        const usernameElement = document.getElementById('username');
        if (usernameElement) {
            const currentUsername = getCurrentUsername();
            usernameElement.textContent = currentUsername.charAt(0).toUpperCase() + currentUsername.slice(1);
        }
    }
    
    function updateBalanceUI() {
        const balanceDisplay = document.getElementById('balanceDisplay');
        if (balanceDisplay) {
            balanceDisplay.textContent = `₹${getBalance().toFixed(2)}`;
        }
    }

    function updateSubscriptionStatus() {
        const subStatusElement = document.getElementById('subscriptionStatus');
        const subscriptionData = getSubscription(); 

        if (subStatusElement) {
            if (subscriptionData) {
                const expiryDate = new Date(subscriptionData.expiry);
                const options = { year: 'numeric', month: 'short', day: 'numeric' };
                const formattedDate = expiryDate.toLocaleDateString('en-IN', options);

                subStatusElement.innerHTML = `Plan: <b>${subscriptionData.plan}</b> | Expires: <b>${formattedDate}</b>`;
                subStatusElement.style.color = '#aaffaa'; 
            } else {
                subStatusElement.innerHTML = `Status: <b style="color:#ff0077;">Not Subscribed</b>`;
                subStatusElement.style.color = '#ff0077'; 
            }
        }
    }
    
    // --- INITIAL CALLS ---
    updateUsernameUI();
    updateBalanceUI(); // Show current balance
    updateSubscriptionStatus();
    refreshFeatureLocks(); 

    function refreshFeatureLocks() {
        const subscribed = isSubscribed();
        document.querySelectorAll('.feature-link').forEach(link => {
            const card = link.querySelector('.feature-card');
            const badge = card ? card.querySelector('.lock-badge') : null;
            if(badge) {
                if(subscribed) { 
                    badge.textContent = ''; 
                    card.classList.remove('locked'); 
                    link.classList.remove('locked');
                } else { 
                    badge.textContent = '🔒'; 
                    card.classList.add('locked'); 
                    link.classList.add('locked');
                }
            }
        });
    }

    // --- 7. NEW: ADD FUNDS BUTTON LOGIC ---
    const addFundsBtn = document.getElementById('addFundsBtn');
    if (addFundsBtn) {
        addFundsBtn.addEventListener('click', () => {
            window.location.href = 'wallet.html';
        });
    }

    // --- 8. FEATURE CARD REDIRECTION LISTENER ---

    document.querySelectorAll('.feature-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const feature = link.dataset.feature; 
            const target = link.getAttribute('href'); 

            if (target === '#') {
                 e.preventDefault(); 
                 alert(`⚠️ ${feature} is currently under construction!`);
                 return;
            }

            if(!isSubscribed()) {
                e.preventDefault();
                window.location.href = `subscription.html?redirect=${encodeURIComponent(feature)}`;
            }
        });
    });

    // --- 9. HANDLE AUTO-OPEN AFTER PURCHASE ---
    (function autoOpenFeature(){
        const params = new URLSearchParams(location.search);
        if(params.has('open') && isSubscribed()){
            const feature = params.get('open');
            const link = document.querySelector(`.feature-link[data-feature="${feature}"]`);
            if(link) window.location.href = link.href;
        }
    })();
});