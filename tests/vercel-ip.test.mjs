import {test} from 'node:test';
import assert from 'node:assert/strict';
import {submitApplication} from '../work/tests/submission.mjs';
test('Vercel uses its trusted forwarding header rather than a spoofed Cloudflare IP',async()=>{
  const env={SUPABASE_URL:'https://db.example',SUPABASE_SERVICE_ROLE_KEY:'test',WAITLIST_RATE_LIMIT_SECRET:'test-salt',VERCEL:'1'};
  const hashes=[];
  const mock=async(url,options)=>{if(String(url).endsWith('consume_waitlist_rate_limit')){hashes.push(JSON.parse(options.body).p_key);return Response.json(true)}return Response.json(null)};
  for(const spoof of ['1.1.1.1','2.2.2.2']){
    const r=await submitApplication(new Request('https://nat.example/api/early-access',{method:'POST',headers:{'Content-Type':'application/json','x-forwarded-for':'203.0.113.10','cf-connecting-ip':spoof},body:JSON.stringify({name:'Test Applicant',email:'test@example.com',websiteUrl:'example.com',desiredOutcomes:['capture_leads'],liveBetaOptIn:true,privacyAcknowledged:true})}),env,mock);
    assert.equal(r.status,200);
  }
  assert.equal(hashes[0],hashes[1]);
});
