// Zjednodušené logo Slovenskej sporiteľne (S s bodkou v modrom kruhu)
export function SlspLogo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-[#2870ed] flex items-center justify-center shrink-0 shadow-sm"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill="none" stroke="white" strokeWidth={2.6} strokeLinecap="round">
        <circle cx="12" cy="3.6" r="2" fill="white" stroke="none" />
        <path d="M18 9.2H9.2a2.6 2.6 0 0 0 0 5.2h5.6a2.6 2.6 0 0 1 0 5.2H6" />
      </svg>
    </div>
  );
}
