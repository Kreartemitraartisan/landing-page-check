// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-teal-700 font-medium">Memuat...</p>
      </div>
    </div>
  );
}