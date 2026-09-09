import { env } from 'cloudflare:workers';
import { submitApplication, type SubmissionEnv } from '@/lib/submission';
export async function POST(request: Request) {
  return submitApplication(request, env as SubmissionEnv);
}
