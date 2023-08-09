'use strict';

let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartDOM = document.querySelector('.cart');

if (cart.length > 0) {
  cart.forEach(cartItem => {
    insertItemToDOM(cartItem);
    countCartTotal();
    handleActionButtons(cartItem);
  });
}

function insertItemToDOM(cartItem) {
  cartDOM.insertAdjacentHTML(
    'beforeend',
    `
    <div class="cart__item">
      <img class="cart__item__image" src="${cartItem.image}" alt="${cartItem.name}">
      <h3 class="cart__item__name">${cartItem.name}</h3>
      <h3 class="cart__item__price">${cartItem.price}</h3>
      <button class="btn btn--primary btn--small${cartItem.quantity === 1 ? ' btn--danger' : ''}" data-action="DECREASE_ITEM">&minus;</button>
      <h3 class="cart__item__quantity">${cartItem.quantity}</h3>
      <button class="btn btn--primary btn--small" data-action="INCREASE_ITEM">&plus;</button>
      <button class="btn btn--danger btn--small" data-action="REMOVE_ITEM">&times;</button>
    </div>
  `
  );

  addCartFooter();
}

function handleActionButtons(cartItem) {
  const cartItemsDOM = cartDOM.querySelectorAll('.cart__item');
  const cartItemDOM = Array.from(cartItemsDOM).find(
    cartItemDOM => cartItemDOM.querySelector('.cart__item__name').innerText === cartItem.name
  );

  if (cartItemDOM) {
    cartItemDOM.querySelector('[data-action="INCREASE_ITEM"]').addEventListener('click', () => increaseItem(cartItem, cartItemDOM));
    cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').addEventListener('click', () => decreaseItem(cartItem, cartItemDOM));
    cartItemDOM.querySelector('[data-action="REMOVE_ITEM"]').addEventListener('click', () => removeItem(cartItem, cartItemDOM));
  }
}

function increaseItem(cartItem, cartItemDOM) {
  cartItemDOM.querySelector('.cart__item__quantity').innerText = ++cartItem.quantity;
  cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').classList.remove('btn--danger');
  saveCart();
}

function decreaseItem(cartItem, cartItemDOM) {
  if (cartItem.quantity > 1) {
    cartItemDOM.querySelector('.cart__item__quantity').innerText = --cartItem.quantity;
    saveCart();
  } else {
    removeItem(cartItem, cartItemDOM);
  }

  if (cartItem.quantity === 1) {
    cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').classList.add('btn--danger');
  }
}

function removeItem(cartItem, cartItemDOM) {
  cartItemDOM.classList.add('cart__item--removed');
  setTimeout(() => cartItemDOM.remove(), 250);
  cart = cart.filter(item => item.name !== cartItem.name);
  saveCart();
  if (cart.length < 1) {
    document.querySelector('.cart-footer').remove();
  }
}

function addCartFooter() {
  if (!document.querySelector('.cart-footer')) {
    cartDOM.insertAdjacentHTML(
      'afterend',
      `
      <div class="cart-footer">
        <button class="btn btn--danger" data-action="CLEAR_CART">Clear Cart</button>
        <button class="btn btn--primary" data-action="CHECKOUT">Pay</button>
      </div>
    `
    );

    document.querySelector('[data-action="CLEAR_CART"]').addEventListener('click', clearCart);
    document.querySelector('[data-action="CHECKOUT"]').addEventListener('click', checkout);
  }
}

function clearCart() {
  cartDOM.querySelectorAll('.cart__item').forEach(cartItemDOM => {
    cartItemDOM.classList.add('cart__item--removed');
    setTimeout(() => cartItemDOM.remove(), 250);
  });

  cart = [];
  localStorage.removeItem('cart');
  document.querySelector('.cart-footer').remove();
}

function checkout() {
  let paypalFormHTML = `
    <form id="paypal-form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
      <input type="hidden" name="cmd" value="_cart">
      <input type="hidden" name="upload" value="1">
      <input type="hidden" name="business" value="adrian@webdev.tube">
  `;

  cart.forEach((cartItem, index) => {
    ++index;
    paypalFormHTML += `
      <input type="hidden" name="item_name_${index}" value="${cartItem.name}">
      <input type="hidden" name="amount_${index}" value="${cartItem.price}">
      <input type="hidden" name="quantity_${index}" value="${cartItem.quantity}">
    `;
  });

  paypalFormHTML += `
      <input type="submit" value="PayPal">
    </form>
    <div class="overlay"></div>
  `;

  document.querySelector('body').insertAdjacentHTML('beforeend', paypalFormHTML);
  document.getElementById('paypal-form').submit();
}

function countCartTotal() {
  let cartTotal = 0;
  cart.forEach(cartItem => (cartTotal += cartItem.quantity * cartItem.price));
  document.querySelector('[data-action="CHECKOUT"]').innerText = `Pay $${cartTotal}`;
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  countCartTotal();
}
