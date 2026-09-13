# Pace — Personal Financial Goal Tracker

> Personal finance built around a simple philosophy: achieving your financial goals steadily, **at your own pace**.

**Pace** is a clean, mobile-first financial tracker designed to replace bloated accounting software with intuitive mental models. Built with **React 18**, **Vite**, and **Tailwind CSS**, Pace operates on a **100% local-first architecture** with zero server latency, zero tracking, and complete device privacy.

**Live Application**: [https://d31j9jmdw6glp2.cloudfront.net/](https://d31j9jmdw6glp2.cloudfront.net/)

---

## The Mental Model

Most budgeting apps burden users with double-entry ledgers, complicated tax tags, and guilt-inducing red charts. When opening a personal finance app on your phone, you typically want immediate answers to three fundamental questions:

1. **How much allowance do I have left to spend this cycle?**
2. **How much liquid cash is in hand right now?**
3. **How much am I actually adding to my long-term wealth (Corpus)?**

Pace answers all three in half a second, eliminating nested card bloat in favor of a modern fintech design language (inspired by CRED, Jupiter, and Linear).

---

## Key Features

### 1. Allowance Left to Spend (Glanceable Hero Widget)
- **Unified Monthly Budget**: Enter your take-home income and designate a single spending allowance for the cycle.
- **Hero Pace Display**: Large, crisp tabular figure showing your real-time remaining allowance.
- **Hairline Progress Bar**: Visual progress indicator showing budget consumption percentage.
- **Split Stats**: Integrated bottom strip displaying **Cash in Hand** (operating savings pool) and **Saved to Corpus** (projected month-end addition).

### 2. Configurable Financial Cycle
- **Direct Date Input**: Set your monthly cycle day to match your salary date (e.g., 1st, 9th, 25th) with dynamic ordinal suffixes (`1st`, `9th`, `31st`).
- **Muted Cycle Metadata**: Non-intrusive header tracking `{cycleLabel} • Day X of Y`.

### 3. Recent Activity Feed
- Prioritized at the top of the dashboard for instant daily verification.
- Displays expenses, transfers, and goal deposits with category badges and dates.
- Quick link to the complete **Spends** ledger.

### 4. Focused Goal Tracking
- Visual progress bars showing current savings against targets (e.g., Emergency Fund, Tech Upgrades, Vacation).
- Linked to backing account vaults with one-tap quick deposits.

### 5. Corpus & Account Vaults
- **Minimalist Home Shortcut**: Displays net corpus total and connected account count at the bottom of the home screen, avoiding visual clutter.
- **Dedicated Management Panel**: Manage accounts across Primary (Everyday UPI), Liquid Savings, Investment Portfolio, and Cash/Wallets.
- Standardized row layouts with subtle native badges and a slide-up management sheet for balance updates, setting primary accounts, and deletion.

### 6. Time-Gated "Settle & Lock Month" Routine
- **Contextual Time-Gate**: The month-end prompt surfaces on the Home screen **only during the last 4 days of your active cycle** (e.g., 4th through 8th for an 8th reset).
- **Conversational Checklist**: Warm, human reminders to catch unrecorded expenses before cycle close:
  - *Rent, maintenance, or flatmate shares*
  - *Electricity, water, WiFi, or mobile bills*
  - *Credit card payments or active subscriptions*
  - *Major shopping, dining out, or ATM cash withdrawals*
- **Lock Ceremony**: Banks remaining allowance into your corpus, archives the cycle, and resets counters for a fresh month.
- **Quiet Mode**: For the rest of the month, the action stays tucked away in **Settings $\rightarrow$ Month-End Routine**.

### 7. Tactile Quick Actions (Floating Speed Dial)
- **Pay / Out**: Log expenses categorized by Needs vs. Leisure with optional tags for Self vs. Parents.
- **Can I Afford?**: Instant pre-purchase evaluator showing budget impact and goal delays before tapping to pay.
- **Gift / Extra Cash**: Allocate windfalls and bonuses directly across active goals.
- **Transfer**: Inter-account balance transfers between vaults.

### 8. 100% Local-First Privacy & Backup
- **Zero Tracker / Offline Storage**: Financial data lives exclusively in your device's browser memory.
- **Developer-Focused Utility Panel**: Export portable `.vault` snapshots and restore backups anytime with zero setup.
- **Clean Starter State**: Zero seed/demo data for new users, with safe two-step typing confirmation (`CLEAR`) for resetting records.

---

## Tech Stack & Architecture

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Storage**: Local-First (`localStorage` + `.vault` JSON Snapshot Engine).
- **Hosting & Infrastructure**:
  - **Amazon S3**: Private static website asset storage in `ap-south-1` (Mumbai) with public access blocked.
  - **Amazon CloudFront**: Global CDN with Brotli/Gzip compression, HTTP/2, and Custom Error Responses (SPA 403/404 routing to `/index.html`).
  - **AWS WAF (Web Application Firewall)**: Attached managed Web ACL at CloudFront edge locations protecting against common web exploits.
  - **Origin Access Control (OAC)**: SigV4 authenticated requests between CloudFront and private S3.
  - **GitHub Actions (CI/CD)**: Automated build, sync, and cache invalidation on push to `main`.

---

## Local Development

```bash
# 1. Clone the repository
git clone https://github.com/vanshmalani/Personal_financial_goal.git
cd Personal_financial_goal

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## License

MIT License. Free and open source. Built for personal financial independence.
