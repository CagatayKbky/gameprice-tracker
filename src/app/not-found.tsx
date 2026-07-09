import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
      <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
      <p className="text-xl text-muted mb-8">Oyun bulunamadı</p>
      <Link
        href="/"
        className="inline-flex px-6 py-2.5 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover transition-colors"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
