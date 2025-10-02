// subscription.js
document.addEventListener('DOMContentLoaded', ()=>{
    const urlParams = new URLSearchParams(location.search);
    const redirectFeature = urlParams.get('redirect') || null;

    let selectedPlan = null;
    const planCards = document.querySelectorAll('.plan-card');

    planCards.forEach(card=>{
        card.addEventListener('click', ()=>{
            planCards.forEach(c=>c.classList.remove('selected'));
            card.classList.add('selected');
            selectedPlan = {name: card.dataset.plan, price: card.dataset.price};
        });
    });

    document.getElementById('confirmBtn').addEventListener('click', ()=>{
        if(!selectedPlan){ alert("Select a plan first"); return; }
        let url = `purchase.html?plan=${encodeURIComponent(selectedPlan.name)}&price=${encodeURIComponent(selectedPlan.price)}`;
        if(redirectFeature) url += `&redirect=${encodeURIComponent(redirectFeature)}`;
        window.location.href = url;
    });
});
