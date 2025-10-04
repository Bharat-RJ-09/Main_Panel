 
// panel/js/index.js ke subse upar add karein

// 1. Core Logout Functionality
const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn){
    logoutBtn.addEventListener('click', ()=>{
        localStorage.removeItem('session'); // Remove login session
        localStorage.removeItem('instantPanelCurrentUser'); // Remove current user data
        alert("Logged out from NextEarnX!");
        window.location.href = 'login.html';
    });
}


// 2. Sidebar Toggle Logic 
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

// Sidebar Logout button will programmatically click the main logout button
 
// --- END: SIDEBAR TOGGLE LOGIC ---

// --- START: SUBSCRIPTION STATUS UPDATE LOGIC (From previous step) ---
// Function to update the Dashboard UI with subscription status
function updateSubscriptionStatus() {
    // ... (Your getSubscription and isSubscribed functions are needed here)
    const subStatusElement = document.getElementById('subscriptionStatus');
    const subscriptionData = getSubscription(); 

    if (subStatusElement) {
        if (subscriptionData) {
            const expiryDate = new Date(subscriptionData.expiry);
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            const formattedDate = expiryDate.toLocaleDateString('en-IN', options);

            subStatusElement.innerHTML = `Plan: <b>${subscriptionData.plan}</b> | Expires: <b>${formattedDate}</b>`;
            subStatusElement.style.color = '#aaffaa'; // Green for active
        } else {
            subStatusElement.innerHTML = `Status: <b style="color:#ffaaaa;">Not Subscribed</b>`;
            subStatusElement.style.color = '#ffaaaa'; // Red for inactive
        }
    }
}
// --- END: SUBSCRIPTION STATUS UPDATE LOGIC ---


// Call the new function right after defining it
updateSubscriptionStatus(); 

// ... (Your existing code like refreshFeatureLocks, feature-card listeners, etc. will follow here)

    const usernameDisplay = document.getElementById('usernameDisplay');
    if(usernameDisplay) usernameDisplay.innerText = session.username;

    function getSubscription() {
        try {
            const sub = JSON.parse(localStorage.getItem('subscription'));
            if (!sub) return null;
            if (Date.now() > sub.expiry) {
                localStorage.removeItem('subscription');
                return null;
            }
            return sub;
        } catch(e) { return null; }
    }

    // panel/js/index.js mein add karein

// ... (existing getSubscription and isSubscribed functions)

// Function to update the Dashboard UI with subscription status
function updateSubscriptionStatus() {
    const subStatusElement = document.getElementById('subscriptionStatus');
    const subscriptionData = getSubscription(); // Reuses existing function

    if (subStatusElement) {
        if (subscriptionData) {
            // Convert timestamp to human-readable date
            const expiryDate = new Date(subscriptionData.expiry);
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            const formattedDate = expiryDate.toLocaleDateString('en-IN', options);

            subStatusElement.innerHTML = `Plan: <b>${subscriptionData.plan}</b> | Expires: <b>${formattedDate}</b>`;
            subStatusElement.style.color = '#aaffaa'; // Green for active
        } else {
            subStatusElement.innerHTML = `Status: <b style="color:#ffaaaa;">Not Subscribed</b>`;
            subStatusElement.style.color = '#ffaaaa'; // Red for inactive
        }
    }
}

// Call the new function right after defining it
updateSubscriptionStatus(); 

// ... (existing refreshFeatureLocks and other functions)

    function refreshFeatureLocks() {
        const subscribed = isSubscribed();
        document.querySelectorAll('.feature-card').forEach(card => {
            const badge = card.querySelector('.lock-badge');
            if(subscribed) { badge.textContent = ''; card.classList.remove('locked'); }
            else { badge.textContent = '🔒'; card.classList.add('locked'); }
        });
    }
    refreshFeatureLocks();

    document.querySelectorAll('.feature-card').forEach(card=>{
        card.addEventListener('click', ()=>{
            const feature = card.dataset.feature;
            const target = card.dataset.target;
            if(isSubscribed()) window.location.href = target;
            else window.location.href = `subscription.html?redirect=${encodeURIComponent(feature)}`;
        });
    });

    const subscriptionBtn = document.getElementById('subscriptionBtn');
    if(subscriptionBtn){
        subscriptionBtn.addEventListener('click', ()=>{
            window.location.href = 'subscription.html';
        });
    }





    (function autoOpenFeature(){
        const params = new URLSearchParams(location.search);
        if(params.has('open') && isSubscribed()){
            const feature = params.get('open');
            const card = document.querySelector(`.feature-card[data-feature="${feature}"]`);
            if(card) window.location.href = card.dataset.target;
        }
    })();
 


// panel/js/index.js ke subse upar add karein




 