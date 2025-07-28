
// API ენდპოინტი (თქვენი რეალური API მისამართი)
const API_URL = "https://rentcar.stepprojects.ge/api/Users";

// მიმდინარე მომხმარებლის მონაცემები
let currentUser = null;

// ===== მთავარი ფუნქციები =====

// აპლიკაციის ინიციალიზაცია
document.addEventListener("DOMContentLoaded", function () {
  console.log("აპლიკაცია ჩაიტვირთა");

  // ჯერ ვამოწმებთ localStorage-დან მომხმარებლის მონაცემებს
  loadUserFromStorage();

  // განვაახლებთ ნავიგაციას
  updateNavigation();

  // ვაჩვენებთ სათანადო გვერდს
  checkAuthAndShowPage();

  // ვუკავშირდებით ფორმებს
  attachEventListeners();
});

// მომხმარებლის მონაცემების ჩატვირთვა localStorage-დან
function loadUserFromStorage() {
  try {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      // ვამოწმებთ ტოკენის ვალიდურობას
      if (!isTokenExpired(token)) {
        currentUser = JSON.parse(userData);
        console.log("მომხმარებელი ჩაიტვირთა:", currentUser);
      } else {
        console.log("ტოკენის ვადა ამოწურულია");
        logout();
      }
    }
  } catch (error) {
    console.error("შეცდომა მომხმარებლის ჩატვირთვისას:", error);
    logout();
  }
}

// ავტორიზაციის შემოწმება და სათანადო გვერდის ჩვენება
function checkAuthAndShowPage() {
  if (currentUser) {
    showPage("home");
  } else {
    showPage("home"); // მთავარი გვერდი ყველასთვის ხელმისაწვდომია
  }
}

// ===== ნავიგაცია =====

// ნავიგაციის განახლება მომხმარებლის სტატუსის მიხედვით
function updateNavigation() {
  const navLinks = document.getElementById("nav-links");

  if (currentUser) {
    // ავტორიზებული მომხმარებლისთვის
    navLinks.innerHTML = `
            <li><a href="index.html" onclick="showPage('home')">მთავარი</a></li>
            <li><a href="#" onclick="showPage('profile')" class="username">${getUserDisplayName()}</a></li>
            <li><a href="#" onclick="logout()">გასვლა</a></li>
        `;
  } else {
    // არაავტორიზებული მომხმარებლისთვის
    navLinks.innerHTML = `
            <li><a href="index.html" onclick="showPage('home')">მთავარი</a></li>
            <li><a href="#" onclick="showPage('login')">შესვლა</a></li>
            <li><a href="#" onclick="showPage('register')">რეგისტრაცია</a></li>
        `;
  }
}

// მომხმარებლის გამოსაჩენი სახელის მიღება
function getUserDisplayName() {
  if (!currentUser) return "მომხმარებელი";

  if (currentUser.firstName && currentUser.lastName) {
    return `${currentUser.firstName} ${currentUser.lastName}`;
  } else if (currentUser.firstName) {
    return currentUser.firstName;
  } else if (currentUser.phoneNumber) {
    return currentUser.phoneNumber;
  }

  return "მომხმარებელი";
}

// გვერდის ჩვენება
function showPage(pageId) {
  console.log("გვერდის ჩვენება:", pageId);

  // ყველა გვერდის დამალვა
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => page.classList.add("hidden"));

  // კონკრეტული გვერდის ჩვენება
  const targetPage = document.getElementById(pageId + "-page");
  if (targetPage) {
    targetPage.classList.remove("hidden");

    // თუ ეს პროფილის გვერდია, განვაახლოთ მისი კონტენტი
    if (pageId === "profile") {
      updateProfilePage();
    }

    // შეტყობინებების გასუფთავება ახალ გვერდზე გადასვლისას
    clearMessages();
  }
}

// ===== Event Listeners =====

// ფორმებთან დაკავშირება
function attachEventListeners() {
  // ავტორიზაციის ფორმა
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // რეგისტრაციის ფორმა
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }
}

