import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { useNavigate, useParams } from "react-router-dom";
import {
  Star,
  Clock,
  MapPin,
  Bike,
  Plus,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";

// ===============================
// Food Images
// ===============================

import food1 from "../assets/foods/food(1).jpg";
import food2 from "../assets/foods/food(2).jpg";
import food3 from "../assets/foods/food(3).jpg";
import food4 from "../assets/foods/food(4).jpg";
import food5 from "../assets/foods/food(5).jpg";
import food6 from "../assets/foods/food(6).jpg";
import food7 from "../assets/foods/food(7).jpg";
import food8 from "../assets/foods/food(8).jpg";
import food9 from "../assets/foods/food(9).jpg";
import food10 from "../assets/foods/food(10).jpg";
import food11 from "../assets/foods/food(11).jpg";
import food12 from "../assets/foods/food(12).jpg";

// ===============================
// Restaurant Details
// ===============================

const restaurants = {
  1: {
    id: 1,
    name: "Paradise Biryani",
    cuisine: "Biryani • North Indian • Mughlai",
    rating: "4.8",
    time: "30-40 min",
    delivery: "₹30 Delivery",
    location: "Guntur, Andhra Pradesh",
    image: food1,
  },

  2: {
    id: 2,
    name: "Pizza Hub",
    cuisine: "Pizza • Italian",
    rating: "4.6",
    time: "25-35 min",
    delivery: "₹25 Delivery",
    location: "Vijayawada, Andhra Pradesh",
    image: food6,
  },

  3: {
    id: 3,
    name: "Burger House",
    cuisine: "Burgers • Fast Food",
    rating: "4.5",
    time: "20-30 min",
    delivery: "Free Delivery",
    location: "Hyderabad, Telangana",
    image: food5,
  },
};

// ===============================
// Menu Items
// ===============================

const menuItems = [
  {
    id: 1,
    name: "Chicken Dum Biryani",
    description:
      "Authentic Hyderabadi dum biryani served with raita and mirchi salan.",
    price: 249,
    rating: "4.9",
    image: food1,
    category: "Biryani",
    veg: false,
    bestseller: true,
  },

  {
    id: 2,
    name: "Special Chicken Biryani",
    description:
      "RuchiGo special spicy chicken biryani with double masala.",
    price: 299,
    rating: "4.8",
    image: food2,
    category: "Biryani",
    veg: false,
    bestseller: true,
  },

  {
    id: 3,
    name: "Paneer Biryani",
    description:
      "Delicious vegetarian biryani prepared with fresh paneer.",
    price: 219,
    rating: "4.6",
    image: food3,
    category: "Biryani",
    veg: true,
    bestseller: false,
  },

  {
    id: 4,
    name: "Chicken 65",
    description:
      "Crispy spicy chicken starter served with onion and lemon.",
    price: 199,
    rating: "4.7",
    image: food4,
    category: "Starters",
    veg: false,
    bestseller: true,
  },

  {
    id: 5,
    name: "Cheese Burger",
    description:
      "Loaded burger with cheese and juicy chicken patty.",
    price: 179,
    rating: "4.5",
    image: food5,
    category: "Burgers",
    veg: false,
    bestseller: false,
  },

  {
    id: 6,
    name: "Margherita Pizza",
    description:
      "Stone baked pizza topped with mozzarella cheese.",
    price: 349,
    rating: "4.8",
    image: food6,
    category: "Pizza",
    veg: true,
    bestseller: true,
  },

  {
    id: 7,
    name: "Veg Fried Rice",
    description:
      "Fresh vegetables tossed with aromatic fried rice.",
    price: 189,
    rating: "4.4",
    image: food7,
    category: "Rice",
    veg: true,
    bestseller: false,
  },

  {
    id: 8,
    name: "Chicken Noodles",
    description:
      "Hot and spicy chicken noodles with vegetables.",
    price: 209,
    rating: "4.6",
    image: food8,
    category: "Chinese",
    veg: false,
    bestseller: false,
  },

  {
    id: 9,
    name: "French Fries",
    description:
      "Golden crispy fries served with ketchup.",
    price: 129,
    rating: "4.5",
    image: food9,
    category: "Snacks",
    veg: true,
    bestseller: false,
  },

  {
    id: 10,
    name: "Chocolate Brownie",
    description:
      "Warm chocolate brownie with chocolate syrup.",
    price: 149,
    rating: "4.8",
    image: food10,
    category: "Desserts",
    veg: true,
    bestseller: true,
  },

  {
    id: 11,
    name: "Vanilla Milkshake",
    description:
      "Creamy vanilla milkshake with whipped cream.",
    price: 119,
    rating: "4.7",
    image: food11,
    category: "Drinks",
    veg: true,
    bestseller: false,
  },

  {
    id: 12,
    name: "Cold Coffee",
    description:
      "Refreshing cold coffee with ice cream.",
    price: 139,
    rating: "4.6",
    image: food12,
    category: "Drinks",
    veg: true,
    bestseller: true,
  },
];

export default function Restaurant() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(restaurants[id] || restaurants[1]);
  const [menu, setMenu] = useState(menuItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    Promise.all([apiRequest(`/restaurants/${id}/`), apiRequest(`/menu-items/?restaurant=${id}`)])
      .then(([data, menuData]) => {
        setRestaurant({ id: data.id, name: data.name, cuisine: data.description || "Restaurant", rating: data.average_rating, time: "30-40 min", delivery: "₹40 Delivery", location: `${data.city}, ${data.address}`, image: data.image || food1 });
        const results = menuData.results || menuData;
        setMenu(results.map((item) => ({ id: item.id, name: item.name, description: item.description, price: Number(item.price), rating: item.restaurant_detail?.average_rating || "New", image: item.image || food1, category: item.category_name || "Menu", veg: item.is_vegetarian, bestseller: false })));
      })
      .catch((requestError) => {
        setError(requestError.message);
        toast.error("Unable to load this restaurant.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const filteredMenu = menu.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) return <><Navbar /><main className="min-h-screen bg-[#fffaf7] p-10 text-center">Loading restaurant…</main></>;
  if (error) return <><Navbar /><main className="min-h-screen bg-[#fffaf7] p-10 text-center text-red-600">{error}</main></>;


  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#fffaf7]">

        <section className="mx-auto max-w-7xl px-6 py-8">

          {/* Restaurant Hero */}

          <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 shadow-xl">

            <div className="grid items-center gap-10 p-10 lg:grid-cols-2">

              <div>

                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-100">
                  Restaurant
                </p>

                <h1 className="text-5xl font-bold text-white">
                  {restaurant.name}
                </h1>

                <p className="mt-4 text-lg text-orange-100">
                  {restaurant.cuisine}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">

                  <div className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 backdrop-blur-lg">
                    <Star size={18} fill="currentColor" />
                    <span>{restaurant.rating}</span>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 backdrop-blur-lg">
                    <Clock size={18} />
                    <span>{restaurant.time}</span>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 backdrop-blur-lg">
                    <Bike size={18} />
                    <span>{restaurant.delivery}</span>
                  </div>

                </div>

                <div className="mt-6 flex items-center gap-2 text-orange-100">
                  <MapPin size={18} />
                  {restaurant.location}
                </div>

              </div>

              <div className="overflow-hidden rounded-3xl shadow-2xl">

                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="h-[350px] w-full object-cover transition duration-500 hover:scale-110"
                />

              </div>

            </div>

          </div>

          {/* Menu Header */}

          <section className="py-10">

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

              <div>

                <h2 className="text-3xl font-bold text-gray-900">
                  Restaurant Menu
                </h2>

                <p className="mt-2 text-gray-500">
                  Choose your favourite dishes
                </p>

              </div>

              <div className="flex items-center rounded-2xl border border-orange-100 bg-white px-5 shadow-sm">

                <Search
                  size={20}
                  className="text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search your favourite food..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 px-4 py-3 outline-none"
                />

              </div>

            </div>

            {/* Categories */}

            <div className="mt-8 flex flex-wrap gap-3">

              {[
                "All",
                "Biryani",
                "Pizza",
                "Burgers",
                "Starters",
                "Chinese",
                "Desserts",
                "Drinks",
              ].map((category) => (

                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-6 py-3 font-medium transition ${
                    selectedCategory === category
                      ? "bg-orange-500 text-white"
                      : "border border-orange-100 bg-white text-gray-700 hover:bg-orange-50"
                  }`}
                >
                  {category}
                </button>

              ))}

            </div>
                        {/* Food Cards */}

            <div className="mt-10 grid gap-6 md:grid-cols-2">

              {filteredMenu.length > 0 ? (

                filteredMenu.map((item) => (

                  <div
                    key={item.id}
                    className="group flex gap-5 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                  >

                    {/* Food Image */}

                    <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl">

                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      />

                      {/* Veg / Non Veg */}

                      <span
                        className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-semibold text-white ${
                          item.veg ? "bg-green-600" : "bg-red-600"
                        }`}
                      >
                        {item.veg ? "Veg" : "Non Veg"}
                      </span>

                    </div>

                    {/* Details */}

                    <div className="flex flex-1 flex-col justify-between">

                      <div>

                        <div className="flex items-start justify-between">

                          <h3 className="text-xl font-bold text-gray-900">
                            {item.name}
                          </h3>

                          <span className="flex items-center gap-1 rounded-lg bg-green-100 px-2 py-1 text-sm font-semibold text-green-700">

                            <Star
                              size={14}
                              fill="currentColor"
                            />

                            {item.rating}

                          </span>

                        </div>

                        <p className="mt-3 text-sm leading-6 text-gray-500">
                          {item.description}
                        </p>

                      </div>

                      <div className="mt-5 flex items-center justify-between">

                        <p className="text-2xl font-bold text-orange-600">
                          ₹{item.price}
                        </p>

                        <button
                          onClick={async () => {
                            try { await addToCart(item); toast.success("Added to cart."); }
                            catch (error) { toast.error(error.message); if (!isAuthenticated) navigate("/login", { state: { from: { pathname: `/restaurant/${id}` } } }); }
                          }}
                          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 font-semibold text-white shadow-lg transition duration-300 hover:scale-105 hover:shadow-xl"
                        >
                          <Plus size={18} />
                          Add to Cart
                        </button>

                      </div>

                    </div>

                  </div>

                ))

              ) : (

                <div className="col-span-2 py-20 text-center">

                  <h2 className="text-3xl font-bold text-gray-800">
                    🍽️ No Food Found
                  </h2>

                  <p className="mt-4 text-gray-500">
                    Try searching another delicious dish.
                  </p>

                </div>

              )}

            </div>

          </section>

        </section>

      </main>

    </>

  );

}
