// js/signup.js
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const usernameInput = document.getElementById("username");
  const usernameMsg = document.getElementById("usernameMsg");

  const usernameRegex = /^[a-zA-Z0-9_]{1,15}$/;

  const loadUsers = () => {
    try { return JSON.parse(localStorage.getItem("instantPanelUsers") || "[]"); }
    catch { return []; }
  };
  const saveUsers = (users) => localStorage.setItem("instantPanelUsers", JSON.stringify(users));

  usernameInput.addEventListener("input", () => {
    const value = usernameInput.value.trim();
    if (!usernameRegex.test(value)) {
      usernameMsg.textContent = "❌ Username 1-15 chars, only letters, numbers, _ allowed";
      usernameMsg.style.color = "red";
      return;
    }
    const users = loadUsers();
    if (users.some(u => u.username.toLowerCase() === value.toLowerCase())) {
      usernameMsg.textContent = "❌ Username already taken";
      usernameMsg.style.color = "red";
    } else {
      usernameMsg.textContent = "✅ Username available";
      usernameMsg.style.color = "limegreen";
    }
  });

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fullname = document.getElementById("fullname").value.trim();
    const username = usernameInput.value.trim();
    const email = document.getElementById("email").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const password = document.getElementById("password").value;

    if (!fullname || !username || !email || !mobile || !password) {
      alert("Please fill all fields!");
      return;
    }
    if (!usernameRegex.test(username)) { alert("Invalid username. Follow rules."); return; }
    if (!/^[^\s@]+@gmail\.com$/.test(email)) { alert("Please use a valid Gmail address."); return; }
    if (!/^\d{10}$/.test(mobile)) { alert("Mobile must be 10 digits."); return; }
    if (password.length < 6) { alert("Password must be at least 6 characters."); return; }

    const users = loadUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) { alert("Username already taken."); return; }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) { alert("Email already registered."); return; }

    // Save user (frontend only). In production DO NOT store plain passwords.
    users.push({ fullname, username, email, mobile, password });
    saveUsers(users);

    alert("Account created successfully! Please login.");
    window.location.href = "login.html"; // go to login
  });
});
