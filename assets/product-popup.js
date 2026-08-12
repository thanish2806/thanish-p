// @ts-nocheck
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-open-popup]');
  if (btn) {
    const handle = btn.dataset.productHandle;
    const res = await fetch(`/products/${handle}.js`);
    const product = await res.json();
    openPopup(product);
  }
  if (e.target.closest('[data-close-popup]')) {
    document.getElementById('product-popup').hidden = true;
  }
});

let currentProduct = null;
let selectedOptions = {};

function openPopup(product) {
  currentProduct = product;
  selectedOptions = {};

  const popup = document.getElementById('product-popup');
  popup.querySelector('.product-popup__image').src = product.featured_image;
  popup.querySelector('.product-popup__title').textContent = product.title;
  popup.querySelector('.product-popup__price').textContent = `${(product.price / 100).toFixed(2)}€`;
  popup.querySelector('.product-popup__desc').textContent = product.description.replace(/<[^>]*>/g, '');

  // Color options (assume option1 = color)
  const colorValues = [...new Set(product.variants.map(v => v.option1))];
  const colorWrap = popup.querySelector('.product-popup__colors');
  colorWrap.innerHTML = colorValues.map(c => `<button data-color="${c}">${c}</button>`).join('');
  colorWrap.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      colorWrap.querySelectorAll('button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      selectedOptions.color = b.dataset.color;
    });
  });

  // Size dropdown (assume option2 = size)
  const sizeValues = [...new Set(product.variants.map(v => v.option2))];
  const sizeSelect = popup.querySelector('.product-popup__size');
  sizeSelect.innerHTML = `<option value="">Choose your size</option>` +
    sizeValues.map(s => `<option value="${s}">${s}</option>`).join('');
  sizeSelect.addEventListener('change', () => { selectedOptions.size = sizeSelect.value; });

  popup.querySelector('.product-popup__add-to-cart').onclick = addToCart;

  popup.hidden = false;
}

async function addToCart() {
  const variant = currentProduct.variants.find(
    v => v.option1 === selectedOptions.color && v.option2 === selectedOptions.size
  );
  if (!variant) { alert('Select color and size'); return; }

  const items = [{ id: variant.id, quantity: 1 }];

  // Special rule: Black + Medium => also add Soft Winter Jacket
  if (selectedOptions.color === 'Black' && selectedOptions.size === 'Medium') {
    const jacketRes = await fetch('/products/soft-winter-jacket.js'); // adjust handle
    const jacket = await jacketRes.json();
    items.push({ id: jacket.variants[0].id, quantity: 1 });
  }

  await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });

  document.getElementById('product-popup').hidden = true;
  alert('Added to cart!');
}