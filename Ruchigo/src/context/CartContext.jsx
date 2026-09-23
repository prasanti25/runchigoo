/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext.jsx";
import { apiRequest } from "../lib/api.js";
import { useDeliveryLocation } from "../lib/product.js";

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
  const deliveryLocation = useDeliveryLocation();
  const addressId = deliveryLocation.address_id;
  const cartKey = JSON.stringify({
    items: cartItems,
    address: deliveryLocation,
  });
  const cartScope = useRef({ key: cartKey, token });
  const couponRequest = useRef(0);
  useEffect(() => {
    cartScope.current = { key: cartKey, token };
  }, [cartKey, token]);
  const selectedCoupon = coupon?.token === token ? coupon?.code || "" : "";
  useEffect(() => {
    if (!selectedCoupon || !cartItems.length) return;
    const controller = new AbortController();
    const operation = ++couponRequest.current;
    apiRequest("/cart/validate-coupon/", {
      token,
      method: "POST",
      signal: controller.signal,
      body: {
        code: selectedCoupon,
        ...(addressId ? { address_id: addressId } : {}),
      },
    })
      .then((data) => {
        if (controller.signal.aborted || operation !== couponRequest.current)
          return;
        setCoupon({
          code: data.code,
          discount: Number(data.food_discount ?? data.discount),
          saving: Number(data.discount),
          benefit: data.benefit_type,
          key: cartKey,
          token,
        });
      })
      .catch((error) => {
        if (controller.signal.aborted || operation !== couponRequest.current)
          return;
        setCoupon(null);
        toast.error(`${selectedCoupon} was removed: ${error.message}`);
      });
    return () => controller.abort();
  }, [cartKey, cartItems.length, selectedCoupon, token, addressId]);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated || !token || !["customer", "admin"].includes(role)) {
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
      if (!["customer", "admin"].includes(role))
        throw new Error("Use a personal customer account to place orders.");
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
          if (!cart.items?.length) setCoupon(null);
        });
      const cart = await apiRequest(`/cart/items/${id}/`, {
        token,
        method: "PATCH",
        body: { quantity },
      });
      setCartItems(mapCart(cart));
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
      const operation = ++couponRequest.current;
      const data = await apiRequest("/cart/validate-coupon/", {
        token,
        method: "POST",
        body: { code, ...(addressId ? { address_id: addressId } : {}) },
      });
      if (
        operation !== couponRequest.current ||
        cartScope.current.key !== cartKey ||
        cartScope.current.token !== token
      )
        throw new Error(
          "Your bag changed while applying the coupon. Please try again.",
        );
      setCoupon({
        code: data.code,
        discount: Number(data.food_discount ?? data.discount ?? 0),
        saving: Number(data.discount || 0),
        benefit: data.benefit_type,
        key: cartKey,
        token,
      });
      return data;
    },
    [token, cartKey, addressId],
  );

  const clearCoupon = useCallback(() => {
    couponRequest.current++;
    setCoupon(null);
  }, []);

  const itemTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );
  const deliveryFee = itemTotal > 0 && itemTotal < 500 ? 40 : 0;
  const platformFee = 0;
  const discount =
    coupon?.token === token && coupon?.key === cartKey
      ? coupon?.discount || 0
      : 0;
  const couponChecking = Boolean(selectedCoupon && coupon?.key !== cartKey);
  const couponSaving =
    coupon?.token === token && coupon?.key === cartKey
      ? coupon?.saving || 0
      : 0;
  const couponBenefit = selectedCoupon ? coupon?.benefit || "food" : "";
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
      couponCode: selectedCoupon,
      couponChecking,
      itemTotal,
      deliveryFee,
      platformFee,
      discount,
      couponSaving,
      couponBenefit,
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
      selectedCoupon,
      couponChecking,
      itemTotal,
      deliveryFee,
      discount,
      couponSaving,
      couponBenefit,
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
