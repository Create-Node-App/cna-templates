import Image from "next/image";
import styles from "./page.module.css";

const quickStartSteps = [
  {
    title: "Shape your first route",
    description: "Update this page or add a new route under src/app to define your app flow.",
  },
  {
    title: "Add a feature slice",
    description: "Group UI, hooks, services, and types by feature so the codebase stays easy to scale.",
  },
  {
    title: "Ship with confidence",
    description: "Use the built-in format, lint, and type-check scripts as you grow the starter.",
  },
];

const starterChecklist = [
  "Edit src/app/page.tsx to reflect your product",
  "Create your first feature inside src/features",
  "Run npm run dev and start iterating",
];

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <span className={styles.badge}>Create Awesome Node App</span>
        <div className={styles.brand}>
          <div className={styles.brandMark}>
            <Image
              className={styles.logo}
              src="/next.svg"
              alt="Next.js Logo"
              width={136}
              height={28}
              priority
            />
          </div>
          <p className={styles.hint}>Setup complete. Your Next.js starter is ready to become a product.</p>
        </div>
        <h1 className={styles.title}>Start with a clean feature-based foundation.</h1>
        <p className={styles.lead}>
          This template gives you a lightweight App Router setup that is easy to shape, extend, and pair with the
          compatible CNA addons.
        </p>
        <div className={styles.description}>
          <p>
            First edit:&nbsp;
            <code className={styles.code}>src/app/page.tsx</code>
          </p>
          <p>
            Feature home:&nbsp;
            <code className={styles.code}>src/features</code>
          </p>
        </div>
      </section>

      <section className={styles.grid}>
        {quickStartSteps.map((step) => (
          <article key={step.title} className={styles.card}>
            <h2>{step.title}</h2>
            <p>{step.description}</p>
          </article>
        ))}
      </section>

      <section className={styles.checklist}>
        <div>
          <h2>Quick start checklist</h2>
          <ul className={styles.list}>
            {starterChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <a
          href="https://nextjs.org/docs"
          className={styles.resource}
          target="_blank"
          rel="noopener noreferrer"
        >
          Explore the Next.js docs
        </a>
      </section>

      <div className={styles.footer}>
        <Image
          src="/next.svg"
          alt="Next.js Logo"
          width={96}
          height={20}
        />
        <span>Polished starter, minimal assumptions, ready for compatible addons.</span>
      </div>
    </main>
  );
}