// ===== ავტორიზაცია =====

// ავტორიზაციის დამუშავება
async function handleLogin(event) {
  event.preventDefault();

  // ფორმის მონაცემების მიღება
  const phoneNumber = document.getElementById("login-phone").value.trim();
  const password = document.getElementById("login-password").value;

  // მარტივი ვალიდაცია
  if (!validateLoginForm(phoneNumber, password)) {
    return;
  }

  // ღილაკის დისაბლება
  const loginBtn = document.getElementById("login-btn");
  loginBtn.disabled = true;
  loginBtn.textContent = "იტვირთება...";

  try {
    console.log("ავტორიზაციის მცდელობა:", { phoneNumber }); // API გამოძახება
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        password: password,
      }),
    });

    // response-ის ყოველთვის JSON-ად პარსირება
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // თუ JSON-ი ვერ პარსირდება, გამოვიყენებთ fallback message
      data = {
        message: `HTTP შეცდომა: ${response.status} ${response.statusText}`,
      };
    }

    if (response.ok && data.token) {
      // წარმატებული ავტორიზაცია
      console.log("ავტორიზაცია წარმატებული:", data);

      // მონაცემების შენახვა
      localStorage.setItem("token", data.token);

      // მომხმარებლის ობიექტის შექმნა
      currentUser = {
        phoneNumber: phoneNumber,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        role: data.role || "user",
      };

      localStorage.setItem("userData", JSON.stringify(currentUser));

      // წარმატების შეტყობინება
      showMessage("login-success", "ავტორიზაცია წარმატებით დასრულდა!");

      // ნავიგაციის განახლება
      updateNavigation();

      // გადასვლა მთავარ გვერდზე
      setTimeout(() => {
        showPage("home");
      }, 1500);
    } else {
      // ავტორიზაციის შეცდომა - ბექის response-ის გამოტანა
      let errorMessage = data.message || data.error || ""; // კონკრეტული error message-ების მუშავება
      if (
        errorMessage.toLowerCase().includes("user not found") ||
        errorMessage.toLowerCase().includes("not found") ||
        response.status === 404 ||
        response.status === 400 ||
        response.status === 401
      ) {
        errorMessage = "არასწორი ტელეფონი ან პაროლი";
      } else if (
        errorMessage.toLowerCase().includes("invalid") ||
        errorMessage.toLowerCase().includes("unauthorized")
      ) {
        errorMessage = "არასწორი ტელეფონი ან პაროლი";
      } else if (!errorMessage) {
        errorMessage = `შეცდომა: ${response.status} ${response.statusText}`;
      }

      showMessage("login-error", errorMessage);
    }
  } catch (error) {
    console.error("ავტორიზაციის შეცდომა:", error);
    // ვცდილობთ error response-ის გამოტანას თუ შესაძლებელია
    let errorMessage = "ტექნიკური შეცდომა";

    if (error.message) {
      errorMessage = error.message;
    } else if (
      error.response &&
      error.response.data &&
      error.response.data.message
    ) {
      errorMessage = error.response.data.message;
    } else if (error.toString) {
      errorMessage = error.toString();
    }

    showMessage("login-error", errorMessage);
  } finally {
    // ღილაკის აღდგენა
    loginBtn.disabled = false;
    loginBtn.textContent = "შესვლა";
  }
}

// ავტორიზაციის ფორმის ვალიდაცია
function validateLoginForm(phoneNumber, password) {
  clearFormErrors("login");

  let isValid = true;

  if (!phoneNumber) {
    showFieldError("login-phone-error", "ტელეფონის ნომერი აუცილებელია");
    isValid = false;
  }

  if (!password) {
    showFieldError("login-password-error", "პაროლი აუცილებელია");
    isValid = false;
  }

  return isValid;
}

// ===== რეგისტრაცია =====

