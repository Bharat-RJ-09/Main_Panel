// panel/js/index.js - Final Merged Code for NextEarnX Dashboard

document.addEventListener('DOMContentLoaded', () => {

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

    // --- 2. SIDEBAR TOGGLE LOGIC (REQUIRED FOR HAMBURGER MENU) ---
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
    
    // --- 3. SUBSCRIPTION UTILITIES ---

    function getSubscription() {
        try {
            const sub = JSON.parse(localStorage.getItem('subscription'));
            // Check expiry: If expired, remove and return null
            if (!sub || Date.now() > sub.expiry) { 
                localStorage.removeItem('subscription');
                return null;
            }
            return sub;
        } catch(e) { return null; }
    }

    function isSubscribed() { return !!getSubscription(); }

    // --- 4. DASHBOARD UI UPDATES (STATUS & LOCKS) ---

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
    updateSubscriptionStatus(); // Run once on load

    function refreshFeatureLocks() {
        const subscribed = isSubscribed();
        // Target the feature-card divs inside the feature-link a tags
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
    refreshFeatureLocks();

    // --- 5. FEATURE CARD REDIRECTION LISTENER (THE FIX FOR REDIRECT) ---

    document.querySelectorAll('.feature-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const feature = link.dataset.feature; 
            const target = link.getAttribute('href'); 

            // 1. Check if the link is a placeholder (href="#")
            if (target === '#') {
                 e.preventDefault(); 
                 alert(`⚠️ ${feature} is currently under construction!`);
                 return;
            }

            // 2. Subscription Check
            if(!isSubscribed()) {
                e.preventDefault(); // Stop default <a> tag redirection
                
                // Redirect to subscription page
                window.location.href = `subscription.html?redirect=${encodeURIComponent(feature)}`;
            }
            // If subscribed, the <a> tag handles redirection automatically.
        });
    });

    // --- 6. HANDLE AUTO-OPEN AFTER PURCHASE (index.html?open=feature) ---
    (function autoOpenFeature(){
        const params = new URLSearchParams(location.search);
        if(params.has('open') && isSubscribed()){
            const feature = params.get('open');
            const link = document.querySelector(`.feature-link[data-feature="${feature}"]`);
            if(link) window.location.href = link.href;
        }
    })();
});