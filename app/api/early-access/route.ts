import { submitApplication } from '@/lib/submission';
export async function POST(request: Request) {
  return submitApplication(request, {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    WAITLIST_RATE_LIMIT_SECRET: process.env.WAITLIST_RATE_LIMIT_SECRET,
    VERCEL: process.env.VERCEL,
  });
}
