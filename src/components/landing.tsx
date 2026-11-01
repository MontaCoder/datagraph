import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Papa from "papaparse";
import { GITHUB_REPO } from "@/lib/utils";
import { SITE_METRICS } from "@/lib/site";
import { ThemeToggle } from "@/components/ui";
import { Plot, type PlotRow } from "@/components/plot";

/* ─────────────────────────────────────────────────────────────
   landing — the sheet. the hero is the shipped sample file,
   plotted and readable by cursor. then the path, the code that
   was written, the one reading that matters, and the terms.
   ───────────────────────────────────────────────────────────── */

const FILE = "products-100.csv";
const CSV = readFileSync(join(process.cwd(), "public", FILE), "utf8");
const ROWS: PlotRow[] = Papa.parse<{ Name: string; Price: string }>(CSV, {
  header: true,
  skipEmptyLines: true,
})
  .data.map((row) => ({ name: row.Name, price: Number(row.Price) }))
  .sort((a, b) => a.price - b.price);

const NAV = [
  { href: "#path", label: "the path" },
  { href: "#specimen", label: "specimen" },
  { href: `https://github.com/${GITHUB_REPO}`, label: "source", ext: true },
];

const PATH = [
  { node: "csv", note: "the file lands, headers and shape read" },
  { node: "model", note: "writes the python, names its plan" },
  { node: "sandbox", note: "runs it in e2b, nothing escapes" },
  { node: "figure", note: "the chart, the number, the code" },
];

const CODE = `import matplotlib.pyplot as plt

monthly = df.groupby(df['date'].dt.month)['revenue'].sum()
ax = monthly.plot(kind='bar', color='#3f6fd8')
ax.set_title('Revenue by month')
plt.tight_layout()
plt.savefig('chart.png')
print(monthly.pct_change().tail(3))`;

const TERMS = [
  { t: "sandboxed python", d: "every chart and number comes from code running in an isolated e2b sandbox." },
  { t: "open and ephemeral", d: "mit licensed. csvs are stored only as long as the question needs them." },
  { t: "no account", d: "open the app, drop a file, ask. daily credits cover the trying." },
];

function Nav() {
  return (
    <header className="nav">
      <Link href="/" className="wordmark">
        Datagraph
      </Link>
      <div className="nav-links">
        {NAV.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            target={l.ext ? "_blank" : undefined}
            rel={l.ext ? "noopener noreferrer" : undefined}
          >
            {l.label}
          </Link>
        ))}
        <ThemeToggle className="size-9" />
        <Link href="/app" className="btn">
          open the app
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" aria-label="Introduction">
      <div className="intro">
        <h1>the file holds the answer.</h1>
        <p className="lead">upload a csv, ask in plain english, and read the chart.</p>
        <div className="intro-act">
          <Link href="/app" className="btn btn-primary btn-lg">
            plot a csv
          </Link>
          <a href="#specimen" className="btn btn-lg">
            read a specimen
          </a>
        </div>
        <p className="note">free daily credits, no account. the csv stays ephemeral.</p>
      </div>
      <Plot rows={ROWS} file={FILE} />
    </section>
  );
}

function Path() {
  return (
    <section id="path" className="sec">
      <div className="wrap">
        <div className="panel">
          <div className="panel-head">
            <h2>the path a question takes</h2>
            <p>four steps, in the open. the code that runs is shown with every reply.</p>
          </div>
          <ol className="trail">
            {PATH.map((step, i) => (
              <li key={step.node}>
                <span className="step">{String(i + 1).padStart(2, "0")}</span>
                <h3>{step.node}</h3>
                <p>{step.note}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Specimen() {
  return (
    <section id="specimen" className="sec">
      <div className="wrap">
        <div className="panel split">
          <div className="split-copy">
            <h2>one question, dissected</h2>
            <p className="quote">
              &ldquo;how did revenue trend through the year, and where did it accelerate?&rdquo;
            </p>
            <p>the code arrives with the answer, so the work can be checked or rerun.</p>
          </div>
          <div className="code-cell screen">
            <div className="cell-head">
              <span>solution.py</span>
              <span>python</span>
              <span>{SITE_METRICS.demoModel}</span>
            </div>
            <pre className="code">{CODE}</pre>
            <div className="cell-head">
              <span>stdout</span>
              <span>tail(3)</span>
            </div>
            <pre className="stdout">
              <b>10</b>    0.126{"\n"}
              <b>11</b>    0.188{"\n"}
              <b>12</b>    0.241{"\n"}
              name: revenue, dtype: float64
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function Figure() {
  return (
    <section className="band" aria-label="Context window">
      <div className="wrap reading-row">
        <div>
          <p className="reading">{SITE_METRICS.tokenContext}</p>
          <p className="fig-label">tokens of context</p>
        </div>
        <div>
          <h2>the whole file stays in view</h2>
          <p>
            headers, sample rows and the conversation all fit, so the model works from the whole
            file instead of a summary of it.
          </p>
        </div>
      </div>
    </section>
  );
}

function Terms() {
  return (
    <section className="sec" aria-label="Terms">
      <div className="wrap">
        <dl className="rows">
          {TERMS.map((term) => (
            <div className="row" key={term.t}>
              <dt>{term.t}</dt>
              <dd>{term.d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Close() {
  return (
    <section className="band sec-s" aria-label="Start">
      <div className="wrap close-row">
        <div>
          <h2 className="close-head">plot a csv</h2>
          <p>the first chart is usually one question away.</p>
        </div>
        <Link href="/app" className="btn btn-primary btn-lg">
          open the app
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <p className="foot-line">bring the file. ask it something.</p>
        <div className="foot-row">
          <nav aria-label="Footer">
            <Link href="/app">the app</Link>
            <a href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noopener noreferrer">
              source
            </a>
            <a href={`https://github.com/${GITHUB_REPO}/issues`} target="_blank" rel="noopener noreferrer">
              issues
            </a>
          </nav>
          <p>{new Date().getFullYear()}, plotted daily</p>
        </div>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <div>
      <Nav />
      <main>
        <Hero />
        <Path />
        <Specimen />
        <Figure />
        <Terms />
        <Close />
      </main>
      <Footer />
    </div>
  );
}
