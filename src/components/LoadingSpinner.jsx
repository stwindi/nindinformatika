export default function LoadingSpinner({ size = 'full' }) {
  return (
    <div className={`flex items-center justify-center ${
      size === 'full' ? 'min-h-screen' : 'py-12'
    }`}>
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg">📚</span>
        </div>
      </div>
    </div>
  );
}
