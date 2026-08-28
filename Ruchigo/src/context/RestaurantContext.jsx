/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";

const RestaurantContext = createContext(null);

export function RestaurantProvider({ children }) {
  const [restaurantProfile, setRestaurantProfile] = useState({
    name: "RuchiGo Kitchen",
    cuisine: "Multi cuisine",
    rating: 4.8,
    deliveryTime: "25-35 min",
  });

  const value = useMemo(
    () => ({
      restaurantProfile,
      setRestaurantProfile,
    }),
    [restaurantProfile]
  );

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error("useRestaurant must be used within a RestaurantProvider");
  }
  return context;
}
