<div align="center">

# 🛡️ VulneraAI

### AI-Powered Code Vulnerability Scanner

**Scan code. Understand predictions. Track every review.**

An intelligent code security platform that analyzes source code using a fine-tuned machine learning model, provides AI-powered explanations, and helps developers understand potential security risks through an interactive dashboard.

![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=flat-square&logo=react&logoColor=white)
![Python](https://img.shields.io/badge/Python-Flask-3776AB?style=flat-square&logo=python&logoColor=white)
![AI](https://img.shields.io/badge/AI-Fine--Tuned%20Model-8B5CF6?style=flat-square)
![Database](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Security](https://img.shields.io/badge/Security-Session%20Based-16A34A?style=flat-square)

[Features](#features) · [Screenshots](#screenshots) · [Architecture](#architecture) · [Setup](#getting-started) · [API](#api-reference) · [Evaluation](#evaluation)

</div>

---

## Overview

**VulneraAI** is an AI-powered code vulnerability scanning platform designed to help developers identify potential security weaknesses in source code.

It uses a fine-tuned machine learning model to classify submitted code as **Safe** or **Vulnerable**. An integrated LLM generates easy-to-understand explanations, highlights potential security concerns, and suggests possible improvements.

The platform also provides secure user authentication, email verification, password recovery, scan history, dashboard analytics, and downloadable reports.

> **Research prototype:** Predictions may contain false positives and false negatives. A "Safe" result does not guarantee that code is completely secure. Always review the code and consider additional security testing.

### Technology stack

| Layer | Technologies |
| :--- | :--- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Python, Flask, SQLAlchemy |
| Machine Learning | PyTorch, Hugging Face Transformers, Fine-Tuned Model |
| AI Explanations | Google Gemini API |
| Database | PostgreSQL / Neon PostgreSQL |
| Authentication | Server-Side Sessions, HTTP-Only Cookies |
| Application Security | CSRF Protection, CORS, Password Hashing |
| Email Service | Gmail SMTP |
| Reporting | jsPDF, CSV Export |

---

<a id="features"></a>

## ✨ Features

| Workspace | Implemented capabilities |
| :--- | :--- |
| **Dashboard** | Total, safe and vulnerable scan counts; total lines; average confidence; scan activity; result distribution; language statistics; recent scans |
| **Scanner** | Paste code, upload or drag a file, use example snippets, add a title, and submit with `Ctrl + Enter` |
| **Results** | Whole-snippet verdict, vulnerable probability, decision threshold, confidence score, AI explanation, and PDF download |
| **History** | Search previous scans, filter by result and language, sort records, pagination, individual scan details, deletion, and CSV export |
| **Authentication** | User registration, email verification, secure login, session management, OTP resend, forgot password, and password reset |
| **Account** | Profile updates, password changes, logout, and password-confirmed account deletion |
| **Security** | HTTP-only session cookies, server-side sessions, CSRF protection, password hashing, rate limiting, password policy, OTP attempt limits, and configurable cookie security |
| **Interface** | Dark indigo workspace, responsive sidebar/mobile drawer, loading skeletons, notifications, empty states, and backend status polling |

**Language options:** Python, JavaScript, TypeScript, Java, C++, C, Go, Swift, and "Auto detect." File extensions select a language when uploading; pasted code is not automatically classified by language. The language value provides explanation context and history metadata; it does not independently change model inference. Language options do not establish validated detection accuracy for each language.

**Input limits:** Uploaded files are limited to 100,000 bytes in the frontend; API code submissions are limited to 100,000 characters. Uploaded files are read as text in the browser and submitted as JSON.

### 🔐 Authentication & Security

| Security feature | How it works |
| :--- | :--- |
| **Email Verification** | Sends a one-time verification code to the user's registered email address. |
| **Secure Login** | Authenticates users and establishes a server-side session. |
| **HTTP-Only Cookies** | Stores the session identifier in a cookie that JavaScript cannot directly access. |
| **CSRF Protection** | Uses CSRF tokens to help protect authenticated requests. |
| **Session Management** | Maintains authentication sessions on the backend using PostgreSQL. |
| **OTP Resend** | Allows users to request another verification code. |
| **Forgot Password** | Sends a password-reset OTP to the registered email address. |
| **Password Reset** | Verifies the OTP before allowing a password change. |
| **Password Hashing** | Stores password hashes instead of plain-text passwords. |
| **Password Policy** | Requires 8+ characters with uppercase, lowercase, a number and a symbol, and rejects common passwords. |
| **Rate Limiting** | Limits repeated login, signup, OTP and password-reset attempts per IP. |
| **OTP Attempt Limit** | Locks a verification or reset code after 5 wrong attempts; a new code must be requested. |
| **Logout** | Ends the authenticated session and revokes it server-side, so the old cookie stops working. |

---

<a id="screenshots"></a>

## 📸 Screenshots

### Login & signup

| Login | Sign up |
| :---: | :---: |
| ![Login page](docs/screenshots/login.png) | ![Sign up page](docs/screenshots/signup.png) |

### Dashboard

![Dashboard overview](docs/screenshots/dashboard.png)

| Scan activity | Results |
| :---: | :---: |
| ![Scan activity chart](docs/screenshots/dashboard-activity.png) | ![Safe vs vulnerable results](docs/screenshots/dashboard-results.png) |

![Recent scans and languages](docs/screenshots/dashboard-recent.png)

### New scan

| Code input | Result: vulnerable |
| :---: | :---: |
| ![New scan input](docs/screenshots/scan-input.png) | ![Vulnerable result](docs/screenshots/scan-result-vulnerable.png) |

![Safe result](docs/screenshots/scan-result-safe.png)

### History & settings

| Scan history | Settings |
| :---: | :---: |
| ![Scan history](docs/screenshots/history.png) | ![Settings](docs/screenshots/settings.png) |

---

<a id="architecture"></a>

## 🏗️ Architecture

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
    CSRF --> Model["Fine-Tuned Model"]
    Model --> Rule["Aggregation & Threshold"]
    Rule --> LLM["AI Explanation"]

    LLM --> Save["Save Scan & Explanation"]
    Save --> DB

    DB --> Dashboard["Dashboard & Scan History"]
    Dashboard --> UI
```

The diagram shows the main application flow. Authentication and scan operations are handled by Flask, while PostgreSQL stores user accounts, authentication sessions and scan records.

The public `/api/predict` route runs inference without AI explanations or database writes. PDF reports are generated in the browser with jsPDF; CSV history exports are generated by Flask. Dashboard charts use lightweight SVG/CSS components.

**Data handling:** Authenticated scans store the submitted code and explanation in PostgreSQL. For the explanation, the backend sends up to the first **12,000 characters** of code, together with the prediction, confidence, and language, to the configured external LLM API. Leave `GEMINI_API_KEY` unset to disable that external explanation request.

---

## 🧠 How scanning works

1. The user submits code through the React frontend.
2. The frontend sends the request to the Flask backend.
3. The backend normalizes whitespace, including line endings, trailing spaces and surrounding blank lines.
4. The fine-tuned model analyzes the submitted code.
5. Long code is split into overlapping 512-token chunks with a stride of 128.
6. The chunk scores are combined using the configured aggregation rule.
7. The vulnerable probability is compared with the configured decision threshold.
8. The LLM generates an explanation containing a summary, potential concerns, suggested remediation and limitations.
9. The scan and its explanation are saved in PostgreSQL for authenticated users.
10. The frontend displays the result and makes it available in scan history.

> The prediction applies to the **whole snippet**. The scanner does not identify exact vulnerable lines.

---

## 📁 Project structure

```text
.
├── README.md
├── .gitignore
├── .gitattributes
├── start-backend.ps1
├── start-frontend.ps1
│
├── backend/
│   ├── server.py                  # Flask application, inference and API routes
│   ├── auth.py                    # Authentication and session management
│   ├── database.py                # PostgreSQL connection and database models
│   ├── model/                     # Fine-tuned model files
│   ├── model_v3/                  # Optional model checkpoint and scoring metadata
│   ├── .env.example               # Environment configuration template
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
│   └── src/
│       ├── main.tsx               # Application routes
│       ├── context/
│       │   └── AuthContext.tsx    # Authentication state
│       ├── lib/
│       │   ├── api.ts             # API client and request handling
│       │   └── ...
│       ├── components/            # Reusable UI components and charts
│       └── pages/                 # Login, signup, dashboard, scan, history and settings
│
├── tests/                         # Evaluation suites and test results
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
```

---

## 📋 Requirements

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Git and Git LFS
- Google Gemini API key (optional, for AI explanations)
- Gmail SMTP credentials (for email verification and password recovery)

---

<a id="getting-started"></a>

## 🚀 Getting started

### 1. Clone the repository with the model

```bash
git lfs install
git clone https://github.com/HadiaWaheed/VulneraAI.git
cd VulneraAI
git lfs pull
```

Check that the model downloaded correctly. For the original model file, `backend/model/model.safetensors` should be approximately **476 MB**, not a small Git LFS pointer file.

```bash
ls -lh backend/model/model.safetensors
```

> On Windows, install Git LFS and restart the terminal if the `git lfs` command is not found.

### 2. PostgreSQL

Install PostgreSQL and create the database configured in your backend.

For example:

```bash
createdb polyguard
```

For Windows:

```powershell
createdb -U postgres polyguard
```

Set the database connection string in `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/polyguard
```

For Neon PostgreSQL, use the connection string provided by your Neon project.

The database stores user accounts, authentication sessions and scan records. Tables are created by the application during startup according to its database initialization logic.

### 3. Backend

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate it:

```powershell
# Windows PowerShell
.\venv\Scripts\Activate.ps1
```

```bash
# macOS / Linux
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

Create your backend environment file:

```powershell
Copy-Item backend/.env.example backend/.env
```

Edit `backend/.env` and configure the required settings.

### 4. Environment configuration

The following is a reference configuration. Use the exact variable names provided by your current `backend/.env.example` and backend code.

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

# CORS (comma-separated frontend origins)
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

**Configuration notes:**

- `DATABASE_URL`: Connects the backend to PostgreSQL or Neon.
- `SMTP_EMAIL`: Email address used to send verification and password-reset OTPs.
- `SMTP_PASSWORD`: Gmail App Password used for SMTP authentication.
- `SMTP_SERVER`: SMTP server address.
- `SMTP_PORT`: SMTP connection port.
- `SESSION_EXPIRES_HOURS`: Configures the intended session lifetime.
- `SESSION_COOKIE_SECURE`: Set to `true` for HTTPS production deployments.
- `SESSION_COOKIE_SAMESITE`: Configures the cookie SameSite policy.
- `CORS_ORIGINS`: Comma-separated frontend origins allowed by CORS (default `http://localhost:3000`; set your real domain in production).
- `OTP_SECRET_KEY`: Private secret used by the OTP implementation.
- `GEMINI_API_KEY`: Enables AI-generated explanations.
- `MODEL_DIR`: Selects the model directory.
- `MAX_EVAL_CHUNKS`: Configures the maximum number of chunks evaluated.
- `VITE_API_URL`: Backend API address used by the frontend.

Generate a strong secret key when required:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

**Email configuration:** Enable 2-Step Verification in your Google Account and generate a Gmail App Password. Use that App Password in `SMTP_PASSWORD`, not your regular Gmail password.

**Important:** `SESSION_COOKIE_SECURE=false` is suitable for local HTTP development. Enable Secure cookies and HTTPS for production deployment. Never commit `.env`, SMTP credentials, API keys or secret keys to GitHub.

### 5. Frontend

Open a new terminal:

```bash
cd frontend
npm ci
```

---

<a id="model-configuration"></a>

## ⚙️ Model configuration & scoring

VulneraAI supports a fine-tuned model stored locally in the backend.

The default model directory is:

`backend/model/`

An optional updated checkpoint can be placed in:

`backend/model_v3/`

The optional checkpoint and its scoring metadata may need to be supplied separately.

### Configure the model

1. Place the compatible checkpoint inside the selected model directory.
2. Include the required configuration, model weights and tokenizer files.
3. Include `best_info.json` if using validation-selected scoring settings.
4. Configure the model directory in `backend/.env`:

```env
MODEL_DIR=model_v3
```

5. Restart the backend:

```bash
python backend/server.py
```

The startup logs display the active scoring configuration when available.

### Scoring process

- Maximum sequence length: 512 tokens.
- Chunk stride: 128 tokens.
- Maximum evaluated chunks: 8.
- Supported aggregation rules: `max`, `top2` and `mean`.
- Validation-selected thresholds can be loaded from `best_info.json`.
- Length-aware thresholds for different chunk-count groups are supported.
- Without scoring metadata, the backend can fall back to mean aggregation and a threshold of 0.5, according to its configured implementation.
- Inference uses CUDA when available and otherwise falls back to CPU.

### Confidence score

The confidence displayed in the interface represents the distance from the configured decision threshold.

It is a **decision-margin display score**, not a calibrated probability that the prediction is correct.

The vulnerable probability and decision threshold are displayed separately to make the prediction easier to understand.

Each saved scan can retain its threshold and model version information so historical results remain associated with the configuration used during scanning.

---

## 💻 Running locally

Open **two terminals** in the project folder.

**Terminal 1: Backend**

```powershell
# Windows PowerShell
.\venv\Scripts\Activate.ps1
python backend/server.py
```

```bash
# macOS / Linux
source venv/bin/activate
python backend/server.py
```

The Flask API runs at:

`http://127.0.0.1:5000`

**Terminal 2: Frontend**

```bash
cd frontend
npm run dev
```

Open:

**http://localhost:3000**

Create an account, verify your email using the OTP, log in and start scanning.

---

<a id="api-reference"></a>

## 🔌 API reference

VulneraAI provides REST API endpoints for authentication, scanning, dashboard statistics and scan history.

Authenticated endpoints use the session cookie and CSRF protection configured by the backend. The frontend API client handles credentialed requests and the required CSRF header.

### Authentication

| Function | Description |
|---|---|
| Signup | Create a new user account. |
| Email Verification | Verify the registered email using an OTP. |
| OTP Resend | Request a new verification OTP. |
| Login | Authenticate a verified user and establish a session. |
| Current User | Retrieve the currently authenticated user. |
| Profile Update | Update account information. |
| Change Password | Change the current password. |
| Forgot Password | Request a password-reset OTP. |
| Reset Password | Verify the OTP and reset the password. |
| Logout | End the authenticated session. |
| Account Deletion | Delete the account after password confirmation. |

### Scans

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/scan` | Scan and save code for an authenticated user. |
| `GET` | `/api/scans` | Retrieve scan history with filters and pagination. |
| `GET` | `/api/scans/<id>` | Retrieve an individual scan. |
| `DELETE` | `/api/scans/<id>` | Delete a saved scan. |
| `GET` | `/api/scans/export.csv` | Export filtered scan history. |
| `GET` | `/api/stats` | Retrieve dashboard statistics. |

### Public

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check backend and model configuration. |
| `POST` | `/api/predict` | Run model prediction without login, saving or AI explanation. |

The exact authentication route names and request fields should be checked against the current Flask route definitions.

---

<a id="evaluation"></a>

## 🧪 Evaluation & test results

### Test results at a glance

The recorded evaluation runs show the following results:

| Test suite | Cases tested | Correct | Accuracy | Safe correctly classified | Vulnerable correctly classified |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Small suite (`test.py`) | 16 | 13 | **81.25%** | 6 / 8 (75.00%) | 7 / 8 (87.50%) |
| Larger suite (`test_300.py`) | 271 | 202 | **74.54%** | 109 / 136 (80.15%) | 93 / 135 (68.89%) |

The larger suite's filename contains "300", but the recorded run evaluated **271 cases**. These suites differ in size and composition; their accuracy figures should not be interpreted as a before/after comparison.

### Small suite — 16 cases

| Actual class | Predicted safe | Predicted vulnerable |
| :--- | ---: | ---: |
| Safe | 6 | 2 |
| Vulnerable | 1 | 7 |

- Correct predictions: 13
- Misclassifications: 3
- Accuracy: 81.25%
- Vulnerable precision: 77.78%
- Vulnerable recall: 87.50%
- Vulnerable F1: 82.35%

### Larger suite — 271 cases

| Actual class | Predicted safe | Predicted vulnerable |
| :--- | ---: | ---: |
| Safe | 109 | 27 |
| Vulnerable | 42 | 93 |

- Total cases: 271
- Correct predictions: 202
- False positives: 27
- Missed vulnerabilities: 42
- Accuracy: 74.54%

### Performance by complexity

| Group | Cases | Accuracy | Precision | Recall | F1 |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Easy | 103 | 75.73% | 76.79% | 78.18% | 77.48% |
| Medium | 85 | 71.76% | 72.97% | 65.85% | 69.23% |
| Complex | 83 | 75.90% | 85.19% | 58.97% | 69.70% |
| **Overall** | **271** | **74.54%** | **77.50%** | **68.89%** | **72.94%** |

Precision, recall and F1 use **vulnerable** as the positive class.

These are saved results from a hand-written exploratory evaluation suite, not an independent benchmark. They do not establish performance on unseen repositories or across every selectable language.

### Run the evaluation

Start the backend with your selected model, then run:

```bash
# Small suite
python tests/test.py

# Larger suite
python tests/test_300.py

# Optional alternative cases file
python tests/test_300.py path/to/test_cases_300.py
```

The evaluation runners call `/api/predict`. Results depend on the active checkpoint, aggregation rule, threshold and chunk limit.

### Frontend build checks

```bash
cd frontend
npm run build
npx tsc --noEmit
```

The build script runs Vite; TypeScript checking is a separate command.

---

## 🔐 Security & testing

VulneraAI includes several security mechanisms designed to protect user accounts and authenticated requests.

| Security control | Purpose |
|---|---|
| Password Hashing | Protects stored passwords by saving password hashes. |
| Email OTP Verification | Helps verify ownership of a registered email address. |
| Server-Side Sessions | Maintains authentication state on the backend. |
| HTTP-Only Cookies | Helps prevent JavaScript from reading the session identifier. |
| CSRF Protection | Helps prevent unauthorized cross-site state-changing requests. |
| SameSite Cookies | Controls when cookies are sent with cross-site requests. |
| Secure Cookie | Supports secure cookie transmission over HTTPS. |
| Session Management | Maintains and manages user sessions in PostgreSQL. |
| Password Reset OTP | Adds email verification to the password recovery process. |
| CORS Configuration | Controls allowed frontend origins. |
| Password Policy | Enforces password strength on signup, change and reset. |
| Rate Limiting | Blocks brute-force attempts with per-endpoint request limits. |
| OTP Attempt Limits | Restricts how many wrong codes are accepted before lockout. |
| Session Revocation | Logout deletes the server-side session, invalidating the cookie. |

### Recommended security checks

- Verify that an account cannot be used before email verification.
- Test invalid and expired OTPs.
- Confirm that the session cookie is not accessible through `document.cookie`.
- Verify that protected endpoints reject unauthenticated requests.
- Verify that missing or invalid CSRF tokens are rejected where required.
- Confirm that logout invalidates the previous session.
- Check that credentials are not stored in browser localStorage.
- Verify CORS restrictions and HTTPS cookie behavior before deployment.

---

## 📌 Limitations & deployment considerations

- **Whole-snippet classification only.** The model does not identify exact vulnerable lines or independently determine vulnerability types.
- **Detection quality is limited.** The saved evaluation misses 42 of 135 vulnerable examples. More diverse training data and independent evaluation are necessary.
- **Partial analysis of long inputs.** The classifier evaluates only the first eight chunks by default, while the LLM receives only the first 12,000 characters.
- **Risk labels are derived.** High and low risk labels are based on the prediction rather than a separately trained severity estimator.
- **External explanation service.** AI explanations depend on the configured LLM API and its availability.
- **Language coverage.** Language options provide context but do not establish equal model accuracy across languages.
- **Production hardening.** HTTPS, Secure cookie settings, moving CORS origins to the production domain, a Redis storage backend for rate limiting, and secret management should be reviewed before public hosting.
- **Security verification.** Cookie flags, CSRF rejection, session invalidation and other negative security tests should be verified independently.
- **Database migrations.** A versioned migration strategy is recommended as the database schema evolves.

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---|---|
| `git: 'lfs' is not a git command` | Install Git LFS, then run `git lfs install && git lfs pull`. |
| Server fails to load the model | Run `git lfs pull` and check the model files. |
| `connection refused` on startup | Make sure PostgreSQL is running and verify `DATABASE_URL`. |
| Database does not exist | Create the database configured in `DATABASE_URL`. |
| `ModuleNotFoundError` | Activate the virtual environment and run `pip install -r backend/requirements.txt`. |
| Email verification fails | Check SMTP credentials, Gmail App Password, server and port in `backend/.env`. |
| Password-reset email fails | Verify SMTP configuration and backend email logs. |
| CSRF error | Refresh the application and check CSRF token retrieval and the `X-CSRF-Token` header. |
| Login/session issue | Check browser cookies, session configuration and PostgreSQL connection. |
| AI explanation unavailable | Check `GEMINI_API_KEY`, `GEMINI_MODEL` and backend logs. |
| Frontend cannot reach backend | Make sure Flask is running on port 5000 and check `VITE_API_URL`. |
| Saved metrics differ | Check the active model directory, scoring rule, threshold and chunk limit. |

---

## 🚧 Future improvements

- Improve vulnerability detection using more diverse training data.
- Add independent evaluation datasets and per-language performance metrics.
- Improve detection of complex vulnerability patterns.
- Add more detailed vulnerability explanations.
- Highlight potentially vulnerable code sections.
- Expand automated authentication and authorization testing.
- Introduce versioned database migrations.
- Add API rate limiting and further deployment hardening.
- Improve model checkpoint packaging and reproducibility.
- Enhance scan reporting and dashboard analytics.

---

<div align="center">

### 🛡️ VulneraAI

**Building safer code with AI-powered analysis.**

[GitHub Repository](https://github.com/HadiaWaheed/VulneraAI)

</div>
