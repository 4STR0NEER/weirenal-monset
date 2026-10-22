// Droplet with a flow line: the mark for WEI Renal Care (placeholder until the client's logo lands).
export default function Logo({ text = 'WEI Renal Care' }) {
  return (
    <>
      <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="10" fill="currentColor" opacity=".12" />
        <path d="M16 6.5c-4 4.7-6.8 8.4-6.8 11.8a6.8 6.8 0 0 0 13.6 0c0-3.4-2.8-7.1-6.8-11.8Z" fill="currentColor" />
        <path d="M12.3 18.6c1.2-1.1 2.5-1.1 3.7 0s2.5 1.1 3.7 0" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span>{text}</span>
    </>
  )
}
