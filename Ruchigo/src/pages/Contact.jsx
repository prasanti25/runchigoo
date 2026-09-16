import { Mail } from "lucide-react";

const contactItems = [
  { icon: Mail, title: "Email us", value: "Support@ruchigo.online", href: "mailto:Support@ruchigo.online" },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#fff8f5] px-4 py-10 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-orange-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">Contact</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">Let’s help you in the right way.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
          Reach out to our support team for account issues, order questions, business partnerships, or platform assistance.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {contactItems.map(({ icon: Icon, title, value, href }) => {
            const Tag = href ? "a" : "div";
            return (
            <Tag key={title} href={href} className="rounded-[24px] border border-orange-100 bg-orange-50 p-5 transition hover:border-orange-300">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
                <Icon size={20} />
              </div>
              <p className="mt-4 text-sm text-gray-500">{title}</p>
              <p className="mt-1 text-base font-semibold text-gray-900">{value}</p>
            </Tag>
          );})}
        </div>
      </div>
    </main>
  );
}
