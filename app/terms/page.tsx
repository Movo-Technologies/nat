import Link from 'next/link';
import { Header, Footer } from '@/components/site-shell';
export const metadata = {
  title: 'Website terms — Nat',
  robots: { index: false, follow: true },
};
export default function Terms() {
  return (
    <>
      <Header />
      <main id="main" className="container legal">
        <span className="badge">DRAFT · OWNER REVIEW REQUIRED</span>
        <h1>Website terms</h1>
        <p>
          These are draft terms for the Nat early-access website. They require
          owner and legal review before public launch, including confirmation of
          the operator and applicable jurisdiction.
        </p>
        <h2>Early access</h2>
        <p>
          Nat is being prepared for private beta. Applying does not guarantee
          admission, a launch date, pricing, support levels or availability of
          any particular capability. Selected applicants will receive separate
          onboarding information.
        </p>
        <h2>Concept demonstrations</h2>
        <p>
          The website’s conversations, routing examples and embed code
          illustrate the intended product. They are not a live Nat service. Nat
          Brief and Nat Voice are planned capabilities and are outside the
          initial Core V1 beta scope.
        </p>
        <h2>Using this website</h2>
        <p>
          Provide information you are authorized to share. Do not use the
          application form to impersonate others, submit confidential
          credentials, send spam or interfere with the website.
        </p>
        <h2>Your application</h2>
        <p>
          The <Link href="/privacy">privacy notice</Link> explains the intended
          processing of application information. No purchase or payment is
          required to apply. Any eventual beta participation terms will be
          provided separately.
        </p>
        <h2>Contact and final terms</h2>
        <p>
          The operator’s legal details, contact information and final terms are
          awaiting approval. This draft does not claim certification or
          regulatory compliance.
        </p>
        <Link className="text-link" href="/">
          ← Return to Nat
        </Link>
      </main>
      <Footer />
    </>
  );
}
