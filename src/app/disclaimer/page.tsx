import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | Natural Eating Hub",
  description:
    "Read the Disclaimer of Natural Eating Hub: all content is educational and does not replace professional medical advice.",
  alternates: { canonical: "https://blog.naturaleatinghub.online/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">Disclaimer</h1>

      <section className="mt-6 space-y-4 text-zinc-700 leading-relaxed">
        <p>
          The information provided on <strong>Natural Eating Hub</strong> is for
          general informational and educational purposes only.
        </p>

        <p>
          We do not provide medical, nutritional, or psychological advice. The
          content should not be relied upon as a substitute for consultation
          with qualified healthcare professionals.
        </p>

        <p>
          While we aim to provide accurate and up-to-date information, we make
          no warranties or guarantees of any kind regarding completeness,
          reliability, or accuracy.
        </p>

        <p>
          By using our website, you agree that <strong>Natural Eating Hub</strong> 
          is not liable for any outcomes, losses, or damages related to the use
          of our content.
        </p>
      </section>
    </main>
  );
}