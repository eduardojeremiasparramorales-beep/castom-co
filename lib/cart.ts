export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  wholesalePrice: number | null;
  wholesaleMinQty: number;
  quantity: number;
  imageUrl: string;
  variantName: string | null;
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("castom_cart");
    return JSON.parse(raw ?? "[]") as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("castom_cart", JSON.stringify(items ?? []));
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find(
    (i: CartItem) => i.productId === item.productId && i.variantName === item.variantName
  );
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  window.dispatchEvent(new Event("cart-updated"));
}

export function removeFromCart(id: string) {
  const cart = getCart().filter((i: CartItem) => i.id !== id);
  saveCart(cart);
  window.dispatchEvent(new Event("cart-updated"));
}

export function updateCartQuantity(id: string, quantity: number) {
  const cart = getCart();
  const item = cart.find((i: CartItem) => i.id === id);
  if (item) {
    item.quantity = Math.max(1, quantity);
  }
  saveCart(cart);
  window.dispatchEvent(new Event("cart-updated"));
}

export function clearCart() {
  saveCart([]);
  window.dispatchEvent(new Event("cart-updated"));
}

export function getCartTotal(items: CartItem[]) {
  let subtotal = 0;
  let totalWithDiscount = 0;

  for (const item of items ?? []) {
    const regularTotal = (item?.price ?? 0) * (item?.quantity ?? 0);
    subtotal += regularTotal;

    if (
      item?.wholesalePrice &&
      (item?.quantity ?? 0) >= (item?.wholesaleMinQty ?? 6)
    ) {
      totalWithDiscount += (item.wholesalePrice ?? 0) * (item?.quantity ?? 0);
    } else {
      totalWithDiscount += regularTotal;
    }
  }

  return {
    subtotal,
    total: totalWithDiscount,
    discount: subtotal - totalWithDiscount,
  };
}
