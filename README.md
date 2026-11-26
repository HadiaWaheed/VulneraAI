 
<div align="center">

# 🛡️ VulneraAI

### AI-Powered Code Vulnerability Scanner

**Scan code. Understand predictions. Track every review.**

An intelligent code security platform that combines machine learning, AI-powered explanations, and an interactive dashboard to help developers identify potential security weaknesses in source code.

[![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-Flask-3776AB?style=flat-square&logo=python&logoColor=white)](https://flask.palletsprojects.com/)
[![AI](https://img.shields.io/badge/AI-Fine--Tuned%20Model-8B5CF6?style=flat-square)](#machine-learning-model)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Security](https://img.shields.io/badge/Security-Session%20Based-16A34A?style=flat-square)](#authentication--security)

[Features](#features) · [Screenshots](#screenshots) · [Architecture](#architecture) · [Machine Learning](#machine-learning-model) · [Setup](#getting-started) · [API](#api-reference) · [Evaluation](#evaluation--test-results)

</div>

---

## 📌 Overview

**VulneraAI** is an AI-powered code vulnerability scanning platform designed to help developers understand potential security weaknesses in their source code.

The platform uses a fine-tuned machine learning model to classify submitted code as:

- **Safe:** The model predicts that the submitted code is less likely to contain a vulnerability.
- **Vulnerable:** The model predicts that the submitted code may contain a security weakness.

Along with the prediction, an integrated Large Language Model (LLM) generates human-readable explanations, highlights potential security concerns, and suggests possible improvements.

VulneraAI also provides a complete user workspace with secure authentication, email verification, password recovery, saved scan history, dashboard analytics, and downloadable reports.

### Project goals

- Make AI-powered code security analysis easier to access.
- Help developers understand model predictions instead of only receiving a classification.
- Combine machine learning predictions with understandable AI explanations.
- Provide a secure environment for managing user accounts and scan records.
- Track previous scans and visualize security analysis activity.
- Explore the practical application of machine learning in software security.

> **Research prototype:** VulneraAI is an experimental security analysis tool. Predictions may contain false positives and false negatives. A "Safe" result does not guarantee that code is completely secure. Always review code and use additional security testing tools.

## 🧰 Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Python, Flask, SQLAlchemy |
| Machine Learning | PyTorch, Hugging Face Transformers, Fine-Tuned Model |
| AI Explanations | Google Gemini API |
| Database | PostgreSQL / Neon PostgreSQL |
| Authentication | Server-Side Sessions, HTTP-Only Cookies |
| Application Security | CSRF Protection, CORS, Password Hashing |
| Email Service | Gmail SMTP |
| Reporting | jsPDF, CSV Export |
| Visualization | SVG and CSS-based charts |
| Version Control | Git and Git LFS |

---

<a id="features"></a>

## ✨ Features

### 1. Dashboard & Analytics

The dashboard provides an overview of a user's code scanning activity.

- Total scans performed.
- Safe and vulnerable scan counts.
- Total lines analyzed.
- Average confidence score.
- Daily scan activity visualization.
- Safe versus vulnerable result distribution.
- Programming language breakdown.
- Recent scan records.
- Quick access to the scanning workspace.

### 2. Code Scanner

The scanner provides an interface for submitting source code for analysis.

- Paste code directly into the editor.
- Upload source-code files.
- Drag and drop supported files.
- Choose a programming language or use Auto Detect.
- Add a scan title.
- Use example code snippets.
- Submit scans using `Ctrl + Enter`.
- Receive model predictions and AI-generated explanations.

**Supported language options:**

Python, JavaScript, TypeScript, Java, C++, C, Go, Swift, and Auto Detect.

File extensions are used to select a language when uploading a file. Pasted code is not automatically classified by language.

The selected language provides explanation context and history metadata. It does not independently change model inference. Language options do not establish validated detection accuracy for each language.

**Input limits:**

- Frontend uploaded files: 100,000 bytes.
- API code submissions: 100,000 characters.
- Uploaded files are read as text in the browser and submitted as JSON.

### 3. Prediction Results

After scanning, the application displays:

- Safe or Vulnerable verdict.
- Vulnerable probability.
- Configured decision threshold.
- Confidence score.
- AI-generated explanation.
- Potential security concerns.
- Suggested remediation.
- Analysis limitations.
- Downloadable PDF report.

The prediction applies to the complete submitted snippet. The current model does not identify exact vulnerable lines.

### 4. Scan History

Authenticated users can manage their previous scans.

- View saved scan records.
- Search previous scans.
- Filter by prediction and language.
- Sort scan records.
- Navigate through paginated results.
- Open individual scan details.
- Delete saved scans.
- Export scan history as CSV.

### 5. Authentication & Account Management

VulneraAI includes a complete account authentication workflow.

- User registration.
- Email OTP verification.
- Secure login.
- Server-side session management.
- OTP resend functionality.
- Forgot-password workflow.
- OTP-based password reset.
- Profile updates.
- Password changes.
- Secure logout.
- Password-confirmed account deletion.

### 6. User Interface

- Modern cybersecurity-focused interface.
- Dark and light themes.
- Responsive sidebar navigation.
- Mobile navigation drawer.
- Dashboard analytics.
- Reusable UI components.
- Loading skeletons.
- Notifications and alerts.
- Empty states.
- Backend status monitoring.

---

<a id="screenshots"></a>

## 📸 Application Screenshots

The following screenshots show the current VulneraAI interface.

### Login Page

Secure user login interface with a modern authentication layout.

![VulneraAI Login Page](docs/screenshots/Login%20Page.png)

### Dashboard

The main dashboard displays scan statistics, activity, security results, and recent scanning information.

![VulneraAI Dashboard](docs/screenshots/Dashboard.png)

### Code Scanner

The scanning workspace allows users to submit source code for vulnerability analysis.

![VulneraAI Scan Page](docs/screenshots/Scan%20Page.png)

### Scan History

The history workspace helps users review and manage their previously saved scans.

![VulneraAI Scan History](docs/screenshots/History.png)

---

<a id="architecture"></a>

## 🏗️ System Architecture

VulneraAI follows a frontend-backend architecture. The React application communicates with a Flask REST API, which handles authentication, code analysis, AI explanations, and database operations.

### High-level architecture

```mermaid
flowchart TD
    User["User"] --> UI["React + TypeScript Frontend"]

    UI --> Auth["Flask Authentication API"]
    Auth --> OTP["Email OTP Verification"]
    OTP --> SMTP["Gmail SMTP"]

    Auth --> Session["Server-Side Session"]
    Session --> DB["PostgreSQL / Neon"]

    UI --> API["Flask REST API"]
    API --> CSRF["CSRF Validation"]
    CSRF --> Model["Fine-Tuned ML Model"]

    Model --> Scoring["Aggregation & Threshold"]
    Scoring --> LLM["Google Gemini API"]

    LLM --> Save["Save Scan & Explanation"]
    Save --> DB

    DB --> Dashboard["Dashboard & Scan History"]
    Dashboard --> UI
```

### Main components

| Component | Responsibility |
|---|---|
| React Frontend | User interface, authentication pages, scanner, dashboard, history and settings |
| Flask Backend | REST API, authentication, inference orchestration and business logic |
| ML Model | Classifies submitted source code |
| Scoring Layer | Combines chunk predictions and applies the decision threshold |
| Gemini API | Generates human-readable explanations |
| PostgreSQL | Stores user accounts, sessions and scan records |
| Gmail SMTP | Sends email verification and password recovery codes |

### Request lifecycle

1. The user submits source code through the React frontend.
2. The frontend sends the request to the Flask backend.
3. The backend validates the request and authentication where required.
4. The submitted code is normalized.
5. The machine learning model analyzes the input.
6. The scoring layer combines chunk scores and determines the final prediction.
7. The Gemini API generates an explanation when configured.
8. Authenticated scan records and explanations are saved in PostgreSQL.
9. The backend returns the result to the frontend.
10. The frontend displays the prediction and makes saved results available in scan history.

### Public and authenticated scanning

VulneraAI provides two different scanning workflows:

| Endpoint | Authentication | Saves scan | AI explanation |
|---|---|---|---|
| `/api/predict` | Not required | No | No |
| `/api/scan` | Required | Yes | Yes, when configured |

The public prediction endpoint is intended for direct model inference. Authenticated scanning supports saved records and AI explanations.

### Data handling

Authenticated scans store submitted code and the generated explanation in PostgreSQL.

For AI explanations, the backend sends up to the first **12,000 characters** of submitted code, together with the prediction, confidence, and language, to the configured external LLM API.

Set `GEMINI_API_KEY` to enable this integration. Leave it unset to disable external explanation requests.

PDF reports are generated in the browser using jsPDF. CSV scan-history exports are generated by Flask.

---

<a id="machine-learning-model"></a>

## 🧠 Machine Learning Model

The core of VulneraAI is a fine-tuned machine learning model trained to distinguish between safe and potentially vulnerable code snippets.

### Classification task

The model performs binary classification:

| Label | Meaning |
|---|---|
| Safe | The model predicts that the submitted code is less likely to be vulnerable |
| Vulnerable | The model predicts that the submitted code may contain a vulnerability |

The model produces prediction scores that are processed by the backend scoring layer.

### Inference workflow

1. Receive source code from the API.
2. Normalize whitespace, line endings and surrounding blank lines.
3. Tokenize the submitted code.
4. Split longer inputs into overlapping chunks.
5. Run model inference on the evaluated chunks.
6. Aggregate chunk scores using the configured scoring rule.
7. Compare the vulnerable probability with the decision threshold.
8. Return the final classification and associated prediction information.

### Chunking configuration

| Parameter | Configuration |
|---|---:|
| Maximum sequence length | 512 tokens |
| Chunk stride | 128 tokens |
| Maximum evaluated chunks | 8 |
| Classification labels | Safe / Vulnerable |
| Aggregation options | `max`, `top2`, `mean` |

Long code submissions are divided into overlapping chunks to allow the model to analyze larger inputs.

The backend evaluates up to the configured maximum number of chunks. Therefore, very long inputs may not be completely analyzed.

### Scoring and decision threshold

The scoring layer combines predictions from evaluated chunks.

Supported aggregation strategies include:

- **Max:** Uses the maximum vulnerable score among evaluated chunks.
- **Top2:** Combines the two highest chunk scores according to the implementation.
- **Mean:** Uses the average score across evaluated chunks.

The final vulnerable probability is compared against the configured threshold.

```text
If vulnerable_probability >= threshold:
    Prediction = Vulnerable
Else:
    Prediction = Safe
```

The active scoring configuration may be loaded from `best_info.json` when available.

Without scoring metadata, the backend can fall back to mean aggregation and a threshold of `0.5`, according to its implementation.

### Confidence score

The confidence displayed in the interface represents the distance from the configured decision threshold.

It is a **decision-margin display score**, not a calibrated probability that the prediction is correct.

The application displays vulnerable probability and decision threshold separately to make the model decision easier to understand.

### Model configuration

The default model directory is:

```text
backend/model/
```

An optional updated checkpoint can be placed in:

```text
backend/model_v3/
```

To use an alternative checkpoint:

1. Place the compatible model checkpoint in the selected directory.
2. Include the required configuration, tokenizer and model weights.
3. Include `best_info.json` if using validation-selected scoring settings.
4. Configure the model directory in `backend/.env`.

Example:

```env
MODEL_DIR=model_v3
MAX_EVAL_CHUNKS=8
```

Restart the backend after changing model configuration.

Inference uses CUDA when available and otherwise falls back to CPU.

---

## 🔐 Authentication & Security

VulneraAI implements multiple security controls to protect user accounts, authentication sessions and authenticated API requests.

### Authentication workflow

```mermaid
flowchart TD
    A["User Signup"] --> B["Email OTP"]
    B --> C{"OTP Valid?"}
    C -->|No| B
    C -->|Yes| D["Email Verified"]
    D --> E["User Login"]
    E --> F["Create Server-Side Session"]
    F --> G["HTTP-Only Session Cookie"]
    G --> H["Authenticated Requests"]
    H --> I["CSRF Validation"]
    I --> J["Protected API Access"]
```

### Security implementation

| Security feature | Implementation |
|---|---|
| Email Verification | One-time code sent to the registered email |
| Secure Login | Authenticates verified users and establishes a session |
| HTTP-Only Cookies | Prevents JavaScript from directly reading the session cookie |
| Server-Side Sessions | Maintains authentication sessions on the backend |
| PostgreSQL Sessions | Stores session records in PostgreSQL |
| CSRF Protection | Uses CSRF tokens to help protect authenticated requests |
| OTP Resend | Allows users to request another verification code |
| Forgot Password | Sends a password-reset OTP |
| Password Reset | Verifies the OTP before allowing a password change |
| Password Hashing | Stores password hashes rather than plain-text passwords |
| Password Policy | Requires 8+ characters with uppercase, lowercase, a number and a symbol, and rejects common passwords |
| Rate Limiting | Limits repeated login, signup, OTP and password-reset attempts per IP |
| OTP Attempt Limit | Locks a verification or reset code after five incorrect attempts |
| Session Revocation | Logout ends the session and revokes it server-side |
| CORS | Restricts permitted frontend origins |
| SameSite Cookies | Controls when cookies are sent with cross-site requests |
| Secure Cookies | Supports secure cookie transmission over HTTPS |

### Session management

The application uses server-side session management instead of storing authentication tokens in browser localStorage.

The session identifier is stored in an HTTP-Only cookie:

```text
vulneraai_session
```

The backend maintains session records in PostgreSQL.

This design helps prevent direct JavaScript access to the session identifier and allows the server to revoke sessions independently of the browser cookie.

### CSRF protection

Authenticated state-changing requests use CSRF protection.

The frontend API client retrieves and sends the required CSRF token using:

```text
X-CSRF-Token
```

The backend validates the token according to its configured authentication and CSRF rules.

### Production security considerations

Before deploying publicly:

- Use HTTPS.
- Enable Secure session cookies.
- Configure the actual production frontend origin in CORS.
- Keep API keys and SMTP credentials outside the repository.
- Use strong secret keys.
- Verify session expiration and revocation.
- Test CSRF rejection behavior.
- Review rate-limiting configuration.
- Perform independent security testing.

---

## 📁 Project Structure

```text
VulneraAI/
│
├── README.md
├── .gitignore
├── .gitattributes
├── start-backend.ps1
├── start-frontend.ps1
│
├── backend/
│   ├── server.py
│   ├── auth.py
│   ├── database.py
│   ├── model/
│   ├── model_v3/
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   │
│   └── src/
│       ├── main.tsx
│       ├── context/
│       │   └── AuthContext.tsx
│       ├── lib/
│       │   ├── api.ts
│       │   └── ...
│       ├── components/
│       │   ├── Reusable UI components
│       │   ├── Charts
│       │   └── Layout components
│       └── pages/
│           ├── AuthPages.tsx
│           ├── DashboardPage.tsx
│           ├── ScanPage.tsx
│           ├── HistoryPage.tsx
│           └── SettingsPage.tsx
│
├── tests/
│   ├── test.py
│   ├── test_300.py
│   ├── test_cases_300.py
│   ├── vulnerability_test_cases.py
│   ├── check_result_parity.py
│   ├── test_gemini.py
│   ├── test_result_contract.py
│   ├── test_300_summary.csv
│   ├── test_300_results.csv
│   └── test_300_output.txt
│
└── docs/
    └── screenshots/
        ├── Dashboard.png
        ├── History.png
        ├── Login Page.png
        └── Scan Page.png
```

The structure above represents the main application files. Additional files and components may exist in the repository.

---

<a id="requirements"></a>

## 📋 Requirements

Before running VulneraAI locally, install:

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Git
- Git LFS
- Google Gemini API key (optional, for AI explanations)
- Gmail SMTP credentials (for email verification and password recovery)

---

<a id="getting-started"></a>

## 🚀 Getting Started

Follow these steps to run VulneraAI locally.

### 1. Clone the repository

VulneraAI uses Git LFS for large model files.

```bash
git lfs install
git clone https://github.com/HadiaWaheed/VulneraAI.git
cd VulneraAI
git lfs pull
```

Check that the model downloaded correctly.

The original model file:

```text
backend/model/model.safetensors
```

should be approximately **476 MB**, rather than a small Git LFS pointer file.

On Windows, install Git LFS and restart the terminal if the `git lfs` command is unavailable.

### 2. Configure PostgreSQL

Install PostgreSQL and create the database configured in your backend.

Example:

```bash
createdb polyguard
```

On Windows PowerShell:

```powershell
createdb -U postgres polyguard
```

Configure the database connection string in `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/polyguard
```

For Neon PostgreSQL, use the connection string provided by your Neon project.

The database stores:

- User accounts.
- Authentication sessions.
- Saved scan records.
- Scan explanations and associated metadata.

Database tables are created by the application according to its initialization logic.

### 3. Set up the Python backend

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

On macOS or Linux:

```bash
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

Create your environment file:

```powershell
Copy-Item backend/.env.example backend/.env
```

Edit `backend/.env` and configure the required values.

### 4. Environment configuration

The following is a reference configuration. Always use the exact variable names supported by your current backend code and `.env.example`.

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Email / SMTP
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587

# Session configuration
SESSION_EXPIRES_HOURS=24
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_SAMESITE=Lax

# CORS
CORS_ORIGINS=http://localhost:3000

# OTP security
OTP_SECRET_KEY=your_generated_otp_secret

# AI explanations
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_supported_gemini_model
GEMINI_TIMEOUT_SECONDS=120

# Model configuration
MODEL_DIR=model
MAX_EVAL_CHUNKS=8

# Frontend API
VITE_API_URL=http://localhost:5000
```

**Configuration explanations:**

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL or Neon connection string |
| `SMTP_EMAIL` | Email address used for OTP delivery |
| `SMTP_PASSWORD` | Gmail App Password |
| `SMTP_SERVER` | SMTP server address |
| `SMTP_PORT` | SMTP connection port |
| `SESSION_EXPIRES_HOURS` | Intended session lifetime |
| `SESSION_COOKIE_SECURE` | Enables Secure cookie behavior for HTTPS |
| `SESSION_COOKIE_SAMESITE` | Configures the cookie SameSite policy |
| `CORS_ORIGINS` | Allowed frontend origins |
| `OTP_SECRET_KEY` | Secret used by the OTP implementation |
| `GEMINI_API_KEY` | Enables AI-generated explanations |
| `GEMINI_MODEL` | Configures the supported Gemini model |
| `GEMINI_TIMEOUT_SECONDS` | AI explanation request timeout |
| `MODEL_DIR` | Selects the model directory |
| `MAX_EVAL_CHUNKS` | Maximum number of chunks evaluated |
| `VITE_API_URL` | Backend API address used by the frontend |

Generate a strong secret key when required:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

**Email configuration:** Enable 2-Step Verification in your Google Account and generate a Gmail App Password. Use that App Password in `SMTP_PASSWORD`, not your regular Gmail password.

**Important:** `SESSION_COOKIE_SECURE=false` is suitable for local HTTP development only. Enable Secure cookies and HTTPS in production. Never commit `.env`, SMTP credentials, API keys or secret keys to GitHub.

### 5. Set up the frontend

Open another terminal:

```bash
cd frontend
npm ci
```

If you do not have a lockfile, use:

```bash
npm install
```

---

## 💻 Running Locally

Open two terminals in the project folder.

### Terminal 1: Backend

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
python backend/server.py
```

macOS / Linux:

```bash
source venv/bin/activate
python backend/server.py
```

The Flask backend runs at:

```text
http://127.0.0.1:5000
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Open the application:

```text
http://localhost:3000
```

Create an account, verify your email using the OTP, log in, and start scanning code.

---

## ⚙️ Model Configuration & Scoring

VulneraAI supports a fine-tuned model stored locally in the backend.

Default model directory:

```text
backend/model/
```

Optional checkpoint directory:

```text
backend/model_v3/
```

To configure an alternative model:

1. Place the compatible checkpoint in the selected directory.
2. Include the model configuration, weights and tokenizer files.
3. Include `best_info.json` if using validation-selected scoring settings.
4. Update `MODEL_DIR` in `backend/.env`.
5. Restart the backend.

Example:

```env
MODEL_DIR=model_v3
```

The startup logs display the active scoring configuration when available.

### Scoring configuration

- Maximum sequence length: 512 tokens.
- Chunk stride: 128 tokens.
- Maximum evaluated chunks: 8.
- Supported aggregation rules: `max`, `top2`, `mean`.
- Validation-selected thresholds can be loaded from `best_info.json`.
- Length-aware thresholds for different chunk-count groups are supported.
- Without scoring metadata, the backend can fall back to mean aggregation and a threshold of 0.5, according to its implementation.
- Inference uses CUDA when available and otherwise falls back to CPU.

Each saved scan can retain its threshold and model version information so historical results remain associated with the configuration used during scanning.

---

<a id="api-reference"></a>

## 🔌 API Reference

VulneraAI provides REST API endpoints for authentication, scanning, dashboard statistics and scan history.

Authenticated endpoints use the session cookie and CSRF protection configured by the backend. The frontend API client handles credentialed requests and the required CSRF header.

### Authentication capabilities

| Function | Description |
|---|---|
| Signup | Create a new user account |
| Email Verification | Verify the registered email using an OTP |
| OTP Resend | Request a new verification OTP |
| Login | Authenticate a verified user and establish a session |
| Current User | Retrieve the currently authenticated user |
| Profile Update | Update account information |
| Change Password | Change the current password |
| Forgot Password | Request a password-reset OTP |
| Reset Password | Verify the OTP and reset the password |
| Logout | End the authenticated session |
| Account Deletion | Delete the account after password confirmation |

### Scan endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/scan` | Scan and save code for an authenticated user |
| `GET` | `/api/scans` | Retrieve scan history with filters and pagination |
| `GET` | `/api/scans/<id>` | Retrieve an individual scan |
| `DELETE` | `/api/scans/<id>` | Delete a saved scan |
| `GET` | `/api/scans/export.csv` | Export filtered scan history |
| `GET` | `/api/stats` | Retrieve dashboard statistics |

### Public endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check backend and model configuration |
| `POST` | `/api/predict` | Run model prediction without login, saving or AI explanation |

The exact authentication route names and request fields should be checked against the current Flask route definitions.

---

<a id="evaluation--test-results"></a>

## 🧪 Evaluation & Test Results

VulneraAI includes exploratory test suites for evaluating its vulnerability classification performance.

The recorded evaluation runs show the following results.

### Test results at a glance

| Test suite | Cases tested | Correct | Accuracy |
|---|---:|---:|---:|
| Small suite (`test.py`) | 16 | 13 | **81.25%** |
| Larger suite (`test_300.py`) | 271 | 202 | **74.54%** |

The larger suite's filename contains "300", but the recorded run evaluated **271 cases**.

These suites differ in size and composition. Their accuracy figures should not be interpreted as a before-and-after comparison.

### Small test suite — 16 cases

| Actual class | Predicted Safe | Predicted Vulnerable |
|---|---:|---:|
| Safe | 6 | 2 |
| Vulnerable | 1 | 7 |

- Correct predictions: 13
- Misclassifications: 3
- Accuracy: 81.25%
- Vulnerable precision: 77.78%
- Vulnerable recall: 87.50%
- Vulnerable F1: 82.35%

### Larger test suite — 271 cases

| Actual class | Predicted Safe | Predicted Vulnerable |
|---|---:|---:|
| Safe | 109 | 27 |
| Vulnerable | 42 | 93 |

- Total cases: 271
- Correct predictions: 202
- False positives: 27
- Missed vulnerabilities: 42
- Accuracy: 74.54%

### Performance by complexity

| Group | Cases | Accuracy | Precision | Recall | F1 |
|---|---:|---:|---:|---:|---:|
| Easy | 103 | 75.73% | 76.79% | 78.18% | 77.48% |
| Medium | 85 | 71.76% | 72.97% | 65.85% | 69.23% |
| Complex | 83 | 75.90% | 85.19% | 58.97% | 69.70% |
| **Overall** | **271** | **74.54%** | **77.50%** | **68.89%** | **72.94%** |

Precision, recall and F1 use **Vulnerable** as the positive class.

These are saved results from hand-written exploratory evaluation suites, not an independent benchmark. They do not establish performance on unseen repositories or across every selectable programming language.

### Running the evaluation

Start the backend with your selected model, then run:

```bash
# Small suite
python tests/test.py

# Larger suite
python tests/test_300.py

# Optional alternative cases file
python tests/test_300.py path/to/test_cases_300.py
```

The evaluation runners call `/api/predict`.

Results depend on the active checkpoint, aggregation rule, threshold and chunk limit.

### Frontend build checks

```bash
cd frontend
npm run build
npx tsc --noEmit
```

The build script runs Vite. TypeScript checking is a separate command.

---

## 🧪 Security Testing Checklist

The following checks are useful when validating the application's security behavior:

- Verify that an account cannot be used before email verification.
- Test invalid and expired OTPs.
- Confirm that the session cookie is not accessible through `document.cookie`.
- Verify that protected endpoints reject unauthenticated requests.
- Verify that missing or invalid CSRF tokens are rejected where required.
- Confirm that logout invalidates the previous session.
- Check that credentials are not stored in browser localStorage.
- Verify CORS restrictions.
- Verify HTTPS and Secure cookie behavior before deployment.
- Test rate limits and OTP attempt limits.
- Review password-reset and account-deletion workflows.

---

## ⚠️ Limitations & Deployment Considerations

VulneraAI is a research and development prototype. The following limitations should be considered before production use.

### Model limitations

- **Whole-snippet classification:** The model does not identify exact vulnerable lines.
- **Detection quality:** The saved larger evaluation missed 42 of 135 vulnerable examples.
- **Complex patterns:** More diverse training data is needed to improve detection of complex vulnerability patterns.
- **Language coverage:** Available language options do not establish equal model accuracy across programming languages.
- **Partial analysis:** The classifier evaluates up to the configured maximum number of chunks.
- **Risk labels:** High and low risk labels are derived from the prediction rather than a separately trained severity estimator.

### AI explanation limitations

- AI explanations depend on the configured external LLM API.
- The explanation service may be unavailable or return incomplete information.
- Explanations should be treated as assistance, not proof that a vulnerability exists or does not exist.
- Only up to the first 12,000 characters of code are sent for the configured explanation workflow.

### Production considerations

- Enable HTTPS and Secure cookies.
- Configure production CORS origins.
- Keep all secrets in environment variables or a dedicated secret manager.
- Review rate limiting and session expiration.
- Consider a dedicated rate-limit storage backend such as Redis if required by the deployment architecture.
- Introduce versioned database migrations.
- Perform independent security testing.
- Monitor backend errors, model performance and external API availability.

---

## 🛠️ Troubleshooting

| Problem | Possible solution |
|---|---|
| `git: 'lfs' is not a git command` | Install Git LFS, then run `git lfs install` and `git lfs pull`. |
| Model fails to load | Run `git lfs pull` and verify model files. |
| `connection refused` | Make sure PostgreSQL is running and check `DATABASE_URL`. |
| Database does not exist | Create the database configured in `DATABASE_URL`. |
| `ModuleNotFoundError` | Activate the virtual environment and install backend requirements. |
| Email verification fails | Check SMTP credentials, Gmail App Password, server and port. |
| Password-reset email fails | Verify SMTP configuration and backend email logs. |
| CSRF error | Refresh the application and check CSRF token retrieval and the `X-CSRF-Token` header. |
| Login/session issue | Check browser cookies, session configuration and PostgreSQL connection. |
| AI explanation unavailable | Check `GEMINI_API_KEY`, `GEMINI_MODEL` and backend logs. |
| Frontend cannot reach backend | Make sure Flask is running on port 5000 and check `VITE_API_URL`. |
| Saved metrics differ | Check the active model directory, scoring rule, threshold and chunk limit. |

---

## 🚧 Future Improvements

Potential improvements for future versions of VulneraAI include:

### Machine Learning

- Improve vulnerability detection with more diverse training data.
- Add independent evaluation datasets.
- Introduce per-language performance metrics.
- Improve detection of complex vulnerability patterns.
- Explore additional model architectures and scoring strategies.
- Improve model checkpoint packaging and reproducibility.

### Scanning & Analysis

- Highlight potentially vulnerable code sections.
- Add more detailed vulnerability explanations.
- Improve support for larger code submissions.
- Add additional analysis and reporting capabilities.

### Application & Security

- Expand automated authentication and authorization tests.
- Introduce versioned database migrations.
- Improve deployment hardening and monitoring.
- Review and improve API rate limiting.
- Add further security validation workflows.

### User Experience

- Improve dashboard analytics.
- Enhance scan reports.
- Expand scan history management.
- Continue improving responsive layouts and accessibility.

---

## 👩‍💻 Development & Contribution

VulneraAI is an ongoing project focused on exploring the practical use of machine learning and AI in code security analysis.

Contributions, suggestions, bug reports and improvements are welcome.

If you find an issue or have an idea for improvement, feel free to open a GitHub issue or submit a pull request.

When contributing:

1. Fork the repository.
2. Create a separate feature branch.
3. Make your changes.
4. Run relevant tests and frontend build checks.
5. Submit a pull request describing your changes.

---

<div align="center">

## 🛡️ VulneraAI

**Building safer code with AI-powered analysis.**

[GitHub Repository](https://github.com/HadiaWaheed/VulneraAI)

</div>
