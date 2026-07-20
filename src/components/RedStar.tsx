export function RedStar({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <polygon
        className="star-red"
        points="50,5 61,38 96,38 68,59 79,92 50,72 21,92 32,59 4,38 39,38"
        stroke="#8a1010"
        strokeWidth="2"
      />
    </svg>
  );
}
