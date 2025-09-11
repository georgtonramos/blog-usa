// src/app/contact/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Natural Eating Hub",
  description:
    "Get in touch with Natural Eating Hub for questions, feedback, or collaboration opportunities.",
  alternates: { canonical: "https://blog.naturaleatinghub.online/contact" },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">Contact</h1>

      <section className="mt-6 space-y-4 leading-relaxed text-zinc-700">
        <p>
          We’d love to hear from you! Whether you have questions about our
          articles, suggestions for new topics, or would like to discuss a
          potential collaboration, feel free to reach out.
        </p>

        <p>
          📩 <strong>Email:</strong>{" "}
          <a
            href="mailto:contact@naturaleatinghub.online"
            className="text-orange-600 underline hover:opacity-80"
          >
            contact@naturaleatinghub.online
          </a>
        </p>

        <p>
          You can also follow us and send messages on our social channels for
          updates and community interaction.
        </p>

        <ul className="list-disc pl-6 space-y-1">
          <li>
            <a
              href="https://twitter.com/naturaleatinghub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 underline hover:opacity-80"
            >
              Twitter/X
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}