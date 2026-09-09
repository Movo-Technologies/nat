type Events = {
  page_view: { device: 'mobile' | 'tablet' | 'desktop' };
  cta_clicked: { placement: string };
  demo_started: { mode: 'auto' | 'manual' };
  demo_completed: { loop_number: number };
  demo_prompt_clicked: { prompt_id: string };
  section_viewed: { section_id: string };
  waitlist_started: { source_cta: string };
  waitlist_step_completed: { validation_errors_count: number };
  waitlist_submitted: { status: 'submitted' };
  waitlist_error: { error_class: string };
  faq_opened: { faq_id: number };
  developer_copy_clicked: { snippet_id: string };
};
// No network collector or cookies by default. A reviewed, consent-aware adapter can subscribe later.
export function track<K extends keyof Events>(name: K, properties: Events[K]) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('nat:analytics', { detail: { name, properties } }),
  );
}
