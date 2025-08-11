"use client";

export default function GlobalError({
  error, reset
}: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body style={{padding:16}}>
        <h2>superNova had a hiccup.</h2>
        <pre style={{opacity:.7, whiteSpace:"pre-wrap"}}>{error?.message}</pre>
        <button onClick={() => reset()}>Reload</button>
      </body>
    </html>
  );
}
