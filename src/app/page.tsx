"use client";

import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { ArrowRight, Droplets, Sparkles, PackageCheck, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// ---------------------------------------------------------------------------
// Content — kept as typed data so copy changes never touch markup/animation.
// ---------------------------------------------------------------------------

interface Piece {
  id: string;
  name: string;
  price: string;
  gradient: string; // CSS background value standing in for a product photo
}

const PIECES: Piece[] = [
  {
    id: "honeyglass",
    name: "Honeyglass Coasters",
    price: "$34",
    gradient:
      "radial-gradient(130% 130% at 30% 70%, #ffe9a8 0%, #f7c948 35%, #a85d10 75%, #1a1200 100%)",
  },
  {
    id: "amber-vein",
    name: "Amber Vein Tray",
    price: "$64",
    gradient:
      "conic-gradient(from 210deg at 50% 50%, #f5c518, #a85d10, #e8951f, #ffe9a8, #f5c518)",
  },
  {
    id: "sunwell",
    name: "Sunwell Catchall",
    price: "$28",
    gradient:
      "radial-gradient(120% 140% at 70% 25%, #fff3cf 0%, #f7c948 40%, #7a4a0c 80%, #150f02 100%)",
  },
  {
    id: "goldpour",
    name: "Goldpour Coaster Set",
    price: "$38",
    gradient:
      "radial-gradient(120% 120% at 25% 20%, #f5c518 0%, #e8951f 45%, #4a2c06 85%, #150f02 100%)",
  },
];

interface ProcessStep {
  index: string;
  title: string;
  copy: string;
  icon: ReactNode;
}

const PROCESS: ProcessStep[] = [
  {
    index: "01",
    title: "Pour",
    copy: "Pigment and resin are folded together, then poured freehand — no two pours move the same way.",
    icon: <Droplets className="h-5 w-5" strokeWidth={1.5} />,
  },
  {
    index: "02",
    title: "Cure",
    copy: "48 hours resting undisturbed while the layers settle and the depth of color forms.",
    icon: <Sparkles className="h-5 w-5" strokeWidth={1.5} />,
  },
  {
    index: "03",
    title: "Sand & polish",
    copy: "Wet-sanded through six grits by hand, finishing to a glass-clear shine.",
    icon: <Wand2 className="h-5 w-5" strokeWidth={1.5} />,
  },
  {
    index: "04",
    title: "Pack & ship",
    copy: "Wrapped in-house and boxed the same week your piece is finished.",
    icon: <PackageCheck className="h-5 w-5" strokeWidth={1.5} />,
  },
];

function goToAuth() {
  window.location.href = "/auth";
}

// ---------------------------------------------------------------------------
// MagneticWrap — makes any button feel like it has weight, pulling gently
// toward the cursor as it enters and settling back with a spring on exit.
// ---------------------------------------------------------------------------

function MagneticWrap({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 15, mass: 0.4 });
  const y = useSpring(0, { stiffness: 200, damping: 15, mass: 0.4 });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// DripTrail — a small train of amber droplets that trails the cursor
// through the hero, each one a shade further down the gold spectrum,
// like light dragging through resin as it's poured.
// ---------------------------------------------------------------------------

function DripTrail({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  const prefersReducedMotion = useReducedMotion();
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  const drops = [
    { size: 14, color: "#ffe9a8", stiffness: 700, damping: 40 },
    { size: 11, color: "#f7c948", stiffness: 420, damping: 38 },
    { size: 9, color: "#f5c518", stiffness: 280, damping: 36 },
    { size: 7, color: "#e8951f", stiffness: 190, damping: 34 },
    { size: 5, color: "#a85d10", stiffness: 130, damping: 32 },
  ];

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: globalThis.MouseEvent) => {
      const rect = el.getBoundingClientRect();
      rawX.set(e.clientX - rect.left);
      rawY.set(e.clientY - rect.top);
    };

    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [containerRef, prefersReducedMotion, rawX, rawY]);

  if (prefersReducedMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block">
      {drops.map((drop, i) => (
        <TrailDot key={i} rawX={rawX} rawY={rawY} {...drop} />
      ))}
    </div>
  );
}

