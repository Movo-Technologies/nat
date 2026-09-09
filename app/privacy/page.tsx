import Link from 'next/link';
import { Header, Footer } from '@/components/site-shell';
export const metadata = {
  title: 'Privacy notice — Nat',
  robots: { index: false, follow: true },
};
export default function Privacy() {
  return (
    <>
      <Header />
      <main id="main" className="container legal">
        <span className="badge">DRAFT · OWNER REVIEW REQUIRED</span>
        <h1>Privacy notice</h1>
        <p>
          This draft describes the intended handling of Nat early-access
          applications. The operator’s legal identity, privacy contact and
          retention period must be finalized before public launch.
        </p>
        <h2>Information in your application</h2>
        <p>
          The application asks for your name, email, website, optional company
          and role information, desired outcomes, beta participation preferences
          and optional notes. Please do not include sensitive personal
          information or passwords.
        </p>
        <h2>Why we collect it</h2>
        <p>
          Application information is used to evaluate beta fit and contact
          applicants about Nat early access. Acknowledging this notice is not
          consent to unrelated marketing. Submissions are intended to be stored
          in a configured Supabase database, accessible to authorized operators
          and necessary hosting providers.
        </p>
        <h2>Basic operation and abuse prevention</h2>
        <p>
          The website does not set advertising cookies or send data to a
          marketing analytics service. The application endpoint uses a keyed
          hash of the connection’s IP address to limit repeated requests.
          Expired rate-limit entries are removed during subsequent requests
          after one day. Hosting services may process technical request
          information under their own policies.
        </p>
        <h2>Retention and requests</h2>
        <p>
          Application retention and a verified contact for access, correction
          and deletion requests are awaiting owner approval. These details must
          be supplied before this draft is used as a public privacy notice.
        </p>
        <h2>Product demonstrations</h2>
        <p>
          The conversations on this website are scripted concepts. They do not
          contact Movo Labs or send the illustrated messages to a team.
        </p>
        <Link className="text-link" href="/">
          ← Return to Nat
        </Link>
      </main>
      <Footer />
    </>
  );
}
