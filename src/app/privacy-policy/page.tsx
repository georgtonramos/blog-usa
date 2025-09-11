import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Natural Eating Hub",
  description:
    "Read the Privacy Policy of Natural Eating Hub to understand how we handle data, cookies, and user information.",
  alternates: { canonical: "https://blog.naturaleatinghub.online/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>

      <section className="mt-6 space-y-4 text-zinc-700 leading-relaxed">
        <p>
          At <strong>Natural Eating Hub</strong>, we respect your privacy. This
          Privacy Policy explains how we collect, use, and protect your
          information when you visit our website.
        </p>

        <h2 className="mt-6 text-2xl font-bold">Information We Collect</h2>
        <p>
          We may collect basic information such as your name, email address, and
          any details you provide through our contact channels. We also use
          cookies and analytics tools (such as Google Analytics) to understand
          website usage.
        </p>

        <h2 className="mt-6 text-2xl font-bold">How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>To respond to questions or messages you send us</li>
          <li>To improve website content and user experience</li>
          <li>To share updates, if you subscribe to our newsletter</li>
        </ul>

        <h2 className="mt-6 text-2xl font-bold">Third-Party Services</h2>
        <p>
          We may use third-party services (such as analytics or email tools)
          that collect information under their own privacy policies.
        </p>

        <h2 className="mt-6 text-2xl font-bold">Your Rights</h2>
        <p>
          You can request access, correction, or deletion of your personal data
          by contacting us at{" "}
          <a
            href="mailto:contact@naturaleatinghub.online"
            className="text-orange-600 underline hover:opacity-80"
          >
            contact@naturaleatinghub.online
          </a>
          .
        </p>
      </section>
    </main>
  );
}