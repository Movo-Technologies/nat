'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="container legal">
      <p className="eyebrow">NAT</p>
      <h1>Something didn’t load.</h1>
      <p>Please try again.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
