# V0 Build Prompt: AstroAI.ro Premium Transformation

## Mission
Transform AstroAI.ro into a **competitor to professional astrologers** (like Alexandra Belova, Instagram astrology accounts) by delivering professional-grade 5000-8000 word personalized natal reports + real-time AI consultation in minutes instead of weeks, at 1/10 the cost.

## Current State (Phases 1-6 Complete)
- ✅ Natal chart generation from AstrologyAPI
- ✅ 5000+ word Claude AI interpretations in Romanian
- ✅ Interactive visualizations (natal wheel, chart strength, aspects)
- ✅ Real-time AI astrologer chat
- ✅ Dashboard with daily horoscope & cosmic summary
- ✅ Guest reports (shareables) + authenticated reports

## Immediate Build Phases (Next 30 Days)

### PHASE 7: Premium Report Offerings
**Goal:** Enable 4 distinct report tiers with different content + pricing

**What to build:**
1. **Transit Forecast Engine** (`/api/astrology/transits`)
   - Calculate current planetary transits
   - Compare with natal chart
   - Identify activation periods (opportunities & challenges)
   - Generate 12-month timeline with exact dates
   - Store in Supabase table: `transit_forecasts`
   - Output: 2000-word transit analysis with dates

2. **Synastry Analyzer** (`/api/astrology/synastry`)
   - Accept second person's birth data (partner/friend/date)
   - Compare two charts overlay
   - Generate compatibility analysis (romantic, friendship, business)
   - Identify harmonies & tensions
   - Store comparisons in `synastry_reports` table
   - Output: 2000-word synastry report

3. **Solar Return Interpreter** (`/api/astrology/solar-return`)
   - Calculate exact solar return chart
   - Interpret themes for the year ahead
   - Identify key life areas & timing
   - Store in `solar_return_reports`
   - Output: 1500-word solar return interpretation

4. **Report Selector Page** (`/app/reports/create`)
   - UI to select report type (natal, transit, synastry, solar return)
   - Collect additional data (partner birth info if synastry)
   - Show pricing & what's included
   - Trigger appropriate API endpoint
   - Display results in branded format

**Database Schema Additions:**
```sql
CREATE TABLE transit_forecasts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  natal_chart_id UUID REFERENCES natal_charts,
  current_transits JSONB, -- All active transits
  timeline JSONB, -- Month-by-month breakdown
  interpretation TEXT, -- Claude-generated analysis
  generated_at TIMESTAMP,
  expires_at TIMESTAMP -- Recalculate monthly
);

CREATE TABLE synastry_reports (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  natal_chart_1_id UUID REFERENCES natal_charts,
  natal_chart_2_id UUID REFERENCES natal_charts,
  comparison_data JSONB, -- Overlay analysis
  interpretation TEXT, -- Claude-generated compatibility
  report_type VARCHAR (romantic/friendship/business),
  generated_at TIMESTAMP
);

CREATE TABLE solar_return_reports (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  natal_chart_id UUID REFERENCES natal_charts,
  solar_return_year INT,
  solar_return_chart JSONB,
  interpretation TEXT,
  generated_at TIMESTAMP
);
```

### PHASE 8: Subscription & Payment Integration
**Goal:** Implement Tier 1-4 pricing model with Stripe

**What to build:**
1. **Stripe Integration** (`/app/api/payments/*`)
   - One-time purchase: €29 (instant report)
   - Monthly subscription: €9.99 (AI astrologer)
   - Premium bundle: €79 (report bundle)
   - Annual premium: €99 (everything)

2. **Subscription Management** (`/app/subscription`)
   - Show current subscription status
   - Manage billing methods
   - Cancel/upgrade options
   - Usage metrics (reports generated, chats used)

3. **Paywall Logic** (in all report pages)
   - Free: 1 natal report only
   - Tier 1 (€29): Unlimited natal reports
   - Tier 2 (€9.99/mo): Chat + memory
   - Tier 3 (€79): Natal + transit + synastry + solar return
   - Tier 4 (€99/yr): All + priority support

4. **Webhook Handlers** (`/app/api/webhooks/stripe`)
   - Track subscription events
   - Update user tier in database
   - Send confirmation emails

### PHASE 9: Enhanced Dashboard & User Features
**Goal:** Make dashboard the central hub for reports, subscriptions, saved charts

**What to build:**
1. **Report History** (`/app/dashboard/reports`)
   - All user's reports (natal, transit, synastry, solar return)
   - Date generated, type, one-click download
   - Star/bookmark favorites
   - Quick comparison between old vs new

