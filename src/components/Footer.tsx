import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer-dark mt-12">
      <div className="container-readable py-8 text-sm">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <h4 className="font-semibold text-white mb-2">Natural Eating Hub</h4>
            <p className="text-gray-300">
              Tips and insights for a lighter, healthier life.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Legal</h4>
            <ul className="space-y-1">
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link href="/disclaimer">Disclaimer</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Contact</h4>
            <ul className="space-y-1">
              <li>
                <a href="mailto:contact@naturaleatinghub.online">
                  contact@naturaleatinghub.online
                </a>
              </li>
              <li>Support: 24h/7d</li>
            </ul>
          </div>
        </div>

        <hr className="my-6 border-white/10" />

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-gray-300">
          <p>© {new Date().getFullYear()} Natural Eating Hub. All rights reserved.</p>
          <p className="text-xs">
            *This site may contain affiliate links. Individual results may vary.
          </p>
        </div>
      </div>
    </footer>
  );
}
