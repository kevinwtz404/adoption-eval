/** Bouncing three-dot loader for generate buttons. */
export default function LoadingDots({ text = 'Generating' }: { text?: string }) {
  return (
    <span>
      {text}
      <span class="loading-dots">
        <span class="dot">.</span>
        <span class="dot">.</span>
        <span class="dot">.</span>
      </span>
      <style>{`
        .loading-dots .dot {
          display: inline-block;
          animation: bounce 1.2s infinite ease-in-out;
        }
        .loading-dots .dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </span>
  );
}
