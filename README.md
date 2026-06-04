<a href="https://datagraph.app/">
<img alt="Datagraph" src="./public/og.jpg">
</a>

<div align="center">
    <h1>Datagraph</h1>
    <p>
        A precision instrument for your spreadsheets. Upload a CSV, ask in plain
        English, and get the code, the chart, and the answer — plotted,
        sandboxed, and reproducible.
    </p>
</div>

## Tech Stack

- **Frontend**: Next.js (App Router), React 19, TypeScript, Tailwind CSS v4
- **Cerebras LLM**: Generates Python code to answer questions and visualize data
- **E2B Sandbox**: Executes Python code safely and returns results
- **Upstash Redis**: Rate limiting + chat/session persistence
- **UploadThing**: CSV file uploads

## How it works

1. User uploads a CSV file
2. The app analyzes the CSV headers and suggests insightful questions
3. User asks a question about the data
4. Cerebras generates Python code to answer the question
5. The E2B sandbox runs the code and returns results (including charts)
6. All sessions and results are stored in Upstash Redis for fast retrieval

## Cloning & running

1. Fork or clone the repo
2. Create accounts at [Cerebras](https://cloud.cerebras.ai/), [E2B](https://e2b.dev/), [Upstash](https://upstash.com/), and [UploadThing](https://uploadthing.com/)
3. Create a `.env` file and add your API keys:
   - `CEREBRAS_API_KEY`
   - `E2B_API_KEY`
   - `UPLOADTHING_TOKEN`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Run `npm install` and `npm run dev` to install dependencies and start the app locally

Open [http://localhost:3000](http://localhost:3000) to use Datagraph.

---

Copyright (c) 2026 Montassar Hajri. All rights reserved.
