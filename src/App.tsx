import type { Component } from 'solid-js';
import { createSignal, onMount, onCleanup } from 'solid-js';

// Import components from index
import { 
  Background, 
  Title, 
  DragGame,
  FlappyGame 
} from './components';

// Import utilities from index
import { setupSecretCodeDetection, SecretCodeDetector } from './utils';

// Type definitions
declare const gsap: any;
declare const Draggable: any;
declare const ScrollTrigger: any;

/**
 * Main application component
 */
const App: Component = () => {
  // Refs
  let containerRef: HTMLDivElement | undefined;
  let messageBoxRef: HTMLDivElement | undefined;
  let discordButtonRef: HTMLAnchorElement | undefined;
  let footerBoxRef: HTMLDivElement | undefined;
  let backgroundRef: HTMLDivElement | undefined;
  let dragGameRef: HTMLDivElement | undefined;
  
  // State
  const [showMessage, setShowMessage] = createSignal(false);
  const [showSecretGame, setShowSecretGame] = createSignal(false);
  
  // Store secret code detector for cleanup
  let secretCodeDetector: SecretCodeDetector | null = null;
  
  /**
   * Handle container shake animation
   */
  const shakeContainer = () => {
    if (!containerRef) return;
    
    gsap.to(containerRef, {
      x: '+=10',
      duration: 0.1,
      repeat: 5,
      yoyo: true,
      ease: 'none'
    });
  };
  
  /**
   * Handle title click with container shake and ripple effect
   */
  const handleTitleClick = () => {
    shakeContainer();
    
    // Trigger ripple effect on icons
    if (backgroundRef) {
      const backgroundComponent = backgroundRef as any;
      if (backgroundComponent.createRippleEffect) {
        backgroundComponent.createRippleEffect();
      }
    }
  };
  
  /**
   * Show the secret game when Konami code is detected
   */
  const revealSecretGame = () => {
    setShowSecretGame(true);
  };
  
  /**
   * Handle hover effects with GSAP
   */
  const setupHoverEffects = () => {
    // Discord button hover effect
    if (discordButtonRef) {
      discordButtonRef.addEventListener('mouseenter', () => {
        gsap.to(discordButtonRef, {
          scale: 1.05,
          boxShadow: '0 10px 15px rgba(99, 102, 241, 0.4)',
          duration: 0.3,
          ease: 'power1.out'
        });
      });
      
      discordButtonRef.addEventListener('mouseleave', () => {
        gsap.to(discordButtonRef, {
          scale: 1,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          duration: 0.3,
          ease: 'power1.out'
        });
      });
    }
    
    // Message box hover effect
    if (messageBoxRef) {
      messageBoxRef.addEventListener('mouseenter', () => {
        gsap.to(messageBoxRef, { scale: 1.05, duration: 0.3, ease: 'power1.out' });
      });
      
      messageBoxRef.addEventListener('mouseleave', () => {
        gsap.to(messageBoxRef, { scale: 1, duration: 0.3, ease: 'power1.out' });
      });
    }
    
    // Footer box hover effect
    if (footerBoxRef) {
      footerBoxRef.addEventListener('mouseenter', () => {
        gsap.to(footerBoxRef, { scale: 1.05, duration: 0.3, ease: 'power1.out' });
      });
      
      footerBoxRef.addEventListener('mouseleave', () => {
        gsap.to(footerBoxRef, { scale: 1, duration: 0.3, ease: 'power1.out' });
      });
    }
  };
  
  /**
   * Animate container appearance
   */
  const animateContainer = () => {
    if (!containerRef) return;
    
    gsap.fromTo(containerRef,
      { y: 100, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 1, 
        delay: 0.5, 
        ease: 'power2.out',
        onComplete: () => {
          setShowMessage(true);
          
          // Animate the message box after it appears
          if (messageBoxRef) {
            gsap.fromTo(messageBoxRef,
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
            );
          }
          
          // Animate the footer box
          if (footerBoxRef) {
            gsap.fromTo(footerBoxRef,
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'power2.out' }
            );
          }
        }
      }
    );
  };
  
  // Setup on component mount
  onMount(() => {
    // Register GSAP plugins
    if (typeof gsap !== 'undefined' && typeof gsap.registerPlugin === 'function') {
      // Register Draggable if available
      try {
        if (typeof Draggable !== 'undefined') {
          gsap.registerPlugin(Draggable);
        }
      } catch (e) {
        console.warn('Draggable plugin not available', e);
      }
      
      // Register ScrollTrigger if available
      try {
        if (typeof ScrollTrigger !== 'undefined') {
          gsap.registerPlugin(ScrollTrigger);
        }
      } catch (e) {
        console.warn('ScrollTrigger plugin not available', e);
      }
    } else {
      console.warn('GSAP not available or missing registerPlugin method');
    }
    
    // Setup hover effects
    setupHoverEffects();
    
    // Animate container
    animateContainer();
    
    // Initialize secret code detection
    secretCodeDetector = setupSecretCodeDetection(revealSecretGame);
  });
  
  // Cleanup on component unmount
  onCleanup(() => {
    if (secretCodeDetector) {
      secretCodeDetector.stop();
    }
  });
  
  return (
    <div class="min-h-screen bg-gray-800 text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background with floating icons */}
      <Background ref={backgroundRef} />
      
      {/* Main title */}
      <Title text="Deci.Dev" onTitleClick={handleTitleClick} />
      
      {/* Main content container */}
      <div 
        ref={containerRef}
        class="max-w-2xl w-full bg-gray-700/80 backdrop-blur-sm rounded-xl p-6 shadow-xl opacity-0 z-10 relative"
      >
        {/* Discord button */}
        <div class="flex justify-center mb-6">
          <a 
            ref={discordButtonRef}
            href="https://discord.gg/hhYF8heujS" 
            class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg"
          >
            <i class="fab fa-discord mr-2"></i> Join Discord Server
          </a>
        </div>
        
        {/* Mini-game */}
        <DragGame ref={dragGameRef} containerRef={containerRef} />
        
        {/* Message section */}
        {showMessage() && (
          <div 
            ref={messageBoxRef}
            class="mb-8 bg-gray-800/90 p-5 rounded-lg shadow-md opacity-0"
          >
            <h2 class="text-2xl text-indigo-400 mb-3 font-bold font-pixelify flex items-center">
              <i class="fas fa-newspaper mr-2"></i> Important Links & News
            </h2>
            <p class="text-lg mb-4 font-tagesschrift">
              WE WILL MAKE IMPORTANTE LINKS HERE AND NEWS
              and send this page to all members with out mobadra execute us 
            </p>
            <br />
            <p>We are voting now to add gallery for deci.dev friends drawings</p>
          </div>
        )}
        
        {/* Footer */}
        <footer class="mt-8 text-center">
          <div 
            ref={footerBoxRef}
            class="mb-6 bg-gray-800/90 p-4 rounded-lg opacity-0"
          >
            <p class="text-lg font-tagesschrift">
              <i class="fas fa-lightbulb text-yellow-400 mr-2"></i>
              We need ideas to add it in website to make deci.dev website soul like this mini games  
              and please everyone who wants to share something in this page ask in discord server
            </p>
          </div>
          <p class="text-sm text-gray-400">
            <i class="fas fa-code mr-1"></i> 
            &copy; 2025 lizard. All rights reserved.
          </p>
        </footer>
      </div>
      
      {/* Secret game modal */}
      {showSecretGame() && (
        <FlappyGame onClose={() => setShowSecretGame(false)} />
      )}
    </div>
  );
};

export default App;
