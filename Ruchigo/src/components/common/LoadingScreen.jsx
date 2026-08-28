export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fffaf7] text-gray-700">
      <div className="flex items-center gap-3 rounded-2xl border border-orange-200 bg-white/80 px-5 py-4 shadow-lg backdrop-blur">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
