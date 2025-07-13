import { gsap } from 'gsap'

export function fadeIn(element) {
  gsap.fromTo(
    element,
    { opacity: 0, visibility: 'hidden', pointerEvents: 'none' },
    {
      opacity: 1,
      duration: 0.7,
      visibility: 'visible',
      pointerEvents: 'auto',
      delay: 0.05
    }
  )
}

export function fadeOut(element) {
  gsap.fromTo(
    element,
    { opacity: 1, visibility: 'visible', pointerEvents: 'auto' },
    {
      opacity: 0,
      duration: 0.7,
      visibility: 'hidden',
      pointerEvents: 'none',
      delay: 0.05
    }
  )
}
