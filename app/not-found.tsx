import Link from 'next/link';
import { Header, Footer } from '@/components/site-shell';
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="container legal">
        <p className="eyebrow">404 / PAGE NOT FOUND</p>
        <h1>
          A conversation starts
          <br />
          somewhere else.
        </h1>
        <p>This page could not be found.</p>
        <Link href="/" className="button">
          Return to Nat
        </Link>
      </main>
      <Footer />
    </>
  );
}
