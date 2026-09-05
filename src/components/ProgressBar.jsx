export default function ProgressBar({ value = 0, color = 'primary', size = 'md', showLabel = false }) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const colorMap = {
    primary: 'bg-primary-600',
    cyan: 'bg-cyan-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
  };
  const sizeMap = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-semibold text-gray-700">{clampedValue}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full ${sizeMap[size]}`}>
        <div
          className={`${colorMap[color]} ${sizeMap[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