2. **Saved Contacts** (`/app/dashboard/contacts`)
   - Save family/friends/dates of interest
   - Quick synastry checks
   - Generate compatibility scores
   - Social sharing (referral hooks)

3. **Subscription Widget** (`/app/dashboard/subscription`)
   - Current tier & benefits displayed
   - Upgrade paths with pricing
   - Next billing date
   - Usage metrics (5/100 chat messages used, etc.)

4. **Personal Chart Library**
   - Option to save multiple birth data (birth chart, business date, important events)
   - Quick-switch between contexts
   - Separate reports for each

### PHASE 10: Marketing & Growth Pages
**Goal:** Build conversion funnels (free → paid)

**What to build:**
1. **Landing Page** (`/app/landing`)
   - Value proposition: "€300 consultation in 30 seconds"
   - Social proof: # of reports generated, testimonials
   - Pricing comparison table vs astrologers
   - CTA: "Get Your Report Free" → one free natal report

2. **Daily Horoscope Signup** (`/app/horoscope`)
   - Free horoscope by Sun sign (generate daily)
   - Email capture: "Get daily horoscope + astrology tips"
   - Drip campaign: Day 1 = free horoscope, Day 3 = free report offer, Day 7 = €29 report discount

3. **Blog/Resources** (`/app/blog`)
   - "What is a natal chart" (SEO target)
   - "Synastry explained" (SEO target)
   - "Best time to start business" (transit predictions)
   - Each article → CTA to relevant report

4. **Testimonials Page** (`/app/testimonials`)
   - Real user quotes (with permission)
   - Before/after transformation stories
   - Video testimonials embedded

### PHASE 11: Mobile Optimization & Performance
**Goal:** Ensure smooth experience on all devices

**What to build:**
1. **Mobile-First Redesign**
   - Report pages responsive to mobile
   - Chat interface optimized for thumb interaction
   - Smaller natal wheel (fits mobile screen)
   - Touch-friendly buttons

2. **Progressive Web App (PWA)**
   - Offline report viewing
   - Install as mobile app
   - Push notifications (daily horoscope, transit alerts)

3. **Performance Optimization**
   - Image compression
   - Code splitting (lazy load components)
   - Caching strategy (reports cache for 30 days)
   - CDN for static assets

### PHASE 12: Community & Social Features
**Goal:** Drive virality & word-of-mouth

**What to build:**
1. **Share Reports** (Social media integration)
   - Generate shareable link for each report
   - Preview card (og:image, og:title)
   - Referral bonus: Share → friend gets €10 credit
   - TikTok-ready snippets (short insights from report)

2. **Trending Compatibilities**
   - Leaderboard: "Most compatible couples"
   - Viral moment: Celebrity synastry reads
   - User-generated synastry challenges

3. **Community Chat**
   - Users discuss their charts
   - "Drop your big three" threads
   - Astrology discussion moderated

---

## Implementation Commands for V0

### Phase 7: Transit/Synastry/Solar Return APIs
```bash
# After implementing Phase 7 in code:
v0 build phase-7-advanced-reports

# Outputs:
# - /api/astrology/transits/route.ts
# - /api/astrology/synastry/route.ts
# - /api/astrology/solar-return/route.ts
# - /app/reports/create/page.tsx
# - 3 new Supabase migrations
```

### Phase 8: Stripe Integration
```bash
v0 build phase-8-stripe-payments

# Outputs:
# - /app/api/payments/create-checkout/route.ts
# - /app/api/webhooks/stripe/route.ts
# - /app/subscription/page.tsx
# - Supabase user_subscriptions table
# - Environment variables: STRIPE_SECRET_KEY, STRIPE_PUBLIC_KEY
```

### Phase 9: Dashboard Enhancements
```bash
v0 build phase-9-dashboard-hub

# Outputs:
# - /app/dashboard/reports/page.tsx
# - /app/dashboard/contacts/page.tsx
# - /app/dashboard/subscription/page.tsx
# - New Supabase tables: saved_contacts, report_history
```

---

## Priority Implementation Order

**Week 1-2:** Phase 7 (Transit + Synastry APIs)
- Deliverable: /api/astrology endpoints functional
- Test: Generate transit forecast for any natal chart

**Week 2-3:** Phase 8 (Stripe)
- Deliverable: Purchase flow working
- Test: Buy €29 report, verify Supabase update

**Week 3-4:** Phase 9 + Phase 10 (Dashboard + Landing)
- Deliverable: User can see all reports, landing page converting
- Test: Funnel from free horoscope → €29 purchase

