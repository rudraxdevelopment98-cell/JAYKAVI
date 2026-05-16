import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function heroTextReveal(targets: string | Element | Element[]) {
  return gsap.fromTo(
    targets,
    { clipPath: 'inset(100% 0 0 0)', y: 40, opacity: 0 },
    {
      clipPath: 'inset(0% 0 0 0)',
      y: 0,
      opacity: 1,
      duration: 1.1,
      stagger: 0.08,
      ease: 'expo.out',
    }
  );
}

export function parallaxLayer(el: Element, speed = 0.3) {
  return gsap.to(el, {
    y: () => -ScrollTrigger.maxScroll(window) * speed,
    ease: 'none',
    scrollTrigger: {
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
}

export function svgPathDraw(path: SVGPathElement, trigger: Element) {
  const length = path.getTotalLength();
  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  return gsap.to(path, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: {
      trigger,
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1,
    },
  });
}

export function counterUp(el: Element, endValue: number, duration = 2) {
  const obj = { val: 0 };
  return gsap.to(obj, {
    val: endValue,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      el.textContent = Math.round(obj.val).toString();
    },
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      once: true,
    },
  });
}

export function colorShift(
  el: Element,
  fromColor: string,
  toColor: string,
  trigger: Element
) {
  return gsap.fromTo(
    el,
    { backgroundColor: fromColor },
    {
      backgroundColor: toColor,
      ease: 'none',
      scrollTrigger: {
        trigger,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    }
  );
}

export function pinSection(
  trigger: Element,
  endTrigger?: Element,
  scrub = true
) {
  return ScrollTrigger.create({
    trigger,
    start: 'top top',
    end: endTrigger ? `bottom top` : '+=100%',
    endTrigger: endTrigger ?? undefined,
    pin: true,
    pinSpacing: true,
    scrub,
    invalidateOnRefresh: true,
  });
}
