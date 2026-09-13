# WealthPulse: Personal Financial Goal Planner & Guilt-Free Budgeting

A lightweight, habit-friendly financial goal planning web application built around a **"Pay Yourself First + Guilt-Free Living"** philosophy. 

Built with **React 18**, **TypeScript**, **Tailwind CSS**, and an offline-capable **Local-First** storage engine with optional **AWS Cognito + S3 Direct-Sync**.

---

## Key Features

1. **The 9th-of-the-Month Cycle Engine:**
   - Automatically tracks your financial cycle from the **9th of each month to the 8th of the next month**.
   - Live cycle pulse: *"Day X of 30"* with automatic rollover alerts.

2. **The Monthly Cockpit:**
   - **Safe-to-Spend Balance:** Tells you exactly how much you can spend on dinners, coffees, and fun with **zero guilt** because bills and goals are already funded.
   - **Live Month Savings Rate:** Real-time percentage of income successfully saved.
   - **Needs Shield:** Monitors your essential baseline (Rent, Electricity, Gym, Groceries, Travel).

3. **"Can I Afford This?" Purchase Evaluator (Impulse Shield):**
   - Enter an item and price before you tap to pay (e.g. ₹1,500).
   - Instantly shows:
     - Impact on your safe-to-spend buffer.
     - Drop in your monthly savings rate.
     - Exact days delayed on your top milestone goal.
     - Psychological verdict: 🟢 100% Guilt-Free / 🟡 Buffer tight / 🔴 Dips into goals.
   - One-tap button to log as a leisure spend if you decide to buy it.

4. **Extra Cash & Windfall Splitter:**
   - Capture pocket money, gifts, bonuses, and freelance income.
   - Direct interactive percentage sliders to allocate windfalls immediately into your goals.

5. **Month-End Lock-in Ceremony:**
   - At cycle end, review your monthly scorecard (Earned vs Spent vs Saved).
   - Tap to lock accumulated savings permanently into your lifetime goal balances.
   - Monthly counters reset to ₹0 for a fresh cycle.

6. **Dual Goal Horizons:**
   - **Target Purchases:** Gadgets, Dream Car, Plot/Land Investment with calculated completion pace.
   - **5–6 Year Net Worth Cushion:** Long-term wealth target.

7. **Zero-Cost Local-First & AWS Cloud Sync:**
   - Runs **100% locally** out of the box with zero setup.
   - Includes full JSON Export/Import and Quick Sync Strings between devices.
   - Optional AWS Direct-to-S3 Sync with Cognito User & Identity Pools ($0 serverless).

---

## Quick Start (Local Run)

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## AWS Cloud Sync Setup (Learn AWS Step-by-Step)

If you'd like to sync data seamlessly between your PC and phone without running a traditional backend:
1. Follow the comprehensive guide in [`docs/aws-architecture-guide.md`](./docs/aws-architecture-guide.md).
2. It walks you through every AWS CLI command:
   - Creating an S3 bucket with browser CORS
   - Creating a Cognito User Pool & App Client
   - Creating a Cognito Identity Pool
   - Creating an IAM Role scoped with `${cognito-identity.amazonaws.com:sub}`
3. Add the generated IDs to `.env`:
   ```env
   VITE_AWS_REGION=ap-south-1
   VITE_AWS_USER_POOL_ID=ap-south-1_xxxxxx
   VITE_AWS_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
   VITE_AWS_IDENTITY_POOL_ID=ap-south-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   VITE_AWS_S3_BUCKET_NAME=your-unique-vault-name
   ```
4. The app will automatically detect AWS configuration and enable direct cloud sync!
