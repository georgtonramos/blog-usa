import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Natural Eating Hub",
  description:
    "Read the Terms of Service of Natural Eating Hub to understand the rules and conditions for using our website.",
  alternates: { canonical: "https://blog.naturaleatinghub.online/terms-of-service" },
};

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>

      <section className="mt-6 space-y-4 text-zinc-700 leading-relaxed">
        <p>
          By using <strong>Natural Eating Hub</strong>, you agree to the
          following terms and conditions. If you do not agree, please do not use
          our website.
        </p>

        <h2 className="mt-6 text-2xl font-bold">Use of Content</h2>
        <p>
          All articles and materials are provided for informational purposes
          only. You may not copy, distribute, or use our content for commercial
          purposes without permission.
        </p>

        <h2 className="mt-6 text-2xl font-bold">No Medical Advice</h2>
        <p>
          Our content is educational and does not replace medical, nutritional,
          or psychological advice. Always consult a healthcare professional
          before making lifestyle changes.
        </p>

        <h2 className="mt-6 text-2xl font-bold">Limitation of Liability</h2>
        <p>
          We are not responsible for any decisions, results, or issues that may
          arise from applying information found on our website.
        </p>

        <h2 className="mt-6 text-2xl font-bold">Changes</h2>
        <p>
          We may update these Terms of Service at any time. Continued use of the
          website means you accept the new terms.
        </p>
      </section>
    </main>
  );
}