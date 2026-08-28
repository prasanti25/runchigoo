import Navbar from "../../components/Navbar.jsx";

import {
  Search,
  Star,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";

import { useMemo, useState } from "react";

const initialReviews = [
  {
    id: 1,
    customer: "Pavan K.",
    food: "Chicken Dum Biryani",
    rating: 5,
    review:
      "Excellent taste and packaging. Will definitely order again!",
    date: "22 Jul 2026",
  },
  {
    id: 2,
    customer: "Rahul",
    food: "Paneer Biryani",
    rating: 4,
    review:
      "Very tasty. Delivery was a little late.",
    date: "21 Jul 2026",
  },
  {
    id: 3,
    customer: "Sneha",
    food: "Family Combo",
    rating: 3,
    review:
      "Food was okay but could be hotter.",
    date: "20 Jul 2026",
  },
];

export default function CustomerReviews() {

  const [reviews] = useState(initialReviews);

  const [search, setSearch] = useState("");

  const [ratingFilter, setRatingFilter] =
    useState("All");

  const filteredReviews = useMemo(() => {

    return reviews.filter((review) => {

      const matchesSearch =
        review.customer
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesRating =
        ratingFilter === "All" ||
        review.rating === Number(ratingFilter);

      return matchesSearch && matchesRating;

    });

  }, [reviews, search, ratingFilter]);

  const averageRating =
    (
      reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      ) / reviews.length
    ).toFixed(1);

  const positiveReviews =
    reviews.filter((r) => r.rating >= 4).length;

  return (

    <>

      <Navbar />

      <main className="min-h-screen bg-[#fffaf7]">

        <section className="mx-auto max-w-7xl px-6 py-10">

          <div className="mb-10">

            <p className="font-semibold text-orange-500">
              Restaurant Panel
            </p>

            <h1 className="mt-2 text-4xl font-bold text-gray-900">
              Customer Reviews
            </h1>

            <p className="mt-3 text-gray-500">
              Monitor customer feedback and ratings.
            </p>

          </div>

          {/* Statistics */}

          <div className="mb-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <Star
                size={30}
                className="mb-3 text-yellow-500"
              />

              <h2 className="text-3xl font-bold">
                {averageRating}
              </h2>

              <p className="text-gray-500">
                Average Rating
              </p>

            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <MessageSquare
                size={30}
                className="mb-3 text-blue-500"
              />

              <h2 className="text-3xl font-bold">
                {reviews.length}
              </h2>

              <p>Total Reviews</p>

            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <ThumbsUp
                size={30}
                className="mb-3 text-green-500"
              />

              <h2 className="text-3xl font-bold">
                {positiveReviews}
              </h2>

              <p>Positive Reviews</p>

            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <Star
                size={30}
                className="mb-3 text-red-500"
              />

              <h2 className="text-3xl font-bold">
                {reviews.length - positiveReviews}
              </h2>

              <p>Needs Attention</p>

            </div>

          </div>

          {/* Search & Filter */}

          <div className="mb-8 flex flex-col gap-4 md:flex-row">

            <div className="relative flex-1">

              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search customer..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-xl border border-orange-200 py-4 pl-12 pr-4 outline-none focus:border-orange-500"
              />

            </div>

            <select
              value={ratingFilter}
              onChange={(e) =>
                setRatingFilter(e.target.value)
              }
              className="rounded-xl border border-orange-200 px-5 py-4 outline-none"
            >

              <option value="All">
                All Ratings
              </option>

              <option value="5">
                ⭐⭐⭐⭐⭐
              </option>

              <option value="4">
                ⭐⭐⭐⭐
              </option>

              <option value="3">
                ⭐⭐⭐
              </option>

              <option value="2">
                ⭐⭐
              </option>

              <option value="1">
                ⭐
              </option>

            </select>

          </div>

          {/* Reviews */}

          <div className="space-y-6">
                        {filteredReviews.length === 0 ? (

              <div className="rounded-3xl bg-white py-20 text-center shadow-sm">

                <div className="text-7xl">
                  ⭐
                </div>

                <h2 className="mt-6 text-3xl font-bold text-gray-900">
                  No Reviews Found
                </h2>

                <p className="mt-3 text-gray-500">
                  Try changing your search or rating filter.
                </p>

              </div>

            ) : (

              filteredReviews.map((review) => (

                <div
                  key={review.id}
                  className="rounded-3xl bg-white p-7 shadow-sm transition hover:shadow-lg"
                >

                  {/* Header */}

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-xl font-bold text-white">

                        {review.customer.charAt(0)}

                      </div>

                      <div>

                        <h2 className="text-xl font-bold text-gray-900">
                          {review.customer}
                        </h2>

                        <p className="text-gray-500">
                          Ordered: {review.food}
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                          {review.date}
                        </p>

                      </div>

                    </div>

                    {/* Rating */}

                    <div className="flex items-center gap-1">

                      {[1, 2, 3, 4, 5].map((star) => (

                        <Star
                          key={star}
                          size={22}
                          fill={
                            star <= review.rating
                              ? "#FACC15"
                              : "none"
                          }
                          className={
                            star <= review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        />

                      ))}

                    </div>

                  </div>

                  {/* Review */}

                  <div className="mt-6 rounded-2xl bg-orange-50 p-5">

                    <p className="leading-7 text-gray-700">
                      "{review.review}"
                    </p>

                  </div>

                  {/* Actions */}

                  <div className="mt-6 flex flex-wrap gap-3">

                    <button
                      className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                    >
                      💬 Reply
                    </button>

                    <button
                      className="rounded-xl border border-red-300 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-500 hover:text-white"
                    >
                      🚩 Report
                    </button>

                    <button
                      className="rounded-xl border border-green-300 px-5 py-3 font-semibold text-green-600 transition hover:bg-green-500 hover:text-white"
                    >
                      👍 Helpful
                    </button>

                  </div>

                </div>

              ))

            )}
                        {filteredReviews.length === 0 ? (

              <div className="rounded-3xl bg-white py-20 text-center shadow-sm">

                <div className="text-7xl">
                  ⭐
                </div>

                <h2 className="mt-6 text-3xl font-bold text-gray-900">
                  No Reviews Found
                </h2>

                <p className="mt-3 text-gray-500">
                  Try changing your search or rating filter.
                </p>

              </div>

            ) : (

              filteredReviews.map((review) => (

                <div
                  key={review.id}
                  className="rounded-3xl bg-white p-7 shadow-sm transition hover:shadow-lg"
                >

                  {/* Header */}

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-xl font-bold text-white">

                        {review.customer.charAt(0)}

                      </div>

                      <div>

                        <h2 className="text-xl font-bold text-gray-900">
                          {review.customer}
                        </h2>

                        <p className="text-gray-500">
                          Ordered: {review.food}
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                          {review.date}
                        </p>

                      </div>

                    </div>

                    {/* Rating */}

                    <div className="flex items-center gap-1">

                      {[1, 2, 3, 4, 5].map((star) => (

                        <Star
                          key={star}
                          size={22}
                          fill={
                            star <= review.rating
                              ? "#FACC15"
                              : "none"
                          }
                          className={
                            star <= review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        />

                      ))}

                    </div>

                  </div>

                  {/* Review */}

                  <div className="mt-6 rounded-2xl bg-orange-50 p-5">

                    <p className="leading-7 text-gray-700">
                      "{review.review}"
                    </p>

                  </div>

                  {/* Actions */}

                  <div className="mt-6 flex flex-wrap gap-3">

                    <button
                      className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                    >
                      💬 Reply
                    </button>

                    <button
                      className="rounded-xl border border-red-300 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-500 hover:text-white"
                    >
                      🚩 Report
                    </button>

                    <button
                      className="rounded-xl border border-green-300 px-5 py-3 font-semibold text-green-600 transition hover:bg-green-500 hover:text-white"
                    >
                      👍 Helpful
                    </button>

                  </div>

                </div>

              ))

            )}
                        {filteredReviews.length === 0 ? (

              <div className="rounded-3xl bg-white py-20 text-center shadow-sm">

                <div className="text-7xl">
                  ⭐
                </div>

                <h2 className="mt-6 text-3xl font-bold text-gray-900">
                  No Reviews Found
                </h2>

                <p className="mt-3 text-gray-500">
                  Try changing your search or rating filter.
                </p>

              </div>

            ) : (

              filteredReviews.map((review) => (

                <div
                  key={review.id}
                  className="rounded-3xl bg-white p-7 shadow-sm transition hover:shadow-lg"
                >

                  {/* Header */}

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-xl font-bold text-white">

                        {review.customer.charAt(0)}

                      </div>

                      <div>

                        <h2 className="text-xl font-bold text-gray-900">
                          {review.customer}
                        </h2>

                        <p className="text-gray-500">
                          Ordered: {review.food}
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                          {review.date}
                        </p>

                      </div>

                    </div>

                    {/* Rating */}

                    <div className="flex items-center gap-1">

                      {[1, 2, 3, 4, 5].map((star) => (

                        <Star
                          key={star}
                          size={22}
                          fill={
                            star <= review.rating
                              ? "#FACC15"
                              : "none"
                          }
                          className={
                            star <= review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        />

                      ))}

                    </div>

                  </div>

                  {/* Review */}

                  <div className="mt-6 rounded-2xl bg-orange-50 p-5">

                    <p className="leading-7 text-gray-700">
                      "{review.review}"
                    </p>

                  </div>

                  {/* Actions */}

                  <div className="mt-6 flex flex-wrap gap-3">

                    <button
                      className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                    >
                      💬 Reply
                    </button>

                    <button
                      className="rounded-xl border border-red-300 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-500 hover:text-white"
                    >
                      🚩 Report
                    </button>

                    <button
                      className="rounded-xl border border-green-300 px-5 py-3 font-semibold text-green-600 transition hover:bg-green-500 hover:text-white"
                    >
                      👍 Helpful
                    </button>

                  </div>

                </div>

              ))

            )}
                      </div>

        </section>

      </main>

    </>

  );

}