import {
  ArrowUpRight,
  ArrowRight,
  Check,
  MessageSquare,
  Layers,
  BookOpen,
  ScanLine,
  Route,
  Globe,
} from 'lucide-react';
import { NatDemo } from '@/components/nat-demo';
import { Header, Footer, CTA, Pulse } from '@/components/site-shell';
import c from '@/content/marketing.json';
import { WaitlistForm } from '@/components/waitlist-form';
const icons = [BookOpen, ScanLine, MessageSquare, Route, Layers, Globe];
function Heading({
  data,
}: {
  data: { Eyebrow?: string; H2: string; Body?: string };
}) {
  return (
    <>
      <p className="eyebrow">{data.Eyebrow}</p>
      <h2>{data.H2}</h2>
      {data.Body && <p>{data.Body}</p>}
    </>
  );
}
export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="hero container">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="status-dot" />
              {c.hero.Eyebrow}
            </p>
            <h1>
              Your website knows the answer.
              <br />
              <span>Now it can say it.</span>
            </h1>
            <p className="hero-description">{c.hero.Body}</p>
            <div className="hero-actions">
              <CTA placement="hero" />
              <a className="text-link" href="#demo">
                See Nat in action <ArrowUpRight size={17} />
              </a>
            </div>
            <p className="hero-note">{c.hero['Support line']}</p>
          </div>
          <NatDemo />
        </section>
        <div className="proof container">
          <span>
            A little presence.
            <br />A more useful website.
          </span>
          {['Learn', 'Answer', 'Guide', 'Route'].map((v, i) => (
            <div key={v}>
              <small>0{i + 1}</small>
              {v}
              <span className="proof-dot">✳</span>
            </div>
          ))}
        </div>
        <section className="section container problem">
          <div>
            <Heading data={c.problem} />
          </div>
          <div className="problem-body">
            <p>{c.problem['Body 1']}</p>
            <p className="ink">{c.problem['Body 2']}</p>
            <p className="statement">
              {c.problem['Closing line']}
              <ArrowRight size={20} />
            </p>
          </div>
        </section>
        <section id="what-nat-does" className="section container">
          <p className="eyebrow">MEET YOUR WEBSITE’S FIRST RESPONSE</p>
          <h2>One presence. A lot less friction.</h2>
          <div className="capabilities">
            {c.capabilities.map(([n, h, p], i) => {
              const Icon = icons[i];
              return (
                <article key={n}>
                  <div className="card-top">
                    <Icon size={24} strokeWidth={1.5} />
                    <small>{n}</small>
                  </div>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </article>
              );
            })}
          </div>
        </section>
        <section id="how-it-works" className="section container">
          <p className="eyebrow">HOW IT WORKS</p>
          <h2>
            From your website.
            <br />
            To a conversation.
          </h2>
          <div className="steps">
            {c.steps.map(([n, h, p]) => (
              <article key={n}>
                <span className="step-number">{n}</span>
                <h3>{h}</h3>
                <p>{p}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="section routing-band">
          <div className="container split">
            <div>
              <Heading data={c.routing} />
              <p className="small">{c.routing.Microcopy}</p>
              <strong>{c.routing['Closing line']}</strong>
            </div>
            <div className="routing-visual">
              <span className="eyebrow">PRODUCT CONCEPT</span>
              <div className="enquiry">
                “I’d like to talk about a project.”
                <MessageSquare size={18} />
              </div>
              <div className="route-line" />
              <div className="route-brain">
                <Pulse /> Nat <span>Intent understood</span>
              </div>
              <div className="route-line" />
              <div className="destinations">
                <span className="active">
                  <Check size={15} /> Sales
                </span>
                <span>Support</span>
                <span>Billing</span>
              </div>
              <div className="context-attached">
                <Layers size={16} /> Conversation + details + context
              </div>
            </div>
          </div>
        </section>
        <section className="section container split">
          <div className="page-context">
            <div className="browser-bar">
              <span>● ● ●</span> movo.example / services / mobile-apps
            </div>
            <div className="example-page">
              <small>MOVO LABS / SERVICES</small>
              <h3>Built for what’s next.</h3>
              <p>Custom mobile applications.</p>
              <div className="page-lines" />
              <span className="highlight">
                <Check size={15} /> 30 days of post-launch support
              </span>
            </div>
            <div className="context-chat">
              <Pulse />
              <div>
                <strong>{c.context['Example visitor']}</strong>
                <p>{c.context['Example Nat']}</p>
              </div>
            </div>
            <small className="example-label">
              Illustrative page and conversation
            </small>
          </div>
          <div>
            <Heading data={c.context} />
          </div>
        </section>
        <section className="container future">
          <div>
            <span className="badge">{c.future.Badge}</span>
            <h2>{c.future.H2}</h2>
            <p>{c.future.Body}</p>
            <p className="future-closing">{c.future.Closing}</p>
          </div>
          <div className="voice-concept">
            <span>Nat Brief + Voice</span>
            <div className="voice-bars" aria-hidden="true">
              {[18, 30, 46, 68, 40, 80, 54, 96, 62, 42, 74, 50, 26, 40, 18].map(
                (h, i) => (
                  <i key={i} style={{ height: h }} />
                ),
              )}
            </div>
            <small>Conversation in. A clearer brief out.</small>
            <span className="badge">Coming later</span>
          </div>
        </section>
        <section id="developers" className="section container split">
          <div>
            <Heading data={c.developer} />
            <p className="small">{c.developer.Microcopy}</p>
          </div>
          <div className="code-panel">
            <div>
              <span>index.html</span>
              <span>Conceptual embed</span>
            </div>
            <pre>
              <code>
                {
                  '<!-- Conceptual embed — not operational -->\n<script\n  src="https://cdn.nat.example/widget.js"\n  data-nat-site="nat_site_pub_xxxxx"\n></script>'
                }
              </code>
            </pre>
            <p>
              <span className="status-dot" /> One integration. Your experience.
            </p>
          </div>
        </section>
        <section className="section container use-cases">
          <p className="eyebrow">BUILT FOR REAL ENQUIRIES</p>
          <h2>Where the conversation matters.</h2>
          {c.audiences.map(([h, p], i) => (
            <div className="use-case" key={h}>
              <small>0{i + 1}</small>
              <h3>{h}</h3>
              <p>{p}</p>
              <ArrowUpRight size={20} />
            </div>
          ))}
        </section>
        <section id="early-access" className="section container split waitlist">
          <div>
            <Heading data={c.waitlist} />
            <p className="qualifier">{c.waitlist['Qualifier line']}</p>
          </div>
          <WaitlistForm />
        </section>
        <section className="section container faq">
          <div>
            <p className="eyebrow">A FEW THINGS TO KNOW</p>
            <h2>
              Good questions.
              <br />
              Straight answers.
            </h2>
          </div>
          <div>
            {c.faq.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span>+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="container final-cta">
          <Pulse />
          <h2>
            Ready to give your
            <br />
            website a front desk?
          </h2>
          <p>Join the Nat private beta.</p>
          <CTA placement="final" />
        </section>
      </main>
      <Footer />
    </>
  );
}
