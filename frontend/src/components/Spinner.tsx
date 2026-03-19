/** Full-page centered loading spinner */
export default function Spinner({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center w-full py-16">
      <svg
        className="animate-spin text-primary-500"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
      </svg>
    </div>
  );
}
