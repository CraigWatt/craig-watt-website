export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-zinc-600 dark:text-zinc-400">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>{new Date().getFullYear()} – Craig Watt</p>

          {/* Required disclosure when hiding the badge (reCAPTCHA v3) */}
          <p className="leading-relaxed">
            This site is protected by reCAPTCHA and the Google{" "}
            <a
              href="https://policies.google.com/privacy"
              className="underline hover:no-underline"
              target="_blank" rel="noopener noreferrer"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="https://policies.google.com/terms"
              className="underline hover:no-underline"
              target="_blank" rel="noopener noreferrer"
            >
              Terms of Service
            </a>{" "}
            apply.
          </p>
        </div>
      </div>
    </footer>
  );
}
