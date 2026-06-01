"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import * as THREE from "three";
import { ArrowUpRight, Instagram, Phone, Sparkles } from "lucide-react";
import { portfolio } from "@/data/portfolio";

type Asset = {
  src: string;
  width: number;
  height: number;
};

type Page = {
  page: number;
  title: string;
  category: string;
  text: string;
  assets: readonly Asset[];
};

const categories = portfolio.categories.filter((category) => category.pages.length);
const allPages = portfolio.pages.filter((page) => page.assets.length) as readonly Page[];
const heroImage = allPages.find((page) => page.page === 2)?.assets.at(-1) || allPages[0]?.assets[0];
const posterPages = allPages.filter((page) => page.category === "Social Media Posters");

function SoundBridge() {
  useEffect(() => {
    const controller = {
      enabled: false,
      trigger(eventName: string) {
        window.dispatchEvent(new CustomEvent("portfolio:sound-cue", { detail: { eventName } }));
      },
    };
    Object.assign(window, { portfolioAudio: controller });
  }, []);

  return null;
}

function Cursor() {
  const cursor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (!cursor.current) return;
      gsap.to(cursor.current, {
        x: event.clientX,
        y: event.clientY,
        duration: 0.18,
        ease: "power3.out",
      });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div
      ref={cursor}
      className="custom-cursor pointer-events-none fixed left-0 top-0 z-[80] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blood bg-blood/10 mix-blend-difference"
    />
  );
}

function ThreeAtmosphere() {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mount.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mount.current.clientWidth / mount.current.clientHeight, 0.1, 100);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(mount.current.clientWidth, mount.current.clientHeight);
    mount.current.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const count = 260;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count * 3; index += 3) {
      positions[index] = (Math.random() - 0.5) * 8;
      positions[index + 1] = (Math.random() - 0.5) * 5;
      positions[index + 2] = (Math.random() - 0.5) * 5;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xd41421, size: 0.018, transparent: true, opacity: 0.55 });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      points.rotation.y += 0.0009;
      points.rotation.x += 0.0004;
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      if (!mount.current) return;
      camera.aspect = mount.current.clientWidth / mount.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.current.clientWidth, mount.current.clientHeight);
    };
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      mount.current?.replaceChildren();
    };
  }, []);

  return <div ref={mount} className="pointer-events-none absolute inset-0 opacity-70" />;
}

function MagneticButton({ children, href }: { children: React.ReactNode; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);

  const move = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    ref.current?.style.setProperty("--mx", `${(event.clientX - box.left - box.width / 2) * 0.16}px`);
    ref.current?.style.setProperty("--my", `${(event.clientY - box.top - box.height / 2) * 0.16}px`);
  };

  const reset = () => {
    ref.current?.style.setProperty("--mx", "0px");
    ref.current?.style.setProperty("--my", "0px");
  };

  return (
    <a
      ref={ref}
      href={href}
      onMouseMove={move}
      onMouseLeave={reset}
      data-sound="hover"
      className="magnetic inline-flex items-center gap-3 border border-bone/35 bg-bone px-5 py-4 text-sm font-black uppercase tracking-[.18em] text-ink hover:border-blood hover:bg-blood hover:text-white"
    >
      {children}
      <ArrowUpRight size={18} />
    </a>
  );
}

function Loader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setHidden(true), 1900);
    return () => window.clearTimeout(timer);
  }, []);

  if (hidden) return null;

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: "-100%" }}
      transition={{ delay: 1.35, duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[90] grid place-items-center bg-ink"
    >
      <div className="relative w-full px-6 text-center">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.05, ease: "easeInOut" }}
          className="mx-auto mb-8 h-1 max-w-sm origin-left bg-blood"
        />
        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl uppercase leading-none sm:text-7xl"
        >
          Fazeehul
          <span className="block text-stroke">Lisan</span>
        </motion.p>
      </div>
    </motion.div>
  );
}

