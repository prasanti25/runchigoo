/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
    price: Number(item.unit_price ?? item.menu_item_detail?.price ?? 0),
    addOns: item.add_ons || [],
    image: item.menu_item_detail?.image || "",
    image_url: item.menu_item_detail?.image_url || "",
    restaurantId: item.menu_item_detail?.restaurant,
    restaurant: item.menu_item_detail?.restaurant_detail?.name || "Restaurant",
    isVeg: item.menu_item_detail?.is_vegetarian,
  }));
}

export function CartProvider({ children }) {
  const { isAuthenticated, token, role } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState(null);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated || !token || role !== "customer") {
      setCartItems([]);
      setCoupon(null);
      return;
    }
    setLoading(true);
    try {
      const cart = await apiRequest("/cart/", { token });
      setCartItems(mapCart(cart));
      setCoupon(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, role, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCart();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadCart]);

  const addToCart = useCallback(
    async (food, quantity = 1, addonIds = []) => {
      if (!isAuthenticated)
        throw new Error("Please log in to add items to your cart.");
      if (role !== "customer")
        throw new Error("Only customer accounts can place orders.");
      const menuItemId = food.menuItemId || food.id;
      const incomingRestaurantId = food.restaurantId || food.restaurant;
      const localConflict =
        cartItems.length > 0 &&
        incomingRestaurantId &&
        cartItems.some(
          (item) => Number(item.restaurantId) !== Number(incomingRestaurantId),
        );
      let cartWasCleared = false;

      const confirmReplacement = () =>
        window.confirm(
          "Your cart contains items from another restaurant. Replace them with this item?",
        );
      const clearServerCart = async (items = cartItems) => {
        for (const item of items) {
          await apiRequest(`/cart/items/${item.id}/`, {
            token,
            method: "DELETE",
          });
        }
        setCartItems([]);
        setCoupon(null);
        cartWasCleared = true;
      };

      if (localConflict) {
        if (!confirmReplacement()) return false;
        await clearServerCart();
      }

      try {
        const cart = await apiRequest("/cart/items/", {
          token,
          method: "POST",
          body: { menu_item: menuItemId, quantity, addon_ids: addonIds },
        });
        setCartItems(mapCart(cart));
        setCoupon(null);
        return true;
      } catch (error) {
        const isRestaurantConflict = error.message
          .toLowerCase()
          .includes("one restaurant only");
        if (!isRestaurantConflict || cartWasCleared || !confirmReplacement())
          throw error;

        const currentCart = await apiRequest("/cart/", { token });
        await clearServerCart(currentCart.items || []);
        const cart = await apiRequest("/cart/items/", {
          token,
          method: "POST",
          body: { menu_item: menuItemId, quantity, addon_ids: addonIds },
        });
        setCartItems(mapCart(cart));
        setCoupon(null);
        return true;
      }
    },
    [cartItems, isAuthenticated, role, token],
  );

  const updateQuantity = useCallback(
    async (id, quantity) => {
      if (quantity <= 0)
        return apiRequest(`/cart/items/${id}/`, {
          token,
          method: "DELETE",
        }).then((cart) => {
          setCartItems(mapCart(cart));
          setCoupon(null);
        });
      const cart = await apiRequest(`/cart/items/${id}/`, {
        token,
        method: "PATCH",
        body: { quantity },
      });
      setCartItems(mapCart(cart));
      setCoupon(null);
    },
    [token],
  );

  const removeFromCart = useCallback(
    (id) => updateQuantity(id, 0),
    [updateQuantity],
  );
  const increaseQuantity = useCallback(
    (id) => {
      const item = cartItems.find((cartItem) => cartItem.id === id);
      return item ? updateQuantity(id, item.quantity + 1) : Promise.resolve();
    },
    [cartItems, updateQuantity],
  );
  const decreaseQuantity = useCallback(
    (id) => {
      const item = cartItems.find((cartItem) => cartItem.id === id);
      return item ? updateQuantity(id, item.quantity - 1) : Promise.resolve();
    },
    [cartItems, updateQuantity],
  );
  const clearCart = useCallback(async () => {
    await Promise.all(cartItems.map((item) => removeFromCart(item.id)));
    setCartItems([]);
    setCoupon(null);
  }, [cartItems, removeFromCart]);

  const applyCoupon = useCallback(
    async (code) => {
      const data = await apiRequest("/cart/validate-coupon/", {
        token,
        method: "POST",
        body: { code },
      });
      setCoupon({ code: data.code, discount: Number(data.discount || 0) });
      return data;
    },
    [token],
  );

  const clearCoupon = useCallback(() => setCoupon(null), []);

  const itemTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );
  const deliveryFee = itemTotal > 0 && itemTotal < 500 ? 40 : 0;
  const platformFee = 0;
  const discount = coupon?.discount || 0;
  const total = Math.max(0, itemTotal + deliveryFee - discount);

  const value = useMemo(
    () => ({
      cartItems,
      loading,
      loadCart,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      applyCoupon,
      clearCoupon,
      couponCode: coupon?.code || "",
      itemTotal,
      deliveryFee,
      platformFee,
      discount,
      total,
    }),
    [
      cartItems,
      loading,
      loadCart,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      applyCoupon,
      clearCoupon,
      coupon,
      itemTotal,
      deliveryFee,
      discount,
      total,
    ],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
