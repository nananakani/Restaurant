
const API_URL = "https://rentcar.stepprojects.ge/api/Users";

let currentUser = null;
const navLinks = document.getElementById("nav-links");

document.addEventListener("DOMContentLoaded", () => {
  loadUserFromStorage();
  updateNavigation();
  if(currentUser) {
    showPage("home");
  } else {
    showPage("login");
  }
  attachEventListeners();
});

function attachEventListeners() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const logoutBtn = document.getElementById("logout-btn");

  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (registerForm) registerForm.addEventListener("submit", handleRegister);
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  const target = document.getElementById(pageId + "-page");
  if(target) target.classList.remove("hidden");
  if(pageId === "profile") updateProfile();
  clearMessages();
}

function updateNavigation() {
  if(currentUser) {
    navLinks.innerHTML = `
      <li><a href="index.html">Home</a></li>
      <li><a target="_blank" href="cart.html">cart</a></li>
      <li><a href="#" onclick="showPage('profile');return false;">User:  ${currentUser.firstName }</a></li>
      <li><a href="#" id="logout-link">Log Out</a></li>
    `;
    document.getElementById("logout-link").addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  } else {
    navLinks.innerHTML = `
    <li><a href="index.html">Home</a></li>
      <li><a target="_blank"  href="cart.html">cart</li>
      <li><a target="_blank"  href="login.html?page=register" ">Sign In</a></li>
      <li><a target="_blank"  href="autorization.html?page=register" ">Registration</a></li>
    `;
  }
}

function saveUserToStorage(token, userData) {
  localStorage.setItem("token", token);
  localStorage.setItem("userData", JSON.stringify(userData));
}

function loadUserFromStorage() {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("userData");
  if(token && userData) {
    currentUser = JSON.parse(userData);
  }
}



function clearMessages() {
  document.querySelectorAll(".error-message, .success-message").forEach(el => {
    el.textContent = "";
    el.classList.add("hidden");
  });
}

function showMessage(elementId, message, isError = true) {
  const el = document.getElementById(elementId);
  if(!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
  if(isError) {
    el.classList.remove("success-message");
    el.classList.add("error-message");
  } else {
    el.classList.remove("error-message");
    el.classList.add("success-message");
  }
}

async function handleLogin(e) {
  e.preventDefault();
  clearMessages();

  const phoneNumber = document.getElementById("login-phone").value.trim();
  const password = document.getElementById("login-password").value;

  if(!phoneNumber || !password) {
    showMessage("login-error", "ყველა ველის შევსება სავალდებულოა");
    return;
  }

  const loginBtn = document.getElementById("login-btn");
  loginBtn.disabled = true;
  loginBtn.textContent = "Loading...";

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ phoneNumber, password }),
    });

    const data = await response.json();

    if(response.ok && data.token) {
      currentUser = {
        phoneNumber,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        role: data.role || "user",
      };
      saveUserToStorage(data.token, currentUser);
      updateNavigation();
      showMessage("login-error", "authorization successful", false);
      setTimeout(() => {
        window.location.href = "index.html"; 
      }, 1000);
    } else {
      let msg = data.message || "არასწორი ტელეფონი ან პაროლი";
      showMessage("login-error", msg);
    }
  } catch(err) {
    showMessage("login-error", "არასწორი ნომერი ან პაროლი");
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "შესვლა";
  }
}

async function handleRegister(e) {
  e.preventDefault();
  clearMessages();

  const firstName = document.getElementById("register-firstName").value.trim();
  const lastName = document.getElementById("register-lastName").value.trim();
  const phoneNumber = document.getElementById("register-phone").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;

  if(!firstName || !lastName || !phoneNumber || !email ) {
   
    return  showMessage("register-error", "შენ გამოტოვე სავალდებულო ველები");;
  }


  if(firstName.length<2 || lastName.length<2){
   return showMessage("register-error","სახელი და გვარი უნდა შეიცავდეს მინიმუმ ორ სიმბოლოს");

  }
  const nameOnlyWith=/^[ა-ჰa-zA-Z]+$/;
  if(!nameOnlyWith.test(firstName)|| !nameOnlyWith.test(lastName)){
    return showMessage( "register-error", "სახელი და გვარი უნდა შეიცავდეს მხოლოდ ასოებს")
  }
  if(password.length<8){
    return showMessage("register-error","პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს")
  }
  const registerBtn = document.getElementById("register-btn");
  registerBtn.disabled = true;
  registerBtn.textContent = "იტვირთება...";

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
        role: "user"
      }),
    });

    const data = await response.json();

    if(response.ok) {
      showMessage("register-error", "რეგისტრაცია წარმატებით დასრულდა! ", false);
      document.getElementById("register-form").reset();
      setTimeout(() => showPage("login"), 2000);
    } else {
      let msg = data.message || "რეგისტრაციისას შეცდომა";
      showMessage("register-error", msg);
    }
  } catch(err) {
    showMessage("register-error", "");
  } finally {
    registerBtn.disabled = false;
    registerBtn.textContent = "რეგისტრაცია";
  }
}

function updateProfile() {
  const profileInfo = document.getElementById("profile-info");
  if(!currentUser) {
    profileInfo.innerHTML = "გთხოვთ გაიაროტ ავტორიზაცია !!!";
    return;
  }
  profileInfo.innerHTML = `
    <p><span>სახელი:</span> ${currentUser.firstName || ""}</p>
    <p><span>გვარი:</span> ${currentUser.lastName || ""}</p>
    <p><span>ტელეფონი:</span> ${currentUser.phoneNumber || ""}</p>
    <p><span>ელფოსტა:</span> ${currentUser.email || ""}</p>
  `;
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userData");
  currentUser = null;
  updateNavigation();
  showPage("login");
}

