import Link from "next/link";

/** Also served by the service worker when an unsaved page is opened offline. */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-extrabold text-forest-900">This page is not available</h1>
      <p className="mt-3 text-ink-muted">
        The page may not exist, or you may be offline and it has not been saved on this device yet.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-forest-700 px-6 font-bold text-white hover:bg-forest-900"
      >
        Go to the dashboard
      </Link>
    </div>
  );
}
