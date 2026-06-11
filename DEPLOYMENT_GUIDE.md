# 🚢 Coolify Deployment Guide for HydraLearn

This guide is optimized for your **GMKtec NUCBox G3 (8GB RAM)**.

## 📦 Deployment Strategy: Dockerized Next.js

Since you are using Coolify, the easiest and most stable way to deploy is using a Dockerfile.

### 1. Database Setup
Before deploying the app, you need a database. 
*   **Option A (Internal):** Use Coolify's "Service" menu to deploy a **PostgreSQL** instance.
*   **Option B (External):** Use **Neon.tech** (Free Tier) for a serverless Postgres DB.
*   **Note:** Once you have the connection string, add it as `DATABASE_URL` in the Coolify Environment Variables.

### 2. Coolify Configuration
1.  **Create New Project** $\rightarrow$ **New Resource** $\rightarrow$ **Public/Private Git Repository**.
2.  **Connect your GitHub/GitLab repo**.
3.  **Build Pack:** Select `Nixpacks` (Coolify's default) or provide a custom `Dockerfile`.
4.  **Environment Variables:** Add everything from your `.env.example`.

### 🚀 Memory Optimization for 8GB RAM
Your NUCBox G3 is capable, but Next.js builds can be RAM-hungry. If you experience "Out of Memory" (OOM) crashes during the build:

1.  **Add a Swap File:** If you haven't already, create a 4GB swap file on your VPS. This prevents the build from crashing.
    ```bash
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    ```
2.  **Limit Build Concurrency:** In your Coolify build settings, if using a custom Dockerfile, ensure you aren't running too many parallel processes.

### 🤖 Running Local LLMs (Ollama)
If you plan to run **Ollama** on the same NUCBox:
*   **Caution:** Llama 3 (8B) will take up ~5GB of your 8GB RAM. 
*   **Tip:** Use a lightweight model like `phi-3` or `tinyllama` if you notice the app slowing down.
*   **Network:** In your `.env`, set `OLLAMA_BASE_URL` to the internal IP of your NUCBox (e.g., `http://172.17.0.1:11434`).

### ✅ Post-Deployment Checklist
1.  **Run Migrations:** After the first deploy, run `npx prisma db push` via the Coolify terminal to initialize the database.
2.  **Verify AI Flows:** Test the "Pedagogical Router" to ensure your API keys are communicating correctly.
3.  **Check Logs:** Monitor the Coolify logs for any `prisma` or `genkit` errors.
