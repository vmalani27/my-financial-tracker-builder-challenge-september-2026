# AWS Architecture Guide: Direct-to-S3 Sync with Cognito Scoped Policies

This guide provides a step-by-step walkthrough of building a serverless, zero-maintenance, zero-database architecture for your Financial Goal Planner app.

---

## 1. Why This Architecture?

Traditional web apps require:
`Browser` ➔ `API Gateway` ➔ `AWS Lambda` ➔ `DynamoDB Database`

While powerful, this setup incurs API Gateway costs, cold starts, and complex backend code.

### The Direct-to-S3 Pattern:
`Browser` ➔ `Cognito (Auth)` ➔ `Direct S3 Put/Get (Storage)`

```
┌─────────────────┐       1. Sign In (Email/Pass)       ┌────────────────────────┐
│                 ├────────────────────────────────────►│   Cognito User Pool    │
│                 │                                     └──────────┬─────────────┘
│                 │       2. Exchange Token for STS                │
│                 ├────────────────────────────────────►┌──────────▼─────────────┐
│   Web Browser   │                                     │ Cognito Identity Pool  │
│  (Phone / PC)   │       3. Returns Temporary AWS Keys │ (Issues IAM Role)      │
│                 │◄────────────────────────────────────┴────────────────────────┘
│                 │
│                 │       4. Direct s3:PutObject / s3:GetObject
│                 ├──────────────────────────────────────────────────────────────┐
└─────────────────┘                                                              ▼
                                                        ┌─────────────────────────────────┐
                                                        │         Amazon S3 Bucket        │
                                                        │ /users/{cognito-sub}/data.json  │
                                                        └─────────────────────────────────┘
```

### Why it's virtually $0:
- **Cognito User Pools:** **50,000 Monthly Active Users are permanently free** (forever, not just 12-month trial).
- **Cognito Identity Pools:** **Free** federated identity service.
- **S3 Storage:** A 10 KB file costs **$0.0000002 / month**.
- **S3 Requests:** 100 syncs per month costs **$0.0005**.
- Total monthly bill: **<$0.01**.

---

## 2. Prerequisites

