import { createSignal, createEffect, For, onMount, onCleanup } from 'solid-js';

// Type definitions
declare const gsap: any;

// Props interface
export interface BackgroundProps {
  onCelebration?: () => void;
}

/**
 * Animated background component with floating icons
 */
export function Background(props: BackgroundProps) {
  // Refs
  let backgroundRef: HTMLDivElement | undefined;
  
  // State for icons
  const [iconsCount] = createSignal(15);
  const [icons] = createSignal([
    'fa-rocket', 'fa-star', 'fa-moon', 'fa-sun', 'fa-heart',
    'fa-bolt', 'fa-code', 'fa-music', 'fa-fire', 'fa-gamepad'
  ]);
  const [floatingIcons, setFloatingIcons] = createSignal<{
    id: number;
    icon: string;
    x: number;
    y: number;
    size: number;
    rotation: number;
  }[]>([]);
  
  /**
   * Create a ripple effect with the icons
   * This can be called from outside the component
   */
  const createRippleEffect = () => {
    gsap.to('.floating-icon', {
      scale: 1.5,
      opacity: 0.8,
      stagger: 0.02,
      duration: 0.5,
      yoyo: true,
      repeat: 1
    });
  };
  
  /**
   * Add a trophy icon at a specific position
   * @param x - X position (percentage)
   * @param y - Y position (percentage)
   */
  const celebrate = (x: number, y: number) => {
    // Add trophy icon
    const tempIcons = [...floatingIcons()];
    const newIcon = {
      id: Date.now(),
      icon: 'fa-trophy',
      x: x,
      y: y,
      size: 2,
      rotation: 0
    };
    
    tempIcons.push(newIcon);
    setFloatingIcons(tempIcons);
    
    // Animate the trophy
    setTimeout(() => {
      const trophyElement = document.getElementById(`floating-icon-${newIcon.id}`);
      if (trophyElement) {
        gsap.fromTo(trophyElement,
          { opacity: 0, scale: 0.5 },
          { 
            opacity: 1, 
            scale: 1.5, 
            duration: 0.5,
            ease: 'back.out',
            onComplete: () => {
              // Float upward and fade out
              gsap.to(trophyElement, {
                y: '-=100',
                opacity: 0,
                duration: 1.5,
                ease: 'power1.in',
                onComplete: () => {
                  // Remove from icons array
                  setFloatingIcons(prev => prev.filter(icon => icon.id !== newIcon.id));
                }
              });
            }
          }
        );
      }
    }, 10);
    
    // Notify parent if needed
    if (props.onCelebration) {
      props.onCelebration();
    }
  };
  
  /**
   * Set up the advanced animation timeline for background icons
   */
  const setupAnimation = () => {
    // Create a timeline for more complex animations
    const iconTimeline = gsap.timeline({ repeat: -1 });
    
    // First phase: Make icons float up and down
    iconTimeline.to('.floating-icon', {
      y: '+=30',
      x: '+=10',
      rotation: '+=60',
      duration: 3,
      ease: 'sine.inOut',
      stagger: {
        each: 0.1,
        from: 'random'
      }
    });
    
    // Second phase: Scatter icons
    iconTimeline.to('.floating-icon', {
      x: (i) => `${gsap.utils.random(-50, 50)}%`,
      y: (i) => `${gsap.utils.random(-30, 30)}%`,
      scale: (i) => gsap.utils.random(0.8, 1.2),
      rotation: '+=180',
      duration: 4,
      ease: 'power1.inOut',
      stagger: {
        each: 0.05,
        from: 'center'
      }
    });
    
    // Third phase: Gather icons to center and then scatter again
    iconTimeline.to('.floating-icon', {
      x: '0%',
      y: '0%',
      scale: 1.5,
      opacity: 0.8,
      duration: 2,
      ease: 'back.in(1.2)',
      stagger: 0.03
    }).to('.floating-icon', {
      x: (i) => `${gsap.utils.random(-100, 100)}%`,
      y: (i) => `${gsap.utils.random(-100, 100)}%`,
      scale: (i) => gsap.utils.random(0.5, 1.5),
      opacity: (i) => gsap.utils.random(0.1, 0.3),
      rotation: '+=360',
      duration: 3,
      ease: 'power2.out',
      stagger: 0.02
    });
  };
  
  /**
   * Handle trophy event from other components
   */
  const handleTrophyEvent = (e: CustomEvent) => {
    if (e.detail && typeof e.detail.x === 'number' && typeof e.detail.y === 'number') {
      celebrate(e.detail.x, e.detail.y);
    }
  };
  
  // Generate initial floating icons
  createEffect(() => {
    const newIcons = [];
    for (let i = 0; i < iconsCount(); i++) {
      newIcons.push({
        id: i,
        icon: icons()[Math.floor(Math.random() * icons().length)],
        x: Math.random() * 100, 
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 1,
        rotation: Math.random() * 360
      });
    }
    setFloatingIcons(newIcons);
  });
  
  // Set up animations and event listeners
  onMount(() => {
    setupAnimation();
    
    // Listen for trophy events
    document.addEventListener('addTrophy', handleTrophyEvent as EventListener);
  });
  
  // Clean up event listeners
  onCleanup(() => {
    document.removeEventListener('addTrophy', handleTrophyEvent as EventListener);
  });
  
  return (
    <div ref={backgroundRef} class="absolute inset-0 overflow-hidden pointer-events-none">
      <For each={floatingIcons()}>
        {(icon) => (
          <div 
            id={`floating-icon-${icon.id}`}
            class="floating-icon absolute text-indigo-500 opacity-20"
            style={{
              left: `${icon.x}%`,
              top: `${icon.y}%`,
              'font-size': `${icon.size}rem`,
              transform: `rotate(${icon.rotation}deg)`
            }}
          >
            <i class={`fas ${icon.icon}`}></i>
          </div>
        )}
      </For>
    </div>
  );
}

// For external component access (expose the ripple effect)
Background.prototype.createRippleEffect = function() {
  if (this.createRippleEffect) {
    this.createRippleEffect();
  }
}; 