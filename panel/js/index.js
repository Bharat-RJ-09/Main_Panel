 

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

    function isSubscribed() { return !!getSubscription(); }

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

    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn){
        logoutBtn.addEventListener('click', ()=>{
            localStorage.removeItem('session');
            alert("Logged out");
            window.location.href = 'login.html';
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
 