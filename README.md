# EduProof 🎓🛡️

[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel-success?logo=vercel)](https://eduproff-nu.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com/)

**EduProof** is an enterprise-grade digital credential and certificate verification platform. It enables educational institutions to issue tamper-proof certificates, candidates to manage their verified credentials, and recruiters to instantly validate candidate qualifications with transparent cryptographic trust scores.

---

## 🌟 Key Features

* **Instant Certificate Verification**: Upload certificate PDFs with unique IDs for immediate validation against institutional records.
* **Algorithmic Trust Score**: Real-time 0–100% confidence score with detailed inspection logs (issuer authenticity, date consistency, tamper detection).
* **Role-Based Portals**:
  * **Candidates**: Upload credentials, view verification badges, and generate AI-powered CVs.
  * **Recruiters**: Search talent, batch-verify certificates, and track candidate audit histories.
  * **Educational Institutions**: Securely issue and manage certificates with unique serials.
* **Safar AI Assistant**: Built-in credential advisor supporting trilingual queries (English, Hindi, Hinglish) with instant verification guidance and platform navigation.
* **Tactile Micro-Interactions**: Modern responsive interface with 3D card elevation, smooth hover feedback, and accessible themes.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, TypeScript, Vite
* **Styling & UI**: Tailwind CSS, Radix UI primitives, Lucide Icons, Shadcn UI
* **Backend & Auth**: Supabase (PostgreSQL, Row-Level Security, Edge Functions, GoTrue Auth)
* **Testing & Quality**: Vitest, ESLint

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* npm or bun

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Tanmay28122007/eduproff.git
   cd eduproff
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="<your-publishable-key>"
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:8080](http://localhost:8080) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🔒 Security & Privacy

* Credentials and certificates are verified against institutional records using secure Row-Level Security (RLS) policies.
* Sensitive service role credentials are kept strictly in backend secrets and never exposed in client bundles.
* PDF uploads are validated for MIME type, file integrity, and size limits before processing.

---

## 📄 License

This project is licensed under the MIT License.
