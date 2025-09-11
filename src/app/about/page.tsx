// src/app/about/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Natural Eating Hub",
  description:
    "Learn more about Natural Eating Hub: our mission is to deliver safe, evidence-based and practical content on weight loss, teas, and healthy habits.",
  alternates: { canonical: "https://blog.naturaleatinghub.online/about" },
};

const AboutPage = () => {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">About</h1>

      <section className="mt-6 space-y-4 leading-relaxed text-zinc-700">
        <p>
          <strong>Natural Eating Hub</strong> was created to make{" "}
          <em>healthy weight management</em> information simple, practical, and
          easy to apply in daily life. We focus on topics like teas, nutrition,
          and lifestyle changes that are backed by research and explained in
          plain language.
        </p>
        <p>
          Our goal is to help readers cut through the noise of fad diets and
          quick fixes. Instead, we publish guides, checklists, and tips that
          highlight what really works, what to avoid, and how to make small,
          sustainable changes for long-term results.
        </p>
        <p className="text-sm text-zinc-500">
          <strong>Disclaimer:</strong> All content is for informational and
          educational purposes only. It is not a substitute for professional
          medical advice, diagnosis, or treatment. Always consult your
          healthcare provider before making changes to your diet or lifestyle.
        </p>
      </section>
    </main>
  );
};

export default AboutPage;