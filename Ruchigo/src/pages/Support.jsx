import { Headphones, Mail, ShieldCheck } from "lucide-react";

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#fff8f5] px-4 py-10 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-orange-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">Support</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">We’re here to help.</h1>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-orange-100 bg-orange-50 p-5">
            <Headphones className="text-orange-500" size={20} />
            <p className="mt-4 text-base font-semibold text-gray-900">Live assistance</p>
            <p className="mt-2 text-sm text-gray-600">Talk to our agents for order, account, or checkout help.</p>
          </div>
          <div className="rounded-[24px] border border-orange-100 bg-orange-50 p-5">
            <Mail className="text-orange-500" size={20} />
            <p className="mt-4 text-base font-semibold text-gray-900">Email support</p>
            <a href="mailto:Support@ruchigo.online" className="mt-2 block text-sm font-medium text-orange-600">Support@ruchigo.online</a>
          </div>
          <div className="rounded-[24px] border border-orange-100 bg-orange-50 p-5">
            <ShieldCheck className="text-orange-500" size={20} />
            <p className="mt-4 text-base font-semibold text-gray-900">Secure resolution</p>
            <p className="mt-2 text-sm text-gray-600">Account-sensitive issues are routed through protected flows.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
