export default function LoadingSpinner({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
      <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
