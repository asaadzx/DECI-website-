import { createSignal, onMount } from 'solid-js';

// Type definitions
declare const gsap: any;
declare const Draggable: any;

// Custom interface for elements with event emitter
interface DragCircleElement extends HTMLDivElement {
  _eventEmitter?: HTMLDivElement;
  _draggable?: any;
}

// Props interface
export interface DragGameProps {
  containerRef?: HTMLDivElement;
}

/**
 * Initialize the drag mini-game
 */
export function initDragGame(gameRef: HTMLDivElement) {
  const dragCircleRef = gameRef.querySelector('.drag-circle') as DragCircleElement;
  const gameArea = gameRef.querySelector('.game-area');
  
  if (!dragCircleRef || !gameArea) {
    console.warn('Required elements not found');
    return;
  }
  
  // Make sure GSAP and Draggable are available
  if (typeof gsap === 'undefined' || typeof Draggable === 'undefined') {
    console.warn('GSAP or Draggable not available');
    return;
  }
  
  // Create the event emitter for custom events
  dragCircleRef._eventEmitter = document.createElement('div');
  
  // Make the circle draggable
  try {
    // Create draggable instance
    const draggable = Draggable.create(dragCircleRef, {
      type: "x,y",
      bounds: gameArea,
      edgeResistance: 0.65,
      inertia: true,
      onDragStart: function() {
        gsap.to(dragCircleRef, { scale: 1.1, duration: 0.2 });
      },
      onDragEnd: function() {
        gsap.to(dragCircleRef, { scale: 1, duration: 0.2 });
        if (dragCircleRef._eventEmitter) {
          dragCircleRef._eventEmitter.dispatchEvent(new CustomEvent('checkCollision'));
        }
      }
    })[0];
    
    // Store the draggable instance
    dragCircleRef._draggable = draggable;
    
  } catch (error) {
    console.error('Error initializing draggable:', error);
  }
}

/**
 * Drag mini-game component 
 */
