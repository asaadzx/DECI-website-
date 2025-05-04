import { createSignal, onMount } from 'solid-js';

// Type definitions
declare const gsap: any;

// Props interface
export interface TitleProps {
  text: string;
  onTitleClick?: () => void;
}

/**
 * Animated title component with glow effect and click interaction
 */
export function Title(props: TitleProps) {
  // Refs
  let titleRef: HTMLHeadingElement | undefined;
  let glowRef: HTMLDivElement | undefined;
  
  // State
  const [isAnimating, setIsAnimating] = createSignal(false);
  
  /**
   * Set up title animations with GSAP
   */
  const setupAnimations = () => {
    if (!titleRef || !glowRef) return;
    
    // Set up glow effect
    gsap.to(glowRef, {
      opacity: 0.6,
      scale: 1.2,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
    
    // Initial appearance animation
    gsap.fromTo(titleRef, 
      { y: -50, opacity: 0, scale: 0.5 },
      { 
        y: 0, 
        opacity: 1, 
        scale: 1, 
        duration: 1.5, 
        ease: 'elastic.out(1, 0.3)'
      }
    );
    
    // Add floating animation
    gsap.to(titleRef, {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  };
  
  /**
   * Handle title click with animation
   */
  const handleTitleClick = () => {
    if (isAnimating()) return;
    
    setIsAnimating(true);
    
    gsap.to(titleRef, {
      rotationY: 360,
      scale: 1.2,
      duration: 1,
      ease: 'elastic.out(1, 0.3)',
      onComplete: () => {
        gsap.set(titleRef, { rotationY: 0, scale: 1 });
        setIsAnimating(false);
      }
    });
    
    // Call props callback if provided
    if (props.onTitleClick) {
      props.onTitleClick();
    }
  };
  
  // Set up animations on mount
  onMount(() => {
    setupAnimations();
  });
  
  return (
    <div class="relative z-10 mb-8">
      <div 
        ref={glowRef}
        class="absolute inset-0 bg-sky-500 opacity-20 rounded-full blur-xl -z-10" 
      />
      <h1 
        ref={titleRef} 
        class="text-7xl text-center font-pixelify text-sky-500 opacity-0 z-10 cursor-pointer"
        onClick={handleTitleClick}
      >
        {props.text}
      </h1>
    </div>
  );
}

export default Title; 