// panel/js/index.js - Final Merged Code for NextEarnX Dashboard (New UI)

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. NEW UI ELEMENTS ---
    const usernameDisplay = document.getElementById('usernameDisplay');
    const balanceDisplay = document.getElementById('balanceDisplay'); 
    const subscriptionStatus = document.getElementById('subscriptionStatus');
    const addFundsBtn = document.getElementById('addFundsBtn');
    
    // --- UTILITIES ---
    function getBalance() {
        try {
            return parseFloat(localStorage.getItem('nextEarnXBalance') || '0.00');
        } catch(e) { return 0.00; }
    }
    
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
    
    function getCurrentUsername() {
        try {
            const user = JSON.parse(localStorage.getItem('nextEarnXCurrentUser'));
            return user ? user.username : 'Guest'; 
        } catch(e) { 
            return 'Guest'; 
        }
    }


    // --- 1. CORE LOGOUT LOGIC & SIDEBAR ---
    const logoutBtn = document.getElementById('logoutBtn');
    const sidebarLogoutBtn = document.getElementById('sidebarLogout');

    function handleLogout() {
        localStorage.removeItem('session'); 
        localStorage.removeItem('nextEarnXCurrentUser'); 
        alert("Logged out from NextEarnX!");
        window.location.href = 'login.html';
    }

    if(logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if(sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', (e) => {
        e.preventDefault(); 
        handleLogout();
    });

    // Sidebar Toggle Logic
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');

    function toggleSidebar() {
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    }

    if(menuBtn) menuBtn.addEventListener('click', toggleSidebar);
    if(closeSidebarBtn) closeSidebarBtn.addEventListener('click', toggleSidebar);

    
    // --- 2. DASHBOARD UI UPDATES (STATUS, BALANCE & LOCKS) ---

    function updateUsernameUI() {
        if (usernameDisplay) {
            const currentUsername = getCurrentUsername();
            usernameDisplay.textContent = currentUsername.charAt(0).toUpperCase() + currentUsername.slice(1);
        }
    }
    
    function updateBalanceUI() {
        if (balanceDisplay) {
            balanceDisplay.textContent = `₹${getBalance().toFixed(2)}`;
        }
    }

    function updateSubscriptionStatus() {
        const subscriptionData = getSubscription(); 

        if (subscriptionStatus) {
            if (subscriptionData) {
                const expiryDate = new Date(subscriptionData.expiry);
                const options = { year: 'numeric', month: 'short', day: 'numeric' };
                const formattedDate = expiryDate.toLocaleDateString('en-IN', options);

                subscriptionStatus.innerHTML = `Plan: <b>${subscriptionData.plan}</b> | Expires: <b>${formattedDate}</b>`;
                subscriptionStatus.style.color = '#aaffaa'; 
            } else {
                subscriptionStatus.innerHTML = `Status: <b style="color:#ff0077;">Not Subscribed</b>`;
                subscriptionStatus.style.color = '#ff0077'; 
            }
        }
    }
    
    function refreshFeatureLocks() {
        const subscribed = isSubscribed();
        
        document.querySelectorAll('.feature-link').forEach(link => {
            // Target both feature-card-item and quick-feature-card
            const cardItem = link.querySelector('.feature-card-item') || link.querySelector('.quick-feature-card');
            const badge = cardItem ? cardItem.querySelector('.lock-badge') : null;
            
            // Check if feature needs locking (external links don't have data-lock/are skipped)
            const feature = link.dataset.feature;
            if (['Telegram Channel', 'Contact Us'].includes(feature)) return; 
            
            if(badge) {
                if(subscribed) { 
                    badge.textContent = ''; 
                    cardItem.classList.remove('locked'); 
                    link.classList.remove('locked');
                } else { 
                    badge.textContent = '🔒'; 
                    cardItem.classList.add('locked'); 
                    link.classList.add('locked');
                }
            }
        });
    }

    // --- 3. EVENT LISTENERS ---
    
    if (addFundsBtn) {
        addFundsBtn.addEventListener('click', () => {
            window.location.href = 'wallet.html';
        });
    }

    document.querySelectorAll('.feature-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const feature = link.dataset.feature; 
            const target = link.getAttribute('href'); 

            if (target === '#') {
                 e.preventDefault(); 
                 alert(`⚠️ ${feature} is currently under construction!`);
                 return;
            }
            
            // Allow external links to pass without subscription check
            if (link.classList.contains('external-link')) return;

            if(!isSubscribed()) {
                e.preventDefault();
                window.location.href = `subscription.html?redirect=${encodeURIComponent(feature)}`;
            }
        });
    });

    // --- 4. INITIAL CALLS ---
    updateUsernameUI();
    updateBalanceUI(); 
    updateSubscriptionStatus();
    refreshFeatureLocks(); 

    // 5. HANDLE AUTO-OPEN AFTER PURCHASE
    (function autoOpenFeature(){
        const params = new URLSearchParams(location.search);
        if(params.has('open') && isSubscribed()){
            const feature = params.get('open');
            const link = document.querySelector(`.feature-link[data-feature="${feature}"]`);
            if(link) window.location.href = link.href;
        }
    })();
});