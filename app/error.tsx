"use client";

export default function Error({
  error,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{padding:16}}>
      <h2>Something on this page crashed.</h2>
      <pre style={{opacity:.7, whiteSpace:"pre-wrap"}}>{error?.message}</pre>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