1. Install the AWS CLI on your machine: [AWS CLI Official Guide](https://aws.amazon.com/cli/)
2. Run configuration:
   ```bash
   aws configure
   ```
   Provide your AWS Access Key, Secret Key, and default region (e.g., `ap-south-1` for Mumbai, or `us-east-1`).

---

## 3. Step-by-Step AWS CLI Setup

### Step 1: Create the S3 Bucket & Enable CORS

#### Why:
S3 stores files (objects). By default, browsers block web apps from sending requests directly to an S3 bucket due to **CORS** (Cross-Origin Resource Sharing). We need to explicitly allow `PUT` and `GET` from our web app.

#### 1.1 Create the Bucket:
> Replace `your-unique-vault-name` with a globally unique name (e.g., `vansh-finance-vault-2026`).

```bash
aws s3api create-bucket \
    --bucket your-unique-vault-name \
    --region ap-south-1 \
    --create-bucket-configuration LocationConstraint=ap-south-1
```

*(Note: If using `us-east-1`, omit `--create-bucket-configuration`).*

#### 1.2 Enable CORS:
Create a file named `cors.json`:
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

Apply CORS to your bucket:
```bash
aws s3api put-bucket-cors \
    --bucket your-unique-vault-name \
    --cors-configuration file://cors.json
```

---

### Step 2: Create Cognito User Pool (Authentication)

#### Why:
The User Pool acts as your user database. It securely stores your email and hashed password, and handles session tokens.

```bash
aws cognito-idp create-user-pool \
    --pool-name FinancePlannerUsers \
    --auto-verified-attributes email \
    --username-attributes email \
    --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=false,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" \
    --region ap-south-1
```

**Output to Note:**
Copy the `"Id"` value from the output (e.g., `ap-south-1_aBc123XYZ`). This is your `USER_POOL_ID`.

---

### Step 3: Create Cognito App Client

#### Why:
Your web app needs a public "client ID" to communicate with the User Pool.
**Crucial flag:** `--no-generate-secret`. Web browsers cannot securely hide a secret key, so client secrets must be disabled for browser frontends.

```bash
aws cognito-idp create-user-pool-client \
    --user-pool-id <YOUR_USER_POOL_ID> \
    --client-name WebAppClient \
    --no-generate-secret \
    --explicit-auth-flows "ALLOW_USER_PASSWORD_AUTH" "ALLOW_REFRESH_TOKEN_AUTH" \
    --region ap-south-1
```

**Output to Note:**
Copy the `"ClientId"` value (e.g., `6k1m99...`). This is your `USER_POOL_CLIENT_ID`.

---

### Step 4: Create Cognito Identity Pool (Authorization Bridge)

#### Why:
A User Pool only knows *who you are*. It cannot grant permissions to AWS resources like S3.
An **Identity Pool** takes your User Pool login token and exchanges it for **temporary AWS STS credentials** (Access Key, Secret Key, Session Token) that S3 can recognize.

```bash
aws cognito-identity create-identity-pool \
    --identity-pool-name FinancePlannerIdentityPool \
    --no-allow-unauthenticated-identities \
    --cognito-identity-providers ProviderName=cognito-idp.ap-south-1.amazonaws.com/<YOUR_USER_POOL_ID>,ClientId=<YOUR_USER_POOL_CLIENT_ID> \
    --region ap-south-1
```

**Output to Note:**
Copy the `"IdentityPoolId"` (e.g., `ap-south-1:12345678-aaaa-bbbb-cccc-1234567890ab`).

---

### Step 5: Create IAM Role with User-Scoped S3 Policy

#### Why:
This is the heart of AWS security for multi-device sync.
We want to allow the logged-in user to write to S3, but **strictly inside their own folder**.
AWS IAM provides a built-in variable: `${cognito-identity.amazonaws.com:sub}`.
When you log in, AWS automatically replaces `${cognito-identity.amazonaws.com:sub}` with your unique Identity ID.

#### 5.1 Create Trust Policy (`trust-policy.json`):
This tells AWS: "Allow Cognito Identity Pool to assume this role for authenticated users."

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "cognito-identity.amazonaws.com:aud": "<YOUR_IDENTITY_POOL_ID>"
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated"
        }
      }
    }
  ]
}
```

#### 5.2 Create the IAM Role:
```bash
aws iam create-role \
    --role-name FinancePlannerAuthRole \
    --assume-role-policy-document file://trust-policy.json
```

**Output to Note:**
Copy the `"Arn"` of the role (e.g., `arn:aws:iam::123456789012:role/FinancePlannerAuthRole`).

#### 5.3 Create Scoped S3 Policy (`s3-policy.json`):
> Replace `your-unique-vault-name` with your bucket name.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::your-unique-vault-name/users/${cognito-identity.amazonaws.com:sub}/*"
      ]
    }
  ]
}
```

#### 5.4 Attach Policy to the Role:
```bash
aws iam put-role-policy \
    --role-name FinancePlannerAuthRole \
    --policy-name UserScopedS3Access \
    --policy-document file://s3-policy.json
```

#### 5.5 Link Role to the Identity Pool:
```bash
aws cognito-identity set-identity-pool-roles \
    --identity-pool-id <YOUR_IDENTITY_POOL_ID> \
    --roles authenticated=<YOUR_ROLE_ARN> \
    --region ap-south-1
```

---

## 4. Connecting to Your Web App

Once you finish running the commands, open `.env` in the project root and add your generated IDs:

```env
VITE_AWS_REGION=ap-south-1
VITE_AWS_USER_POOL_ID=ap-south-1_xxxxxx
VITE_AWS_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_AWS_IDENTITY_POOL_ID=ap-south-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_AWS_S3_BUCKET_NAME=your-unique-vault-name
```

Save the file and restart the development server (`npm run dev`).
The app will automatically detect AWS configuration, show the **"Cloud Sync Available"** badge in the navbar, and let you sign in to sync across devices!

---

## 5. How to Verify Everything is Working

1. Open your web app and sign up or sign in with your email.
2. Add a goal or log a spend.
3. Open terminal and run:
   ```bash
   aws s3 ls s3://your-unique-vault-name/users/ --recursive
   ```
4. You will see:
   `users/ap-south-1:xxxxxxxx/data.json`
5. Open the app on your phone, log in with the same credentials, and watch your goals load instantly!