// რეგისტრაციის დამუშავება
async function handleRegister(event) {
  event.preventDefault();

  // ფორმის მონაცემების მიღება
  const firstName = document.getElementById("register-firstName").value.trim();
  const lastName = document.getElementById("register-lastName").value.trim();
  const phoneNumber = document.getElementById("register-phone").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;

  // ვალიდაცია
  if (
    !validateRegisterForm(firstName, lastName, phoneNumber, email, password)
  ) {
    return;
  }

  // ღილაკის დისაბლება
  const registerBtn = document.getElementById("register-btn");
  registerBtn.disabled = true;
  registerBtn.textContent = "იტვირთება...";

  try {
    console.log("რეგისტრაციის მცდელობა:", {
      firstName,
      lastName,
      phoneNumber,
      email,
    }); // API გამოძახება
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        email: email,
        password: password,
        role: "user", // საბაზისო როლი
      }),
    });

    // response-ის ყოველთვის JSON-ად პარსირება
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // თუ JSON-ი ვერ პარსირდება, გამოვიყენებთ fallback message
      data = {
        message: `HTTP შეცდომა: ${response.status} ${response.statusText}`,
      };
    }

    if (response.ok) {
      // წარმატებული რეგისტრაცია
      console.log("რეგისტრაცია წარმატებული:", data);

      showMessage(
        "register-success",
        "რეგისტრაცია წარმატებით დასრულდა! გთხოვთ, გაიაროთ ავტორიზაცია."
      );

      // ფორმის გასუფთავება
      document.getElementById("register-form").reset();

      // გადასვლა ავტორიზაციის გვერდზე
      setTimeout(() => {
        showPage("login");
      }, 2000);
    } else {
      // რეგისტრაციის შეცდომა - ბექის response-ის გამოტანა
      let errorMessage = data.message || data.error || ""; // კონკრეტული error message-ების მუშავება
      if (
        errorMessage.toLowerCase().includes("already exists") ||
        errorMessage.toLowerCase().includes("already registered") ||
        errorMessage.toLowerCase().includes("duplicate") ||
        response.status === 409 ||
        response.status === 400
      ) {
        errorMessage = "ეს ტელეფონი ან ელფოსტა უკვე რეგისტრირებულია";
      } else if (
        errorMessage.toLowerCase().includes("invalid email") ||
        errorMessage.toLowerCase().includes("email format")
      ) {
        errorMessage = "არასწორი ელფოსტის ფორმატი";
      } else if (
        errorMessage.toLowerCase().includes("weak password") ||
        errorMessage.toLowerCase().includes("password too short")
      ) {
        errorMessage = "პაროლი ძალიან მოკლეა";
      } else if (
        errorMessage.toLowerCase().includes("required") ||
        errorMessage.toLowerCase().includes("missing")
      ) {
        errorMessage = "ყველა ველი უნდა იყოს შევსებული";
      } else if (!errorMessage) {
        errorMessage = `შეცდომა: ${response.status} ${response.statusText}`;
      }

      showMessage("register-error", errorMessage);
    }
  } catch (error) {
    console.error("რეგისტრაციის შეცდომა:", error);
    // ვცდილობთ error response-ის გამოტანას თუ შესაძლებელია
    let errorMessage = "ტექნიკური შეცდომა";

    if (error.message) {
      errorMessage = error.message;
    } else if (
      error.response &&
      error.response.data &&
      error.response.data.message
    ) {
      errorMessage = error.response.data.message;
    } else if (error.toString) {
      errorMessage = error.toString();
    }

    showMessage("register-error", errorMessage);
  } finally {
    // ღილაკის აღდგენა
    registerBtn.disabled = false;
    registerBtn.textContent = "რეგისტრაცია";
  }
}