function TrailDot({
  rawX,
  rawY,
  size,
  color,
  stiffness,
  damping,
}: {
  rawX: ReturnType<typeof useMotionValue<number>>;
  rawY: ReturnType<typeof useMotionValue<number>>;
  size: number;
  color: string;
  stiffness: number;
  damping: number;
}) {
  const x = useSpring(rawX, { stiffness, damping });
  const y = useSpring(rawY, { stiffness, damping });
  return (
    <motion.div
      style={{
        x,
        y,
        width: size,
        height: size,
        background: color,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        boxShadow: `0 0 ${size}px ${color}55`,
      }}
      className="absolute rounded-full opacity-70 blur-[1px]"
    />
  );
}

// ---------------------------------------------------------------------------
// Signature element: "The Living Pour"
// An organic blob that morphs like resin settling mid-pour, tilts toward
// the cursor, carries a gold vein of light traveling across it, sits atop
// slow-drifting ambient color layers, and splashes gold droplets on click.
// ---------------------------------------------------------------------------

interface Splash {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
}

function LivingPour() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [splashes, setSplashes] = useState<Splash[]>([]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 120,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 120,
    damping: 20,
  });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  function handleClick() {
    if (prefersReducedMotion) return;
    const colors = ["#ffe9a8", "#f7c948", "#f5c518", "#e8951f"];
    const burst: Splash[] = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i,
      angle: (360 / 10) * i + Math.random() * 20,
      distance: 90 + Math.random() * 60,
      size: 6 + Math.random() * 8,
      color: colors[i % colors.length],
    }));
    setSplashes((prev) => [...prev, ...burst]);
    window.setTimeout(() => {
      setSplashes((prev) => prev.filter((s) => !burst.includes(s)));
    }, 900);
  }

  const blobRadii = [
    "62% 38% 55% 45% / 45% 55% 45% 55%",
    "45% 55% 40% 60% / 60% 40% 60% 40%",
    "55% 45% 65% 35% / 40% 60% 35% 65%",
    "62% 38% 55% 45% / 45% 55% 45% 55%",
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      className="relative mx-auto flex h-[320px] w-[320px] items-center justify-center sm:h-[420px] sm:w-[420px]"
    >
      {/* ambient drifting color layers — painterly depth behind the pour */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            animate={{ x: [0, 24, -10, 0], y: [0, -18, 12, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute h-2/3 w-2/3 rounded-full opacity-30 blur-3xl"
            style={{ background: "#f7c948" }}
          />
          <motion.div
            animate={{ x: [0, -20, 16, 0], y: [0, 16, -14, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute h-1/2 w-1/2 translate-x-10 translate-y-8 rounded-full opacity-25 blur-3xl"
            style={{ background: "#e8951f" }}
          />
        </>
      )}

      <div className="relative h-full w-full cursor-pointer">
        <Image src={"./upscaled_720x720_nobg.png"} alt="Logo"/>
      </div>

      {/* click-triggered gold splash */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <AnimatePresence>
          {splashes.map((s) => (
            <motion.span
              key={s.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos((s.angle * Math.PI) / 180) * s.distance,
                y: Math.sin((s.angle * Math.PI) / 180) * s.distance,
                opacity: 0,
                scale: 0.4,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="absolute rounded-full"
              style={{ width: s.size, height: s.size, background: s.color }}
            />
          ))}
        </AnimatePresence>
      </div>

      {!prefersReducedMotion && (
        <span className="pointer-events-none absolute -bottom-8 text-center text-xs text-[var(--muted-foreground)]">
          click the pour
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TiltCard — a product tile that leans toward the cursor in 3D with a
// sheen of light gliding across it, like glass catching a moving light.
// ---------------------------------------------------------------------------

function TiltCard({ piece }: { piece: Piece }) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [8, -8]), { stiffness: 200, damping: 22 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-8, 8]), { stiffness: 200, damping: 22 });
  const glareX = useTransform(px, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(py, [0, 1], ["0%", "100%"]);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -6 }}
      style={{ rotateX, rotateY, perspective: 800 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)]"
    >
      <div
        className="h-48 w-full transition-transform duration-700 group-hover:scale-[1.04]"
        style={{ background: piece.gradient }}
      />
      {!prefersReducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(180px circle at ${glareX} ${glareY}, rgba(255,251,232,0.35), transparent 60%)`,
          }}
        />
      )}
      <div className="relative flex items-center justify-between px-4 py-4">
        <span className="text-sm text-[var(--foreground)]">{piece.name}</span>
        <span className="text-sm text-[var(--muted-foreground)]">{piece.price}</span>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Floating motes — a handful of suspended glitter specks drifting upward,
// like the flecks of gold leaf folded into a real resin pour.
// ---------------------------------------------------------------------------

interface Mote {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

function FloatingMotes({ count = 14 }: { count?: number }) {
  const prefersReducedMotion = useReducedMotion();
  // Randomized purely on the client, after mount — the server render and
  // the client's first render both output nothing, so there's nothing for
  // hydration to mismatch on. The motes pop in a beat after paint, which
  // is invisible for a slow ambient decoration like this.
  const [motes, setMotes] = useState<Mote[] | null>(null);

  useEffect(() => {
    setMotes(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.round(Math.random() * 100),
        delay: Math.random() * 8,
        duration: 10 + Math.random() * 10,
        size: 2 + Math.random() * 3,
      }))
    );
  }, [count]);

  if (prefersReducedMotion || !motes) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {motes.map((m) => (
        <motion.span
          key={m.id}
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: "-10%", opacity: [0, 0.8, 0.8, 0] }}
          transition={{
            duration: m.duration,
            delay: m.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute rounded-full bg-[var(--resin-marigold,#f5c518)]"
          style={{ left: `${m.left}%`, width: m.size, height: m.size }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small reveal-on-scroll wrapper, used throughout instead of a global
// scroll library — keeps the motion vocabulary consistent and light.
// ---------------------------------------------------------------------------

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const MARQUEE_ITEMS = [
  "Hand-poured",
  "Small batch",
  "Never repeated",
  "Cured 48 hours",
  "Individually numbered",
];

export default function ResinLanding() {
  const [scrolled, setScrolled] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: pageRef });
  const washOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.15, 0.06, 0.06, 0.12]);
  const washBackground = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      "radial-gradient(60% 40% at 50% 0%, #f7c948 0%, transparent 70%)",
      "radial-gradient(60% 40% at 50% 0%, #e8951f 0%, transparent 70%)",
      "radial-gradient(60% 40% at 50% 0%, #a85d10 0%, transparent 70%)",
    ]
  );

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={pageRef} className="resin-landing relative min-h-screen w-full overflow-x-hidden">
      {/* ambient scroll-linked wash, sits behind everything */}
      <motion.div
        aria-hidden
        style={{ opacity: washOpacity, background: washBackground }}
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[70vh] blur-3xl"
      />

      {/* ---------------------------------------------------------------- */}
      {/* Nav                                                              */}
      {/* ---------------------------------------------------------------- */}
      <header
        className={`sticky top-0 z-40 flex items-center justify-between px-6 py-5 transition-colors duration-300 sm:px-10 ${
          scrolled ? "bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border)]" : ""
        }`}
      >
        <span className="font-display text-lg font-semibold tracking-tight text-[var(--foreground)]">
          AIJ Creations
        </span>
        <nav className="flex items-center gap-6">
          <a
            href="#pieces"
            className="hidden text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] sm:inline"
          >
            Pieces
          </a>
          <a
            href="#process"
            className="hidden text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] sm:inline"
          >
            The process
          </a>
          <MagneticWrap strength={0.3}>
            <Button size="sm" variant="secondary" onClick={goToAuth}>
              Sign in
            </Button>
          </MagneticWrap>
        </nav>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section
        ref={heroRef}
        className="grain relative mx-auto flex max-w-6xl flex-col-reverse items-center gap-10 px-6 pb-16 pt-10 sm:px-10 md:flex-row md:gap-6 md:pb-20 md:pt-16"
      >
        <DripTrail containerRef={heroRef} />

        <div className="relative z-10 flex-1 text-center md:text-left">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
          >
            Hand-poured in small batches
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl font-medium leading-[1.05] text-[var(--foreground)] sm:text-5xl md:text-6xl"
          >
            Every pour tells a
            <br className="hidden md:block" /> different{" "}
            <span className="gradient-text">story.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-5 max-w-md text-base leading-relaxed text-[var(--muted-foreground)] md:mx-0"
          >
            Coasters, trays, and small objects cast in resin — cured slow,
            finished bright, and never repeated twice.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:justify-start"
          >
            <MagneticWrap>
              <Button size="lg" className="group" onClick={goToAuth}>
                Sign in to shop
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </MagneticWrap>
            <a
              href="/auth"
              className="text-sm text-[var(--muted-foreground)] underline-offset-4 transition-colors hover:text-[var(--foreground)] hover:underline"
            >
              New here? Create an account
            </a>
          </motion.div>
        </div>

        <div className="relative z-10 flex-1">
          <LivingPour />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Marquee strip                                                     */}
      {/* ---------------------------------------------------------------- */}
      <div className="relative overflow-hidden border-y border-[var(--border)] bg-[var(--card)]/40 py-3">
        <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
            >
              {item}
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
            </span>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Featured pieces                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section id="pieces" className="relative mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
        <FloatingMotes count={10} />
        <Reveal>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
            From the studio
          </p>
          <h2 className="font-display mt-3 max-w-lg text-3xl font-medium text-[var(--foreground)] sm:text-4xl">
            A small run, freshly cured.
          </h2>
        </Reveal>

        <div className="relative mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PIECES.map((piece, i) => (
            <Reveal key={piece.id} delay={i * 0.08}>
              <TiltCard piece={piece} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Process                                                           */}
      {/* ---------------------------------------------------------------- */}
      <section id="process" className="bg-[var(--card)]/40 border-y border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
              How it&apos;s made
            </p>
            <h2 className="font-display mt-3 max-w-lg text-3xl font-medium text-[var(--foreground)] sm:text-4xl">
              Four steps. Nothing rushed.
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((step, i) => (
              <Reveal key={step.index} delay={i * 0.1}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-sm text-[var(--accent)]">
                      {step.index}
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)]/15 text-[var(--primary)]">
                      {step.icon}
                    </span>
                  </div>
                  <h3 className="font-display text-lg text-[var(--foreground)]">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {step.copy}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Closing CTA                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative mx-auto max-w-3xl px-6 py-24 text-center sm:px-10 sm:py-32">
        <FloatingMotes count={8} />
        <Reveal>
          <h2 className="font-display text-3xl font-medium text-[var(--foreground)] sm:text-4xl">
            Ready to bring one home?
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-[var(--muted-foreground)]">
            Sign in to see new pours as they cure, and get first access to
            each small batch before it lists.
          </p>
          <div className="mt-8 flex justify-center">
            <MagneticWrap>
              <Button size="lg" onClick={goToAuth}>
                Sign in to shop
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </MagneticWrap>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Footer                                                            */}
      {/* ---------------------------------------------------------------- */}
      <footer className="border-t border-[var(--border)] px-6 py-8 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-[var(--muted-foreground)] sm:flex-row">
          <span>© {new Date().getFullYear()} AIJ Creations. Poured by hand.</span>
        </div>
      </footer>
    </div>
  );
}