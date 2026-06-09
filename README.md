# DermScan AI — Skin Disease Detection, Diagnosis & Recommended Care

**Detect. Diagnose. Heal.**

A beautiful, functional full-stack web application designed for instant AI skin condition detection, clinical disease details formulation, and personalized dermatological skincare recommendations. Developed for educational, medical-technical research, and sandbox evaluation.

---

## 🔬 Key Features

1. **Secure Session Authentications:** Fully local user signup, login, and token renewals guarded by JWT authorization.
2. **Clinical Skin Scans:** Upload localized photos of affected regions, select active symptoms, and analyze matching disease conditions.
3. **Google Gemini 3.5 Intelligence:** High-fidelity, multi-modal evaluation using Google Gemini models to retrieve detailed diagnosis shapes, severity checks, causes, and warning guidance.
4. **Skincare Product Sourcing:** Sourced, condition-aligned moisturizers, cleansers, ointments, and creams categorized with keys ingredients and clear usage directions.
5. **Care Plan Workspaces:** Structured daily routines (morning & evening), immediate treatment goals, and behavioral lists of triggers/ingredients to avoid.
6. **Permanent Scan Repository:** Searchable, filterable scan history overview to tracking condition progress over time.
7. **Clinical Export Capabilities:** Clean, printer-friendly media styling supporting standard PDF exports via `window.print()`.

---

## 🛠️ Technological Stacks

- **Frontend:** React 18, Vite (Development Server), React Router v6 (Visual Stepper), Tailwind CSS (Aesthetic Dark UI), Axios, React Hot Toast, and Lucide React Icons.
- **Backend Framework:** Node.js Express Server, JWT (`jsonwebtoken` validation), local data file serializers (`database.json` store), static upload resource pipes.
- **AI Processing:** Google Generative AI Developer SDK (`@google/genai`) invoking `'gemini-3.5-flash'` multi-modal models.

---

## 🎨 Creative Design Guidelines

- **Primary Colors:** Royal Violet (`#7c3aed`), Sea foam Emerald (`#06d6a0`), Crimson Red (`#ef476f`), and Dark Blue Charcoal Backgrounds (`#0a0a0f`).
- **Typography:** Display Display Headings use the elegance of `Fraunces` (serif-style headings), while UI labels, badges, and read-lengths apply the legibility of `Plus Jakarta Sans`.

---

## 📈 Local Setup Guidelines

Ensure Node.js 18+ is installed on your computer.

### Step-by-Step Installation:

1. **Extract/Clone codebase:** Locate folder space on your local computer disk.
2. **Configure local Secrets:**
   Create a `.env` file at the root folder path. Include matching keys from `.env.example`:
   ```env
   GEMINI_API_KEY="AI_STUDIO_GEMINI_KEY"
   SECRET_KEY="your-jwt-auth-secret-key-change-it"
   ```
   *Note: Standard Google AI Studio API Keys can be retrieved for free at [Google AI Studio Console](https://aistudio.google.com).*

3. **Install Client-Server Dependencies:**
   Run the following terminal command from the project root:
   ```bash
   npm install
   ```

4. **Launch Local Dev Server:**
   Boot both Express backend controllers and Vite UI routing over port 3000:
   ```bash
   npm run dev
   ```

5. **Interact with DermScan AI:**
   Open [http://localhost:3000](http://localhost:3000) inside your web browser.

---

## ⚙️ Compilation & Production Build

To bundle static frontend routes into minimized distributives and compile server TypeScript endpoints using fast CJS compilers:

```bash
npm run build
```

Run in production:
```bash
npm run start
```

---

## ⚠️ Educational Advisory Disclaimer

This web application holds purely advisory and informational outputs. It has been formulated as a university computer engineering final year thesis presentation. Under no conditions should DermScan AI outputs be used to substitute formal primary physician or clinical dermatologist guidelines.
