/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext.jsx";
import { apiRequest } from "../lib/api.js";

const CartContext = createContext(null);

function mapCart(cart) {
  return (cart?.items || []).map((item) => ({
    id: item.id,
    menuItemId: item.menu_item,
    quantity: item.quantity,
    name: item.menu_item_detail?.name || "Menu item",
    price: Number(item.menu_item_detail?.price || 0),
    image: item.menu_item_detail?.image || "",
    restaurantId: item.menu_item_detail?.restaurant,
    isVeg: item.menu_item_detail?.is_vegetarian,
  }));
}

export function CartProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const cart = await apiRequest("/cart/", { token });
      setCartItems(mapCart(cart));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadCart(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadCart]);

  const addToCart = useCallback(async (food, quantity = 1) => {
    if (!isAuthenticated) throw new Error("Please log in to add items to your cart.");
    const menuItemId = food.menuItemId || food.id;
    const cart = await apiRequest("/cart/items/", { token, method: "POST", body: { menu_item: menuItemId, quantity } });
    setCartItems(mapCart(cart));
  }, [isAuthenticated, token]);

  const updateQuantity = useCallback(async (id, quantity) => {
    if (quantity <= 0) return apiRequest(`/cart/items/${id}/`, { token, method: "DELETE" }).then((cart) => setCartItems(mapCart(cart)));
    const cart = await apiRequest(`/cart/items/${id}/`, { token, method: "PATCH", body: { quantity } });
    setCartItems(mapCart(cart));
  }, [token]);

  const removeFromCart = useCallback((id) => updateQuantity(id, 0), [updateQuantity]);
  const increaseQuantity = useCallback((id) => {
    const item = cartItems.find((cartItem) => cartItem.id === id);
    return item ? updateQuantity(id, item.quantity + 1) : Promise.resolve();
  }, [cartItems, updateQuantity]);
  const decreaseQuantity = useCallback((id) => {
    const item = cartItems.find((cartItem) => cartItem.id === id);
    return item ? updateQuantity(id, item.quantity - 1) : Promise.resolve();
  }, [cartItems, updateQuantity]);
  const clearCart = useCallback(async () => Promise.all(cartItems.map((item) => removeFromCart(item.id))), [cartItems, removeFromCart]);

  const itemTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
  const deliveryFee = itemTotal > 0 && itemTotal < 500 ? 40 : 0;
  const platformFee = 0;
  const discount = 0;
  const total = itemTotal + deliveryFee;

  const value = useMemo(() => ({ cartItems, loading, loadCart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, itemTotal, deliveryFee, platformFee, discount, total }), [cartItems, loading, loadCart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, itemTotal, deliveryFee, total]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