// რეგისტრაციის ფორმის ვალიდაცია
function validateRegisterForm(
  firstName,
  lastName,
  phoneNumber,
  email,
  password
) {
  clearFormErrors("register");

  let isValid = true;

  if (!firstName) {
    showFieldError("register-firstName-error", "სახელი აუცილებელია");
    isValid = false;
  }

  if (!lastName) {
    showFieldError("register-lastName-error", "გვარი აუცილებელია");
    isValid = false;
  }

  if (!phoneNumber) {
    showFieldError("register-phone-error", "ტელეფონის ნომერი აუცილებელია");
    isValid = false;
  }

  if (!email) {
    showFieldError("register-email-error", "ელფოსტა აუცილებელია");
    isValid = false;
  } else if (!isValidEmail(email)) {
    showFieldError("register-email-error", "ელფოსტის ფორმატი არასწორია");
    isValid = false;
  }

  if (!password) {
    showFieldError("register-password-error", "პაროლი აუცილებელია");
    isValid = false;
  } else if (password.length < 6) {
    showFieldError(
      "register-password-error",
      "პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო"
    );
    isValid = false;
  }

  return isValid;
}

// ===== პროფილი =====

// პროფილის გვერდის განახლება
function updateProfilePage() {
  const profileInfo = document.getElementById("profile-info");

  if (!currentUser) {
    profileInfo.innerHTML =
      '<div class="error-message">მომხმარებლის მონაცემები ვერ მოიძებნა</div>';
    return;
  }

  let html = "";

  if (currentUser.firstName) {
    html += `<div class="info-item"><span class="label">სახელი:</span><span class="value">${currentUser.firstName}</span></div>`;
  }

  if (currentUser.lastName) {
    html += `<div class="info-item"><span class="label">გვარი:</span><span class="value">${currentUser.lastName}</span></div>`;
  }

  if (currentUser.phoneNumber) {
    html += `<div class="info-item"><span class="label">ტელეფონი:</span><span class="value">${currentUser.phoneNumber}</span></div>`;
  }

  if (currentUser.email) {
    html += `<div class="info-item"><span class="label">ელფოსტა:</span><span class="value">${currentUser.email}</span></div>`;
  }

  if (currentUser.role) {
    html += `<div class="info-item"><span class="label">როლი:</span><span class="value">${currentUser.role}</span></div>`;
  }

  profileInfo.innerHTML = html;
}

// ===== გასვლა =====

// სისტემიდან გასვლა
function logout() {
  console.log("გასვლა სისტემიდან");

  // localStorage-ის გასუფთავება
  localStorage.removeItem("token");
  localStorage.removeItem("userData");

  // მომხმარებლის მონაცემების გასუფთავება
  currentUser = null;

  // ნავიგაციის განახლება
  updateNavigation();

  // მთავარ გვერდზე გადასვლა
  showPage("home");
}

// ===== დამხმარე ფუნქციები =====

// შეტყობინების ჩვენება
function showMessage(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.classList.remove("hidden");

    // შეტყობინების ავტომატური დამალვა 5 წამში
    setTimeout(() => {
      element.classList.add("hidden");
    }, 5000);
  }
}

// ყველა შეტყობინების გასუფთავება
function clearMessages() {
  const messages = document.querySelectorAll(
    ".success-message, .error-message"
  );
  messages.forEach((msg) => msg.classList.add("hidden"));
}

// ველის შეცდომის ჩვენება
function showFieldError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;

    // ველის წითლად მონიშვნა
    const input = element.previousElementSibling;
    if (input && input.tagName === "INPUT") {
      input.classList.add("error");
    }
  }
}

// ფორმის შეცდომების გასუფთავება
function clearFormErrors(formPrefix) {
  const errors = document.querySelectorAll(
    `[id^="${formPrefix}-"][id$="-error"]`
  );
  errors.forEach((error) => {
    error.textContent = "";

    // ველის წითელი ფერის მოცილება
    const input = error.previousElementSibling;
    if (input && input.tagName === "INPUT") {
      input.classList.remove("error");
    }
  });
}

// ელფოსტის ვალიდაცია
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ტოკენის ვადის შემოწმება (მარტივი ვერსია)
function isTokenExpired(token) {
  try {
    // JWT ტოკენის მარტივი დეკოდირება
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    return payload.exp < currentTime;
  } catch (error) {
    console.error("ტოკენის დეკოდირების შეცდომა:", error);
    return true; // თუ ვერ დავადეკოდირეთ, ვფიქრობთ რომ ვადაღუმლია
  }
}