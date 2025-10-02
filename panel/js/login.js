document.addEventListener('DOMContentLoaded', ()=>{
    const loginBtn = document.getElementById('loginBtn');

    loginBtn.addEventListener('click', () => {
        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value.trim();

        if(!user || !pass) {
            alert("⚠️ Enter username and password");
            return;
        }

        const now = Date.now();
        const session = {
            username: user,
            loginAt: now,
            expiry: now + 24*60*60*1000 // 24 hours
        };
        localStorage.setItem('session', JSON.stringify(session));

        window.location.href = "index.html";
    });
});