**Week 4:** Phase 11 (Mobile + Performance)
- Deliverable: Works on mobile, fast load times
- Test: Lighthouse score 90+

**Week 5+:** Phase 12 (Community & Virality)
- Deliverable: Social sharing, referrals, leaderboards

---

## Success Metrics by Phase

**Phase 7:**
- ✅ Transit API returns 12-month timeline with dates
- ✅ Synastry returns compatibility score + interpretation
- ✅ Solar Return interprets year-ahead themes

**Phase 8:**
- ✅ First paid conversion (€29 sale)
- ✅ Stripe webhook confirms payment
- ✅ User tier updates in database

**Phase 9:**
- ✅ Dashboard shows all user reports
- ✅ Subscription widget displays correctly
- ✅ Users can save contacts & generate synastry

**Phase 10:**
- ✅ Landing page converts 3%+ (industry avg: 2%)
- ✅ Daily horoscope email has 20%+ open rate
- ✅ Blog posts ranking for keywords

**Phase 11:**
- ✅ Mobile Lighthouse score 85+
- ✅ Report load time < 2 seconds
- ✅ PWA installable

**Phase 12:**
- ✅ 10% of new users referred
- ✅ Viral moment (1000+ shares/day)
- ✅ Community 500+ active members

---

## Technical Notes

- Use **AstrologyAPI transits endpoint** for real planetary movement data
- **Claude streaming** for report generation to show progress
- **Caching strategy:** Cache transit forecasts for 30 days (they change slowly)
- **PDF generation:** Use libraries like `html2pdf.js` for reports
- **Email:** SendGrid or Resend for transactional + marketing emails
- **Analytics:** Plausible or Mixpanel to track conversion funnel

---

## Go-to-Market Timeline

- **Week 2:** Soft launch (Phase 7 complete)
  - Announce to existing users: "New transit forecasts available!"
  - Generate beta feedback
  - Fix bugs

- **Week 3:** Payment launch (Phase 8 complete)
  - Limited-time offer: €19 introductory price
  - Email campaign to waitlist
  - Track conversion rate

- **Week 4:** Dashboard launch (Phase 9 complete)
  - Emphasize report history & bookmarking
  - Invite friends feature

- **Week 5:** Full marketing (Phase 10 complete)
  - SEO optimization
  - TikTok content series
  - Influencer partnerships
  - Reddit organic community

- **Month 2:** Scale & optimize
  - Paid ads (Google, Instagram)
  - Affiliate partnerships with tarot readers
  - Wholesale/white-label model

---

## Revenue Projection (Realistic, Conservative)

| Month | Users | Conv Rate | Avg Revenue/User | Total Revenue |
|-------|-------|-----------|------------------|---------------|
| M1 (Launch) | 500 | 2% | €39 | €390 |
| M2 | 2,000 | 3% | €49 | €2,940 |
| M3 | 5,000 | 4% | €59 | €11,800 |
| M4 | 10,000 | 5% | €69 | €34,500 |
| M5 | 20,000 | 6% | €79 | €95,400 |
| M6 | 40,000 | 7% | €89 | €249,200 |
| M12 | 150,000 | 8% | €99 | €118,800/month |

**Year 1 Revenue Projection: €200,000 - €300,000** (conservative)
**Year 2 Revenue Projection: €800,000 - €1,200,000** (if scaling continues)

---

## Competitive Moat

1. **Speed:** Instant reports vs. weeks-long waiting lists
2. **Price:** €29-99 vs. €150-300/hour consultations
3. **Availability:** 24/7 AI vs. 9-5 astrologers
4. **Language:** Native Romanian (local advantage)
5. **Technology:** API-driven scalability vs. manual work
6. **Personalization:** Deep chart analysis (Claude) + AstrologyAPI precision
7. **Community:** Network effects (synastry matches, referrals)

---

## Risk Mitigation

- **AI accuracy concerns:** Display disclaimer, encourage follow-up consultations with humans
- **Payment processing:** Use Stripe (PCI compliant), never store card data
- **User data privacy:** Clear GDPR compliance, encrypt birth data
- **Market saturation:** Differentiate on quality & Romanian market focus
- **Churn:** Monthly email with new insights, seasonal reports, referral bonuses

---

**Status:** Ready for V0 to implement Phases 7-12 in sequence
**Timeline:** 5-6 weeks to full product launch
**Next Step:** Approve roadmap, begin Phase 7 implementation
