# AdaptIQ — Adaptive Student Question Recommender

A full-stack adaptive learning web app built with Next.js 14, Prisma, SQLite, TypeScript, and Tailwind CSS.

---

## Features

- **CSV Upload** — parse and store student attempt records
- **Skill Engine** — per-topic skill estimation from correctness and difficulty
- **Recommendation Engine** — optimal-challenge questions tailored to skill level
- **Dashboard** — skill cards, weakest topic, overall accuracy, recommendations
- **Question Bank** — filterable table of all questions with stats
- **Practice and Reflection** — practice with your stored questions and write reflections

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm 9+

### 1. Clone and install

```bash
git clone https://github.com/your-username/adaptive-learning.git
cd adaptive-learning
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

`.env` should contain:

```
DATABASE_URL="file:./dev.db"
```

### 3. Run Prisma migrations

```bash
npx prisma migrate dev --name init
```

This creates the SQLite database at `prisma/dev.db`.

### 4. (Optional) Open Prisma Studio

```bash
npm run db:studio
```

### 5. Start development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## CSV Format

Upload CSV files with the following headers:

```
questionId,text,topic,difficulty,correct
q1,Solve for x: 2x + 3 = 7,Algebra,3,true
q2,Expand (x+2)(x-3),Algebra,4,false
q3,Find P(A∪B) given P(A)=0.3,Probability,2, 
```

| Column | Type | Valid Values |
|---|---|---|
| questionId | string | any non-empty string |
| text | string | the question content |
| topic | string | any non-empty string |
| difficulty | integer | 1–5 |
| correct | optional boolean | `true` or `false` or None |

**Notes:**
- `questionId` is your external identifier (e.g. `q1`, `alg-042`). The database stores it as a unique lookup key; the primary key used internally is a UUID.
- `StudentAttempt.questionId` is a foreign key pointing to `Question.id` (UUID) — the upload route resolves this automatically.
- If a question with the same `questionId` already exists, its `text` is updated and attempt stats are incremented.
- Duplicate attempts (same question + outcome on the same calendar day) are skipped.

---

## Recommendation Logic

1. **Skill per topic** = `avg(difficulty of correct attempts) + 0.5 × avg(difficulty of incorrect attempts)`, clamped to `[1, 5]`
2. **Challenge band** = questions where `skill ≤ difficulty ≤ skill + 1`
3. **Excluded**: questions attempted in the past 7 days, or with success rate > 85%
4. **Ranked** by: closest to `skill + 0.5`, then fewest attempts

---

## Deploying to Vercel

> **Important:** SQLite is a local file-based database and is **not suitable for production on Vercel** (serverless functions have ephemeral filesystems). For production, switch to a hosted database.

### Recommended production DB swap

Replace SQLite with [Turso](https://turso.tech/) (libSQL) or [PlanetScale](https://planetscale.com/) (MySQL):

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### Deploy steps

1. Push repo to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Set `DATABASE_URL` in Vercel environment variables
4. Vercel auto-detects Next.js and runs:
   ```
   prisma generate && next build
   ```
5. Deploy

---

## Project Structure

```
adaptive-learning/
├── prisma/
│   └── schema.prisma          # Database models
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/        # POST /api/upload
│   │   │   ├── skill-stats/   # GET /api/skill-stats
│   │   │   ├── questions/     # GET /api/questions
│   │   │   └── recommendations/ # GET /api/recommendations
│   │   ├── dashboard/         # Dashboard page
│   │   ├── upload/            # Upload page
│   │   ├── question-bank/     # Question bank page
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── SkillCard.tsx
│   │   ├── RecommendationCard.tsx
│   │   ├── DifficultyBadge.tsx
│   │   └── StatSummary.tsx
│   ├── lib/
│   │   ├── prisma.ts          # Prisma singleton
│   │   ├── csvParser.ts       # CSV parsing + validation
│   │   ├── skillEngine.ts     # Skill computation
│   │   └── recommendationEngine.ts # Recommendation logic
│   └── types/
│       └── index.ts           # Shared TypeScript types
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── package.json
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Prisma database connection string | `file:./dev.db` |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:push` | Push schema without migration |
| `npm run db:studio` | Open Prisma Studio |
