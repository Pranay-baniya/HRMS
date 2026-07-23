import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-3">
      <p className="text-4xl font-bold text-brand">404</p>
      <p className="text-sm text-gray-500">This page could not be found.</p>
      <Link href="/dashboard" className="btn-primary mt-2">
        Back to Dashboard
      </Link>
    </div>
  );
}
