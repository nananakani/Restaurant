// 🛒 cart.js — კალათის სრული ლოგიკა API-ზე დაყრდნობით

let cartItems = [];

// 🔐 ამოიღე ტოკენი ლოკალური შესანახიდან თუ გაქვს
function getToken() {
    return localStorage.getItem("token");
}

// 📦 კალათის გამოტანა API-დან
async function loadCart() {
    try {
        const res = await fetch("https://restaurant.stepprojects.ge/api/Baskets/GetAll", {
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        });

        if (!res.ok) throw new Error("Failed loading cart");

        cartItems = await res.json();
    } catch (e) {
        console.error("API load failed:", e);
        cartItems = [];
    }
    displayCart();
    updateTotal();
    updateCartCounter();
}

// 🖼️ კალათის პროდუქციის გამოჩენა
function displayCart() {
    const c = document.getElementById("cart-items");
    if (!cartItems || cartItems.length === 0) {
        c.innerHTML = '<div class="empty-cart"><p>Your cart is empty</p></div>';
        return;
    }

    c.innerHTML = cartItems.map(it => `
        <div class="cart-item" data-id="${it.productId}">
            <img src="${it.image}" alt="${it.name}" class="cart-item-img">
            <div class="cart-item-details">
                <div class="item-info">
                    <h3>${it.name}</h3>
                    <p class="item-price">$${it.price}</p>
                </div>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${it.productId}, -1)">-</button>
                    <span>${it.quantity}</span>
                    <button onclick="updateQuantity(${it.productId}, 1)">+</button>
                </div>
                <p class="item-total">Total: $${(it.price * it.quantity).toFixed(2)}</p>
                <button class="remove-btn" onclick="removeFromCart(${it.productId})">Remove</button>
            </div>
        </div>
    `).join('');
}

// ➕ რაოდენობის განახლება
async function updateQuantity(productId, change) {
    const item = cartItems.find(i => i.productId === productId);
    if (!item) return;
    const newQty = item.quantity + change;
    if (newQty < 1) return removeFromCart(productId);

    try {
        const res = await fetch("https://restaurant.stepprojects.ge/api/Baskets/UpdateBasket", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify({ productId, quantity: newQty })
        });

        if (!res.ok) throw new Error("Update failed");

        await loadCart();
    } catch (e) {
        console.error(e);
    }
}

// ❌ წაშლა კალათიდან
async function removeFromCart(productId) {
    try {
        const res = await fetch(`https://restaurant.stepprojects.ge/api/Baskets/DeleteProduct/${productId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        });

        if (!res.ok) throw new Error("Delete failed");

        await loadCart();
    } catch (e) {
        console.error(e);
    }
}

// 🧹 მთლიანი კალათის გასუფთავება
async function clearCart() {
    const products = cartItems.map(i => i.productId);
    for (const id of products) {
        await removeFromCart(id);
    }
}

// ✅ დასრულება
function checkout() {
    if (cartItems.length === 0) return alert("The Cart is empty!");
    alert("Thank you for your order!");
    clearCart();
}


function updateCartCounter() {
    const cnt = cartItems.reduce((s, i) => s + i.quantity, 0);
    const el = document.getElementById("cart-counter");
    if (el) {
        el.textContent = cnt;
        el.style.display = cnt ? "block" : "none";
    }
}


window.addEventListener("DOMContentLoaded", () => {
    loadCart();
    document.getElementById("clear-cart")?.addEventListener("click", clearCart);
    document.getElementById("checkout-btn")?.addEventListener("click", checkout);
});
