let cartItems = [];

function loadCart() {
    const savedCart = localStorage.getItem('cart');
    cartItems = savedCart ? JSON.parse(savedCart) : [];
    displayCart();
    updateTotal();
}

function displayCart() {
    const cartContainer = document.getElementById('cart-items');
    
    if (cartItems.length === 0) {
        cartContainer.innerHTML = '<div class="empty-cart"><p>Your cart is empty</p></div>';
        return;
    }

    const cartHTML = cartItems.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p class="item-price">$${item.price}</p>
                </div>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <p class="item-total">Total: $${(item.price * item.quantity).toFixed(2)}</p>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `).join('');

    cartContainer.innerHTML = cartHTML;
}

function updateQuantity(productId, change) {
    const itemIndex = cartItems.findIndex(item => item.id === productId);
    if (itemIndex !== -1) {
        cartItems[itemIndex].quantity += change;
        
        if (cartItems[itemIndex].quantity < 1) {
            removeFromCart(productId);
            return;
        }
        
        localStorage.setItem('cart', JSON.stringify(cartItems));
        displayCart();
        updateTotal();
    }
}

function removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    displayCart();
    updateTotal();
}

function updateTotal() {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalElement = document.getElementById('cart-total');
    if (totalElement) {
        totalElement.textContent = total.toFixed(2);
    }
}

function clearCart() {
    cartItems = [];
    localStorage.removeItem('cart');
    displayCart();
    updateTotal();
}

function checkout() {
    if (cartItems.length === 0) {
        alert('The Cart is empty!');
        return;
    }
    
    alert('Thank you for Order!');
    clearCart();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    
    document.getElementById('clear-cart')?.addEventListener('click', clearCart);
    document.getElementById('checkout-btn')?.addEventListener('click', checkout);
});

function updateCartCounter() {
    const counter = document.getElementById('cart-counter');
    if (counter) {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        counter.textContent = totalItems;
        counter.style.display = totalItems > 0 ? 'block' : 'none';
    }
}