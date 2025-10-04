// panel/js/index.js

// --- START: SIDEBAR AND CORE LOGOUT LOGIC ---

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



// --- END: SIDEBAR AND CORE LOGOUT LOGIC ---


// --- START: DASHBOARD LOGIC (Your existing code) ---

// NOTE: You need to make sure 'session' variable is defined globally or fetched here if needed.
// Example of session check (modify as per your current index.js structure):
// const session = JSON.parse(localStorage.getItem('session')); 
// if (!session) { window.location.href = 'login.html'; } 

const usernameDisplay = document.getElementById('username'); // Changed from 'usernameDisplay'
// ... (rest of your existing code for subscription and feature locks) ...

function getSubscription() {
    // ... (existing implementation)
}

function isSubscribed() {
    // ... (existing implementation)
}

function updateSubscriptionStatus() {
    // ... (existing implementation)
}

function refreshFeatureLocks() {
    // ... (existing implementation)
}

// ... (your feature-card listeners and autoOpenFeature function) ...

// --- END: DASHBOARD LOGIC ---