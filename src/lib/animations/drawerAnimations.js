import gsap from "gsap";

export const animateOpen = (drawer, overlay) => {
  gsap.set(drawer.current, { x: "100%" });

  gsap
    .timeline()
    .to(overlay.current, {
      opacity: 1,
      duration: 0.25,
      pointerEvents: "auto",
    })
    .to(
      drawer.current,
      {
        x: 0,
        duration: 0.35,
        ease: "power3.out",
      },
      "-=0.15"
    );
};

export const animateClose = (drawer, overlay, callback) => {
  gsap
    .timeline({
      onComplete: () => callback && callback(),
    })
    .to(drawer.current, {
      x: "100%",
      duration: 0.35,
      ease: "power3.inOut",
    })
    .to(
      overlay.current,
      {
        opacity: 0,
        duration: 0.25,
        pointerEvents: "none",
      },
      "-=0.2"
    );
};
