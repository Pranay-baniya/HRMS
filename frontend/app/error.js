"use client";

export default function Error({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-3">
      <p className="text-lg font-semibold text-gray-800">Something went wrong</p>
      <p className="text-sm text-gray-500 max-w-md text-center">{error?.message}</p>
      <button className="btn-primary mt-2" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