function Hero() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.35], [0, -180]);

  return (
    <section className="relative flex min-h-screen items-end overflow-hidden px-4 pb-10 pt-20 sm:px-8 lg:px-12">
      <ThreeAtmosphere />
      <motion.div style={{ y }} className="absolute inset-0">
        {heroImage && (
          <img
            src={heroImage.src}
            alt="Portfolio hero artwork extracted from Fazeehul Lisan PDF"
            className="h-full w-full object-cover opacity-42 grayscale"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/72 to-ink/35" />
      </motion.div>

      <nav className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-4 py-4 text-xs font-black uppercase tracking-[.24em] text-bone/80 sm:px-8 lg:px-12">
        <a href="#top">F/L</a>
        <a href="#work" className="hidden hover:text-blood sm:block">
          Work
        </a>
        <a href="#contact" className="hover:text-blood">
          Contact
        </a>
      </nav>

      <div className="relative z-10 w-full" id="top">
        <motion.p
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.75, duration: 0.8 }}
          className="mb-5 max-w-xl text-sm uppercase tracking-[.28em] text-bone/70"
        >
          Graphic Designer | Branding Design | Logo Design | Print Media Design
        </motion.p>
        <h1 className="font-display text-[18vw] uppercase leading-[.78] tracking-normal sm:text-[15vw] lg:text-[12vw]">
          <motion.span
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ delay: 1.45, duration: 1, ease: [0.76, 0, 0.24, 1] }}
            className="reveal-mask block"
          >
            Fazeehul
          </motion.span>
          <motion.span
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ delay: 1.6, duration: 1, ease: [0.76, 0, 0.24, 1] }}
            className="reveal-mask block text-blood"
          >
            Lisan
          </motion.span>
        </h1>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-lg leading-relaxed text-bone/78 sm:text-xl">
            Premium branding, logo, packaging, print, and social media design shaped with clean visual strategy and bold editorial storytelling.
          </p>
          <MagneticButton href="#work">View Portfolio</MagneticButton>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="torn relative z-10 bg-paper px-4 py-20 text-ink sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
        <div>
          <p className="mb-4 text-xs font-black uppercase tracking-[.28em] text-blood">About Me</p>
          <h2 className="font-display text-5xl uppercase leading-[.88] sm:text-7xl lg:text-8xl">
            Clean ideas.
            <span className="block">Strong impact.</span>
          </h2>
        </div>
        <div className="space-y-6">
          <p className="text-2xl font-semibold leading-snug sm:text-3xl">{portfolio.about}</p>
          <p className="text-base leading-8 text-ink/72">
            Using Photoshop, Illustrator, and Premiere Pro, Fazeehul combines creativity with strategy and storytelling to deliver content that is engaging, purposeful, and built for a consistent online presence.
          </p>
        </div>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section className="px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-end justify-between gap-6">
          <h2 className="font-display text-5xl uppercase leading-none sm:text-7xl">Skills</h2>
          <Sparkles className="text-blood" size={34} />
        </div>
        <div className="grid gap-px overflow-hidden border border-bone/12 bg-bone/12 md:grid-cols-5">
          {portfolio.specialties.map((skill, index) => (
            <motion.div
              key={skill}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.06 }}
              className="group min-h-48 bg-ink p-6"
            >
              <span className="text-xs font-black text-blood">0{index + 1}</span>
              <h3 className="mt-12 font-display text-2xl uppercase leading-none transition-transform duration-300 group-hover:-translate-y-2">
                {skill}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Software() {
  return (
    <section className="bg-bone px-4 py-16 text-ink sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <h2 className="font-display text-4xl uppercase sm:text-6xl">Software</h2>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-end">
          {portfolio.software.map((tool) => (
            <div key={tool} className="border border-ink/20 px-4 py-3 text-center text-xs font-black uppercase tracking-[.18em]">
              {tool}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseStudies() {
  return (
    <section id="work" className="px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-4xl">
          <p className="mb-4 text-xs font-black uppercase tracking-[.28em] text-blood">Selected Work</p>
          <h2 className="font-display text-5xl uppercase leading-[.9] sm:text-7xl lg:text-8xl">
            Case-study style showcases from the portfolio PDF.
          </h2>
        </div>

        <div className="space-y-24">
          {categories.map((category, categoryIndex) => {
            const pages = category.pages as readonly Page[];
            const assets = pages.flatMap((page) => page.assets).filter((asset) => asset.width > 180 || asset.height > 180);
            const lead = assets[0];
            const supporting = assets.slice(1, 7);

            return (
              <motion.article
                key={category.name}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                className="grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-start"
              >
                <div className="lg:sticky lg:top-24">
                  <span className="text-xs font-black uppercase tracking-[.26em] text-blood">
                    0{categoryIndex + 1} / {category.name}
                  </span>
                  <h3 className="mt-4 font-display text-4xl uppercase leading-none sm:text-6xl">{category.name}</h3>
                  <p className="mt-5 max-w-md text-bone/68">
                    {pages[0]?.text || "A focused visual system developed from the uploaded portfolio work."}
                  </p>
                </div>

                <div className="space-y-4">
                  {lead && (
                    <div className="group relative overflow-hidden bg-bone shadow-luxury">
                      <img
                        src={lead.src}
                        alt={`${category.name} featured portfolio asset`}
                        className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/80 to-transparent p-5">
                        <p className="font-display text-2xl uppercase">{pages[0]?.title}</p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {supporting.map((asset, index) => (
                      <motion.div
                        key={`${asset.src}-${index}`}
                        whileHover={{ y: -8, rotate: index % 2 ? 1.2 : -1.2 }}
                        className="overflow-hidden bg-bone"
                      >
                        <img src={asset.src} alt={`${category.name} asset ${index + 1}`} className="aspect-square w-full object-cover" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PosterShowcase() {
  const posters = useMemo(
    () => posterPages.flatMap((page) => page.assets).filter((asset) => asset.height >= asset.width || asset.height > 550),
    [],
  );

  return (
    <section className="torn bg-paper px-4 py-20 text-ink sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display text-5xl uppercase leading-none sm:text-7xl">Poster Scroll</h2>
          <p className="max-w-xl text-ink/68">
            Social-media-style vertical poster flow using extracted poster artwork from the uploaded PDF.
          </p>
        </div>
        <div className="poster-scroll flex snap-x gap-5 overflow-x-auto pb-6">
          {posters.slice(0, 18).map((poster, index) => (
            <motion.div
              key={`${poster.src}-${index}`}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="min-w-[76vw] snap-center overflow-hidden bg-ink shadow-luxury sm:min-w-[360px]"
            >
              <img src={poster.src} alt={`Social poster ${index + 1}`} className="h-[560px] w-full object-cover" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-12 font-display text-5xl uppercase leading-none sm:text-7xl">Creative Process</h2>
        <div className="grid gap-px bg-bone/12 md:grid-cols-5">
          {portfolio.process.map((step, index) => (
            <motion.div
              key={step}
              initial={{ clipPath: "inset(100% 0 0 0)" }}
              whileInView={{ clipPath: "inset(0 0 0 0)" }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ delay: index * 0.08, duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
              className="min-h-56 bg-blood p-6 text-white"
            >
              <span className="font-display text-6xl text-ink/28">{index + 1}</span>
              <h3 className="mt-10 font-display text-2xl uppercase">{step}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="min-h-screen px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-between gap-12">
        <div>
          <p className="mb-5 text-xs font-black uppercase tracking-[.28em] text-blood">Contact Me</p>
          <h2 className="font-display text-[16vw] uppercase leading-[.78] sm:text-[12vw] lg:text-[9vw]">
            Let&apos;s Work
            <span className="block text-stroke">Together</span>
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <a href={`tel:${portfolio.contact.phone.replace(/\s/g, "")}`} className="group flex items-center justify-between border border-bone/18 p-6 hover:border-blood">
            <span className="flex items-center gap-3 text-lg font-semibold">
              <Phone className="text-blood" />
              {portfolio.contact.phone}
            </span>
            <ArrowUpRight className="transition group-hover:-translate-y-1 group-hover:translate-x-1" />
          </a>
          <div className="flex items-center justify-between border border-bone/18 p-6">
            <span className="flex items-center gap-3 text-lg font-semibold">
              <Instagram className="text-blood" />
              {portfolio.contact.instagram}
            </span>
            <ArrowUpRight />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PortfolioExperience() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.9 });
    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    document.querySelectorAll("[data-sound]").forEach((element) => {
      element.addEventListener("pointerenter", () => {
        window.dispatchEvent(new CustomEvent("portfolio:sound-cue", { detail: { eventName: "hover" } }));
      });
    });

    gsap.utils.toArray<HTMLElement>(".image-reveal").forEach((element) => {
      gsap.fromTo(
        element,
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 1,
          ease: "power4.out",
          scrollTrigger: { trigger: element, start: "top 80%" },
        },
      );
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <main>
      <Loader />
      <Cursor />
      <SoundBridge />
      <div className="grain" />
      <Hero />
      <About />
      <Skills />
      <Software />
      <CaseStudies />
      <PosterShowcase />
      <Process />
      <Contact />
    </main>
  );
}
