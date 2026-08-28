import { ChevronRight } from "lucide-react";

const faqs = [
  {
    question: "How do I place an order?",
    answer: "Browse restaurants, add dishes to your cart, and complete checkout with a saved delivery address.",
  },
  {
    question: "Can I order for a different address?",
    answer: "Yes. The profile and checkout flow supports delivery address management for multiple saved locations.",
  },
  {
    question: "How does account security work?",
    answer: "The auth flow includes role-based access, session persistence, protected routes, and secure login states.",
  },
  {
    question: "What if I need support after checkout?",
    answer: "Use the support page or the contact channel in the footer to connect with the support team.",
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#fff8f5] px-4 py-10 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-orange-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">FAQ</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">Answers at a glance.</h1>

        <div className="mt-8 space-y-4">
          {faqs.map((item) => (
            <div key={item.question} className="rounded-[24px] border border-orange-100 bg-orange-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-gray-900">{item.question}</h2>
                <ChevronRight className="text-orange-500" size={18} />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
