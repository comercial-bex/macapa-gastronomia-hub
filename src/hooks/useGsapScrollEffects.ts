import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook that applies GSAP ScrollTrigger parallax & reveal animations
 * to the homepage sections. Call once in the Index component.
 */
export function useGsapScrollEffects(containerRef: React.RefObject<HTMLElement | null>) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !containerRef.current) return;
    initialized.current = true;

    const ctx = gsap.context(() => {
      // ── Parallax on images with data-gsap-parallax ──
      gsap.utils.toArray<HTMLElement>("[data-gsap-parallax]").forEach((el) => {
        const speed = parseFloat(el.dataset.gsapParallax || "0.3");
        gsap.fromTo(el,
          { yPercent: -speed * 15 },
          {
            yPercent: speed * 15,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("section") || el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });

      // ── Section headings: clip-path reveal ──
      gsap.utils.toArray<HTMLElement>("[data-gsap-reveal]").forEach((el) => {
        gsap.fromTo(el,
          { clipPath: "inset(0 100% 0 0)", opacity: 0 },
          {
            clipPath: "inset(0 0% 0 0)",
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // ── Horizontal slide-in from left ──
      gsap.utils.toArray<HTMLElement>("[data-gsap-slide-left]").forEach((el) => {
        gsap.fromTo(el,
          { x: -80, opacity: 0 },
          {
            x: 0, opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // ── Horizontal slide-in from right ──
      gsap.utils.toArray<HTMLElement>("[data-gsap-slide-right]").forEach((el) => {
        gsap.fromTo(el,
          { x: 80, opacity: 0 },
          {
            x: 0, opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // ── Scale-up fade ──
      gsap.utils.toArray<HTMLElement>("[data-gsap-scale]").forEach((el) => {
        gsap.fromTo(el,
          { scale: 0.85, opacity: 0 },
          {
            scale: 1, opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // ── Stagger children fade-up ──
      gsap.utils.toArray<HTMLElement>("[data-gsap-stagger]").forEach((parent) => {
        const children = parent.children;
        gsap.fromTo(children,
          { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: parent,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // ── Gold lines grow ──
      gsap.utils.toArray<HTMLElement>("[data-gsap-line]").forEach((el) => {
        gsap.fromTo(el,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // ── Smooth scroll speed variation for sections ──
      gsap.utils.toArray<HTMLElement>("[data-gsap-speed]").forEach((section) => {
        const speed = parseFloat(section.dataset.gsapSpeed || "1");
        if (speed === 1) return;
        gsap.to(section, {
          yPercent: (1 - speed) * -10,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, [containerRef]);
}
