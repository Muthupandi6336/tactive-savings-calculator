# Tactive Savings Calculator & Sandbox

A modern, interactive financial analysis and simulation dashboard designed for construction CEOs to estimate project financial leaks ("bleed") and visualize how Tactive's modules recover lost funds.

Inspired by the official [Tactive Construction Software](https://tactive.in/) platform.

Live Site: **[https://Muthupandi6336.github.io/tactive-savings-calculator/](https://Muthupandi6336.github.io/tactive-savings-calculator/)**

---

## 🚀 Key Features

*   **Financial Leak Calculator**: Instantly estimates project losses across five key areas (Material Wastage, Idle Machinery, Labor Inefficiency, Schedule Overruns, and Rework & Defects) based on budget, duration, and workforce size.
*   **Tactive Recovery Plan**: Dynamically displays how Tactive's tracking modules recover lost funds, showing net savings, ROI, and payback period.
*   **Interactive Sandbox (Dashboard Simulation)**:
    *   *Material Tracking*: Live inventory stock levels, critical reorder limits, and warning triggers.
    *   *Equipment Monitor*: Real-time utilization rates, status grid (active/idle/maintenance), and optimization metrics.
    *   *Labor Productivity*: Zone-wise efficiency heatmap and weekly attendance-productivity trends.
    *   *Financial Overview*: Cumulative savings line graph over time vs. subscription cost.
*   **Instant PDF Downloads**: Generates customized financial summaries. Uses a zero-dependency client-side PDF renderer when hosted statically on GitHub Pages, and a FastAPI generator when backend services are active.

---

## 🛠️ Technology Stack

*   **Frontend**: Vite, Vanilla JavaScript, Chart.js (v4), jsPDF.
*   **Backend**: Python FastAPI, Uvicorn (async server), databases (aiosqlite/asyncpg), fpdf2 (lightweight PDF generation).
*   **Database**: SQLite (for local development) and PostgreSQL (for production lead collection).

---

## 💻 Local Setup & Running

### 1. Run the Frontend (Vite)
Open your terminal in the root folder and run:
```bash
# Install packages
npm install

# Run the local development server (port 3000)
npm run dev
```

### 2. Run the Backend (FastAPI)
Navigate to the `backend` folder and configure a virtual environment:
```bash
cd backend

# Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Start the uvicorn development server (port 8000)
uvicorn main:app --reload
```

---

## 📦 Deployment

### Deploy to GitHub Pages (Static Hosting)
Deploying updates to your live site takes just one command:
```bash
npm run deploy
```
*(This automatically runs Vite build and pushes the static assets from the `dist/` directory directly to your `gh-pages` branch).*

---

## ⚖️ Portfolio Disclaimer

This project is an **independent portfolio case study** created for educational and interview demonstration purposes. It is not an official tool released by, affiliated with, or endorsed by Tactive Technologies. 

All Tactive product module concepts (Material Tracking, Equipment Alerts, etc.) and names mentioned in this project are properties of their respective trademark owners, showcased here purely to demonstrate technical fullstack capabilities.
