'use client';
import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { outcomes, validateApplication } from '@/lib/validation/early-access';
import { track } from '@/lib/analytics';
const initial = {
  name: '',
  email: '',
  websiteUrl: '',
  companyName: '',
  role: '',
  industry: '',
  currentStack: '',
  trafficBand: '',
  notes: '',
  contactFax: '',
  desiredOutcomes: [] as string[],
  liveBetaOptIn: null as boolean | null,
  feedbackOptIn: false,
  privacyAcknowledged: false,
};
export function WaitlistForm() {
  const [values, setValues] = useState(initial);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useRef<HTMLFormElement>(null);
  const status = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    type Context = {
      registerTool: (
        tool: {
          name: string;
          description: string;
          inputSchema: object;
          annotations: object;
          execute: (input: unknown) => unknown;
        },
        options: { signal: AbortSignal },
      ) => void | Promise<void>;
    };
    const context = (document as Document & { modelContext?: Context })
      .modelContext;
    if (!context) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(
        context.registerTool(
          {
            name: 'stage_nat_application',
            description:
              'Fill the first step of the Nat application for review. Does not submit, grant consent, or contact anyone.',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                websiteUrl: { type: 'string' },
                companyName: { type: 'string' },
              },
              required: ['name', 'email', 'websiteUrl'],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: false },
            execute(input) {
              const result = validateApplication(input, true);
              if (!result.data) return { ok: false, errors: result.errors };
              const { name, email, websiteUrl, companyName } = result.data;
              setValues((v) => ({
                ...v,
                name,
                email,
                websiteUrl,
                companyName,
              }));
              setStep(1);
              setErrors({});
              document
                .getElementById('early-access')
                ?.scrollIntoView({ behavior: 'instant' });
              return {
                ok: true,
                status: 'staged_for_review',
                submitted: false,
              };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {
      /* Browsers without a working registry retain the normal form. */
    }
    return () => lifecycle.abort();
  }, []);
  useEffect(() => {
    const node = form.current;
    const start = () =>
      track('waitlist_started', {
        source_cta: document.documentElement.dataset.lastCta || 'direct',
      });
    node?.addEventListener('focusin', start, { once: true });
    return () => node?.removeEventListener('focusin', start);
  }, []);
  useEffect(() => {
    if (success) status.current?.focus();
  }, [success]);
  useEffect(() => {
    if (step === 2) heading.current?.focus();
  }, [step]);
  function set<K extends keyof typeof initial>(
    key: K,
    value: (typeof initial)[K],
  ) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
  }
  function fail(fields: Record<string, string>) {
    setErrors(fields);
    requestAnimationFrame(() =>
      form.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus(),
    );
  }
  function next(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateApplication(values, true);
    if (Object.keys(result.errors).length) {
      fail(result.errors);
      return;
    }
    setErrors({});
    setStep(2);
    track('waitlist_step_completed', { validation_errors_count: 0 });
  }
  async function send(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const result = validateApplication(values);
    if (!result.data) {
      fail(result.errors);
      return;
    }
    setBusy(true);
    try {
      const params = new URLSearchParams(location.search);
      const utm = Object.fromEntries(
        ['source', 'medium', 'campaign', 'content', 'term'].map((k) => [
          k,
          params.get('utm_' + k)?.slice(0, 150) || '',
        ]),
      );
      let referrer = '';
      try {
        referrer = document.referrer ? new URL(document.referrer).origin : '';
      } catch {
        /* Ignore malformed referrers. */
      }
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result.data,
          contactFax: values.contactFax,
          utm,
          referrer,
          landingPath: location.pathname,
        }),
        signal: AbortSignal.timeout(25000),
      });
      const body = (await response.json()) as {
        ok?: boolean;
        errors?: Record<string, string>;
        message?: string;
        error?: string;
      };
      if (!response.ok || !body.ok) {
        if (body.errors) fail(body.errors);
        throw Object.assign(
          new Error(
            body.message ||
              'We couldn’t send that. Your answers are still here. Try again.',
          ),
          { errorClass: body.error || 'submission_failed' },
        );
      }
      setSuccess(true);
      track('waitlist_submitted', { status: 'submitted' });
    } catch (err) {
      setError(
        err instanceof Error &&
          err.name !== 'TimeoutError' &&
          err.name !== 'TypeError'
          ? err.message
          : 'We couldn’t send that. Your answers are still here. Try again.',
      );
      track('waitlist_error', {
        error_class:
          err && typeof err === 'object' && 'errorClass' in err
            ? String(err.errorClass)
            : 'network_error',
      });
    } finally {
      setBusy(false);
    }
  }
  function field(
    key: 'name' | 'email' | 'companyName' | 'websiteUrl' | 'notes',
    label: string,
    placeholder: string,
    type = 'text',
  ) {
    return (
      <div className="field" key={key}>
        <label htmlFor={key}>{label}</label>
        {key === 'notes' ? (
          <textarea
            id={key}
            value={values[key]}
            onChange={(e) => set(key, e.target.value)}
            maxLength={1000}
            rows={3}
            aria-invalid={!!errors[key]}
            aria-describedby={errors[key] ? `${key}-error` : undefined}
          />
        ) : (
          <input
            id={key}
            name={key}
            type={type}
            value={values[key]}
            onChange={(e) => set(key, e.target.value)}
            placeholder={placeholder}
            maxLength={
              key === 'websiteUrl'
                ? 2048
                : key === 'email'
                  ? 254
                  : key === 'companyName'
                    ? 150
                    : 100
            }
            autoComplete={
              key === 'name'
                ? 'name'
                : key === 'email'
                  ? 'email'
                  : key === 'companyName'
                    ? 'organization'
                    : 'url'
            }
            aria-invalid={!!errors[key]}
            aria-describedby={errors[key] ? `${key}-error` : undefined}
            required={key !== 'companyName'}
          />
        )}
        <FieldError field={key} errors={errors} />
      </div>
    );
  }
  function select(
    key: 'role' | 'industry' | 'currentStack' | 'trafficBand',
    label: string,
    options: string[],
  ) {
    return (
      <div className="field">
        <label id={`${key}-label`} htmlFor={key}>
          {label}
        </label>
        <Select
          value={values[key] || null}
          onValueChange={(v) => set(key, v || '')}
        >
          <SelectTrigger
            id={key}
            className="form-select"
            aria-labelledby={`${key}-label`}
          >
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem className="select-option" value={o} key={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  if (success)
    return (
      <div ref={status} tabIndex={-1} className="form-shell">
        <div className="success">
          <Check size={28} />
          <h3>You’re on the Nat early-access list.</h3>
          <p>
            We’ll review your website and use case. If you’re a fit for the
            first beta cohort, we’ll contact you with next steps. Thanks for
            helping us build Nat on real businesses.
          </p>
          <p className="form-trust">
            Already applied? Your place is safe. Repeat applications do not
            create extra entries.
          </p>
        </div>
      </div>
    );
  return (
    <form
      ref={form}
      className="form-shell"
      noValidate
      onSubmit={step === 1 ? next : send}
    >
      <p className="eyebrow">
        0{step} / 02 · {step === 1 ? 'YOUR DETAILS' : 'BETA FIT'}
      </p>
      <h3 ref={heading} tabIndex={-1}>
        {step === 1
          ? 'Your website’s next chapter.'
          : 'What should Nat handle?'}
      </h3>
      <p className="form-intro">
        {step === 1
          ? 'Tell us a little about you and your website.'
          : 'Help us understand where Nat could be useful.'}
      </p>
      <div className="form-progress" aria-label={`Step ${step} of 2`}>
        <span className="active" />
        <span className={step === 2 ? 'active' : ''} />
      </div>
      <div hidden={step !== 1}>
        {field('name', 'Your name *', 'Alex Morgan')}
        {field('email', 'Email address *', 'alex@company.com', 'email')}
        {field('companyName', 'Company / project', 'Your business name')}
        {field('websiteUrl', 'Website URL *', 'yourwebsite.com')}
      </div>
      <div hidden={step !== 2}>
        <div className="form-grid">
          {select('role', 'Your role', [
            'Founder',
            'Product',
            'Engineering',
            'Support',
            'Sales/Marketing',
            'Operations',
            'Other',
          ])}
          {select('industry', 'Industry', [
            'SaaS',
            'Agency/Services',
            'E-commerce',
            'Professional Services',
            'Education',
            'Creator/Media',
            'Energy/Industrial',
            'Other',
          ])}
        </div>
        <fieldset
          className="outcomes"
          aria-describedby={
            errors.desiredOutcomes ? 'desiredOutcomes-error' : undefined
          }
        >
          <legend className="field-label">What should Nat help with? *</legend>
          <div className="checks">
            {Object.entries(outcomes).map(([key, label], i) => (
              <label className="check-label" key={key}>
                <Checkbox
                  aria-invalid={i === 0 && !!errors.desiredOutcomes}
                  checked={values.desiredOutcomes.includes(key)}
                  onCheckedChange={(checked) =>
                    set(
                      'desiredOutcomes',
                      checked
                        ? [...values.desiredOutcomes, key]
                        : values.desiredOutcomes.filter((v) => v !== key),
                    )
                  }
                />
                {label}
              </label>
            ))}
          </div>
          <FieldError field="desiredOutcomes" errors={errors} />
        </fieldset>
        <div className="form-grid">
          {select('currentStack', 'Current contact method', [
            'Contact form',
            'Email only',
            'WhatsApp',
            'Intercom',
            'Zendesk',
            'Chatbot',
            'None',
            'Other',
          ])}
          {select('trafficBand', 'Monthly website visits', [
            '<1k',
            '1k–10k',
            '10k–50k',
            '50k–250k',
            '250k+',
            'Unknown',
          ])}
        </div>
        <div className="field">
          <label htmlFor="liveBetaOptIn">
            Willing to install on a live or staging website? *
          </label>
          <Select
            value={
              values.liveBetaOptIn === null
                ? null
                : String(values.liveBetaOptIn)
            }
            onValueChange={(v) =>
              set('liveBetaOptIn', v === null ? null : v === 'true')
            }
          >
            <SelectTrigger
              id="liveBetaOptIn"
              className="form-select"
              aria-invalid={!!errors.liveBetaOptIn}
              aria-describedby={
                errors.liveBetaOptIn ? 'liveBetaOptIn-error' : undefined
              }
            >
              <SelectValue placeholder="Choose yes or no" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="select-option" value="true">
                Yes, I’m willing
              </SelectItem>
              <SelectItem className="select-option" value="false">
                Not yet
              </SelectItem>
            </SelectContent>
          </Select>
          <FieldError field="liveBetaOptIn" errors={errors} />
        </div>
        {field('notes', 'Anything we should know?', '')}
        <div className="consent-group">
          <label className="check-label" htmlFor="feedbackOptIn">
            <Checkbox
              id="feedbackOptIn"
              checked={values.feedbackOptIn}
              onCheckedChange={(v) => set('feedbackOptIn', v)}
            />
            I’m happy to share feedback or join a short interview.
          </label>
          <label className="check-label" htmlFor="privacyAcknowledged">
            <Checkbox
              id="privacyAcknowledged"
              checked={values.privacyAcknowledged}
              onCheckedChange={(v) => set('privacyAcknowledged', v)}
              aria-invalid={!!errors.privacyAcknowledged}
              aria-describedby={
                errors.privacyAcknowledged
                  ? 'privacyAcknowledged-error'
                  : undefined
              }
            />
            <span>
              I acknowledge the{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                privacy notice
              </a>
              . *
            </span>
          </label>
          <FieldError field="privacyAcknowledged" errors={errors} />
        </div>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contactFax">Leave this empty</label>
        <input
          id="contactFax"
          value={values.contactFax}
          onChange={(e) => set('contactFax', e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="form-actions">
        {step === 2 && (
          <button
            className="back-button"
            type="button"
            onClick={() => {
              setStep(1);
              setError('');
              requestAnimationFrame(() =>
                form.current?.querySelector<HTMLInputElement>('#name')?.focus(),
              );
            }}
            disabled={busy}
          >
            Back
          </button>
        )}
        <button className="button" type="submit" disabled={busy}>
          {busy
            ? 'Sending your application…'
            : step === 1
              ? 'Continue'
              : 'Join Early Access'}
          <ArrowRight size={16} />
        </button>
      </div>
      <p className="form-trust">
        No spam. We’ll use your application to evaluate beta fit and contact you
        about Nat early access.
      </p>
      <noscript>
        <p>JavaScript is required to send this application.</p>
      </noscript>
    </form>
  );
}
function FieldError({
  field,
  errors,
}: {
  field: string;
  errors: Record<string, string>;
}) {
  return errors[field] ? (
    <p className="field-error" id={`${field}-error`}>
      {errors[field]}
    </p>
  ) : null;
}
