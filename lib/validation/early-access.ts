export const outcomes = {
  answer_faqs: 'Answer FAQs',
  guide_visitors: 'Guide visitors',
  capture_leads: 'Capture leads',
  route_support: 'Route support',
  route_sales: 'Route sales',
  reduce_contact_friction: 'Reduce contact-form friction',
  future_brief_voice: 'Future briefing / voice',
  other: 'Other',
} as const;
export type Application = {
  name: string;
  email: string;
  websiteUrl: string;
  websiteDomain: string;
  companyName: string;
  role: string;
  industry: string;
  desiredOutcomes: string[];
  currentStack: string;
  trafficBand: string;
  liveBetaOptIn: boolean;
  feedbackOptIn: boolean;
  privacyAcknowledged: true;
  notes: string;
  utm: Record<string, string>;
  referrer: string;
  landingPath: string;
};
export function normalizeWebsite(value: string) {
  const url = new URL(
    /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`,
  );
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    !url.hostname.includes('.') ||
    url.hostname === 'localhost' ||
    url.hostname.endsWith('.local') ||
    /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)
  )
    throw Error('Enter a public business website, such as example.com.');
  url.hash = '';
  url.search = '';
  return {
    websiteUrl: url.toString(),
    websiteDomain: url.hostname
      .toLowerCase()
      .replace(/^www\./, '')
      .replace(/\.$/, ''),
  };
}
export function validateApplication(
  input: unknown,
  stepOne = false,
): { data?: Application; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const raw =
    input && typeof input === 'object' && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  function text(key: string, max: number, required = false) {
    const v = typeof raw[key] === 'string' ? (raw[key] as string).trim() : '';
    if (required && !v) errors[key] = 'This field is required.';
    if (v.length > max) errors[key] = `Use ${max} characters or fewer.`;
    return v;
  }
  const name = text('name', 100, true);
  if (name.length < 2) errors.name = 'Enter at least 2 characters.';
  const email = text('email', 254, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Enter a valid email address.';
  const website = text('websiteUrl', 2048, true);
  let normalized = { websiteUrl: website, websiteDomain: '' };
  try {
    normalized = normalizeWebsite(website);
  } catch {
    errors.websiteUrl = 'Enter a public business website, such as example.com.';
  }
  const desiredOutcomes = Array.isArray(raw.desiredOutcomes)
    ? [
        ...new Set(
          raw.desiredOutcomes.filter((x): x is string => typeof x === 'string'),
        ),
      ]
    : [];
  if (
    !stepOne &&
    (!desiredOutcomes.length ||
      desiredOutcomes.some((x) => !Object.hasOwn(outcomes, x)) ||
      desiredOutcomes.length > 8)
  )
    errors.desiredOutcomes = 'Choose at least one of the available outcomes.';
  if (!stepOne && typeof raw.liveBetaOptIn !== 'boolean')
    errors.liveBetaOptIn = 'Choose yes or no.';
  if (!stepOne && raw.privacyAcknowledged !== true)
    errors.privacyAcknowledged = 'Please acknowledge the privacy notice.';
  if (raw.feedbackOptIn !== undefined && typeof raw.feedbackOptIn !== 'boolean')
    errors.feedbackOptIn = 'Choose a valid feedback preference.';
  const utm: Record<string, string> = {};
  if (raw.utm && typeof raw.utm === 'object') {
    for (const key of ['source', 'medium', 'campaign', 'content', 'term']) {
      const v = (raw.utm as Record<string, unknown>)[key];
      if (typeof v === 'string') utm[key] = v.slice(0, 150);
    }
  }
  const data: Application = {
    name,
    email,
    ...normalized,
    companyName: text('companyName', 150),
    role: text('role', 100),
    industry: text('industry', 100),
    desiredOutcomes,
    currentStack: text('currentStack', 150),
    trafficBand: text('trafficBand', 50),
    liveBetaOptIn: raw.liveBetaOptIn === true,
    feedbackOptIn: raw.feedbackOptIn === true,
    privacyAcknowledged: true,
    notes: text('notes', 1000),
    utm,
    referrer: text('referrer', 300),
    landingPath: text('landingPath', 200),
  };
  return Object.keys(errors).length ? { errors } : { data, errors };
}