export function DragGame(props: DragGameProps) {
  let gameRef: HTMLDivElement | undefined;
  let gameAreaRef: HTMLDivElement | undefined;
  let dragCircleRef: HTMLDivElement | undefined;
  let targetRef: HTMLDivElement | undefined;
  
  const [score, setScore] = createSignal(0);
  
  // Add trophy to background when target is hit
  const addTrophy = (x: number, y: number) => {
    document.dispatchEvent(new CustomEvent('addTrophy', {
      detail: { x, y }
    }));
  };
  
  // Move target to a new random position
  const moveTargetToRandomPosition = () => {
    if (!targetRef || !gameAreaRef) return;
    
    const x = Math.random() * 80 + 10; // 10% to 90%
    const y = Math.random() * 70 + 15; // 15% to 85%
    
    const gameArea = gameAreaRef.getBoundingClientRect();
    console.log('Moving target to new position', x, y);
    
    gsap.to(targetRef, {
      left: `calc(${x}% - 20px)`, 
      top: `calc(${y}% - 20px)`,
      scale: 1,
      opacity: 1,
      duration: 0.3
    });
  };
  
  // Check for collision between circle and target
  const checkCollision = () => {
    if (!dragCircleRef || !targetRef) return;
    
    const circle = dragCircleRef.getBoundingClientRect();
    const target = targetRef.getBoundingClientRect();
    
    const circleCenter = {
      x: circle.left + circle.width / 2,
      y: circle.top + circle.height / 2
    };
    
    const targetCenter = {
      x: target.left + target.width / 2,
      y: target.top + target.height / 2
    };
    
    const distance = Math.sqrt(
      Math.pow(circleCenter.x - targetCenter.x, 2) + 
      Math.pow(circleCenter.y - targetCenter.y, 2)
    );
    
    if (distance < (circle.width / 2 + target.width / 2)) {
      // Target hit!
      gsap.to(targetRef, {
        scale: 1.5,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          setScore(s => s + 1);
          moveTargetToRandomPosition();
          
          if (props.containerRef) {
            gsap.to(props.containerRef, {
              boxShadow: '0 0 30px rgba(99, 102, 241, 0.8)',
              duration: 0.3,
              yoyo: true,
              repeat: 1
            });
          }
          
          const targetRect = targetRef!.getBoundingClientRect();
          const gameRect = gameRef!.getBoundingClientRect();
          
          addTrophy(
            ((targetRect.left - gameRect.left) / gameRect.width) * 100,
            ((targetRect.top - gameRect.top) / gameRect.height) * 100
          );
        }
      });
    }
  };
  
  onMount(() => {
    if (!gameRef || !dragCircleRef || !targetRef || !gameAreaRef) {
      console.warn('Required elements not found');
      return;
    }
    
    console.log('Game mounted, initializing...');
    
    if (typeof gsap === 'undefined' || typeof Draggable === 'undefined') {
      console.warn('GSAP or Draggable not available');
      return;
    }
    
    // First make sure target is visible but at opacity 0
    gsap.set(targetRef, {
      opacity: 0,
      scale: 0,
      left: '50%', 
      top: '50%'
    });
    
    // Register GSAP plugin
    if (typeof gsap.registerPlugin === 'function') {
      try {
        gsap.registerPlugin(Draggable);
      } catch (e) {
        console.warn('Failed to register Draggable plugin:', e);
        return;
      }
    }
    
    // Initialize draggable
    try {
      Draggable.create(dragCircleRef, {
        type: 'x,y',
        bounds: gameAreaRef,
        edgeResistance: 0.65,
        inertia: true,
        onDragStart: () => {
          gsap.to(dragCircleRef, { scale: 1.1, duration: 0.2 });
        },
        onDrag: checkCollision,
        onDragEnd: () => {
          gsap.to(dragCircleRef, { scale: 1, duration: 0.2 });
          checkCollision();
        }
      });
      
      // Show first target after a short delay
      setTimeout(() => {
        console.log('Showing initial target');
        moveTargetToRandomPosition();
      }, 500);
    } catch (error) {
      console.error('Error initializing draggable:', error);
    }
  });
  
  return (
    <div ref={gameRef} class="my-6 p-4 bg-gray-800/90 rounded-lg">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-pixelify text-indigo-400">Mini-Game</h3>
        <div class="text-lg">
          Score: <span class="text-yellow-400 font-bold">{score()}</span>
        </div>
      </div>
      
      <div ref={gameAreaRef} class="game-area relative h-32 border-2 border-dashed border-indigo-500/50 rounded-lg bg-gray-900/50 overflow-hidden">
        {/* Draggable circle */}
        <div 
          ref={dragCircleRef}
          class="drag-circle absolute w-8 h-8 bg-indigo-500 rounded-full cursor-grab active:cursor-grabbing z-10 shadow-lg"
          style={{ left: '20px', top: '20px' }}
        >
          <i class="fas fa-hand-pointer absolute inset-0 flex items-center justify-center text-white"></i>
        </div>
        
        {/* Target (always render it) */}
        <div 
          ref={targetRef}
          class="absolute w-10 h-10 bg-green-500 rounded-full shadow-lg"
          style={{ 
            left: '50%', 
            top: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0
          }}
        >
          <div class="absolute inset-0 flex items-center justify-center text-white">
            <i class="fas fa-crosshairs"></i>
          </div>
        </div>
        
        <p class="absolute inset-0 flex items-center justify-center text-indigo-300 text-sm font-tagesschrift pointer-events-none">
          Drag the circle to the target!
        </p>
      </div>
      
      <div class="mt-2 text-xs text-gray-400 italic text-center">
        <i class="fas fa-lightbulb text-yellow-300 mr-1"></i> 
        Psst... Try To search about Konami secrets 🤫 to open hidden mini game
      </div>
    </div>
  );
} 