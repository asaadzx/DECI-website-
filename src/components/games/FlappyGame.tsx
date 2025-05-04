import { Component, createSignal, For, onMount, onCleanup } from 'solid-js';

// Type definitions
declare const gsap: any;

interface FlappyGameProps {
  onClose: () => void;
}

// Type for game obstacles
interface Obstacle {
  id: number; 
  x: number; 
  height: number;
  gapSize: number;
}

/**
 * A secret Flappy Bird-style game that can be unlocked with the Konami code
 */
const FlappyGame: Component<FlappyGameProps> = (props) => {
  let gameRef: HTMLDivElement | undefined;
  let playerRef: HTMLDivElement | undefined;
  let scoreRef: HTMLSpanElement | undefined;
  let gameAreaRef: HTMLDivElement | undefined;
  
  // Game state
  const [score, setScore] = createSignal(0);
  const [playerPosition, setPlayerPosition] = createSignal({ y: 50 });
  const [obstacles, setObstacles] = createSignal<Obstacle[]>([]);
  const [gameActive, setGameActive] = createSignal(false);
  const [gameWidth, setGameWidth] = createSignal(0);
  const [gameHeight, setGameHeight] = createSignal(0);
  
  /**
   * Initialize the game state and start the game loop
   */
  const initGame = () => {
    if (!gameRef || !playerRef || !gameAreaRef) return;
    
    // Get game area dimensions for proper positioning
    const rect = gameAreaRef.getBoundingClientRect();
    setGameWidth(rect.width);
    setGameHeight(rect.height);
    
    // Reset game to initial state
    setScore(0);
    
    // Create initial obstacles with consistent gap sizes
    setObstacles([
      createObstacle(rect.width + 50, 1),
      createObstacle(rect.width + 200, 2),
      createObstacle(rect.width + 350, 3)
    ]);
    
    // Position player in the middle
    setPlayerPosition({ y: 50 });
    
    // Activate game loop
    setGameActive(true);
    
    // Start game loop
    requestAnimationFrame(updateGame);
  };
  
  /**
   * Create a new obstacle with proper sizing
   */
  const createObstacle = (xPosition: number, id: number): Obstacle => {
    // The gap size stays consistent for better gameplay
    const gapSize = 30; 
    
    // The height determines where the gap starts (from the top)
    // Keep it between 20% and 70% to avoid impossible positions
    const height = 20 + Math.random() * 50;
    
    return {
      id: id || Date.now(),
      x: xPosition,
      height: height,
      gapSize: gapSize
    };
  };
  
  /**
   * Handle keyboard input for the game
   */
  const handleControls = (e: KeyboardEvent) => {
    if (!gameActive()) return;
    
    if (e.key === 'ArrowUp' || e.key === ' ') {
      // Move player upward with smoother motion
      setPlayerPosition(prev => ({ y: Math.max(0, prev.y - 5) }));
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      // Move player downward with smoother motion
      setPlayerPosition(prev => ({ y: Math.min(90, prev.y + 5) }));
      e.preventDefault();
    } else if (e.key === 'Escape') {
      closeGame();
      e.preventDefault();
    }
  };
  
  /**
   * Game update loop - handles movement, collision, and scoring
   */
  const updateGame = () => {
    if (!gameActive()) return;
    
    // Apply gentler gravity to player
    setPlayerPosition(prev => ({ 
      y: Math.min(90, prev.y + 0.5)
    }));
    
    // Move obstacles from right to left
    setObstacles(prev => {
      // Update obstacle positions with slower speed
      const updated = prev.map(obs => ({
        ...obs,
        x: obs.x - 2 // Reduced movement speed
      }));
      
      // Replace obstacles that moved off-screen
      const newObstacles = [...updated];
      
      for (let i = 0; i < newObstacles.length; i++) {
        if (newObstacles[i].x < -50) {
          setScore(prev => prev + 1);
          
          const rightmostX = Math.max(...newObstacles.map(o => o.x));
          newObstacles[i] = createObstacle(rightmostX + 300, Date.now());
        }
      }
      
      return newObstacles;
    });
    
    // Check collisions
    detectCollisions();
    
    // Continue game loop
    if (gameActive()) {
      requestAnimationFrame(updateGame);
    }
  };
  
  /**
   * Check for collisions between player and obstacles
   */
  const detectCollisions = () => {
    if (!playerRef || !gameActive()) return;
    
    const player = playerRef.getBoundingClientRect();
    const playerSize = player.width;
    const playerCenterY = player.top + (player.height / 2);
    
    obstacles().forEach(obs => {
      // Find the top and bottom obstacle elements by ID
      const topObsElem = document.getElementById(`obs-top-${obs.id}`);
      const bottomObsElem = document.getElementById(`obs-bottom-${obs.id}`);
      
      if (!topObsElem || !bottomObsElem) return;
      
      const topRect = topObsElem.getBoundingClientRect();
      const bottomRect = bottomObsElem.getBoundingClientRect();
      
      // Only check for collision if player is horizontally aligned with obstacle
      if (
        (player.right > topRect.left && player.left < topRect.right) ||
        (player.right > bottomRect.left && player.left < bottomRect.right)
      ) {
        // Check if player is in the gap between obstacles
        const gapTop = topRect.bottom;
        const gapBottom = bottomRect.top;
        
        if (player.top < gapTop || player.bottom > gapBottom) {
          // Collision detected!
          handleCollision();
          return;
        }
      }
    });
  };
  
  /**
   * Handle player collision (game over)
   */
  const handleCollision = () => {
    // Animate player crash
    gsap.to(playerRef, {
      rotate: 720,
      opacity: 0,
      y: 100,
      duration: 1,
      ease: 'power2.in',
      onComplete: () => {
        setGameActive(false);
        
        // Restart after delay
        setTimeout(() => {
          if (gameRef) { // Check if component is still mounted
            gsap.set(playerRef, { // Reset player appearance
              rotate: 0,
              opacity: 1,
              y: 0
            });
            initGame();
          }
        }, 1000);
      }
    });
  };
  
  /**
   * Close the game and clean up
   */
  const closeGame = () => {
    setGameActive(false);
    
    // Animate out
    gsap.to(gameRef, {
      y: 100,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: props.onClose
    });
  };
  
  onMount(() => {
    // Initialize game area dimensions
    if (gameAreaRef) {
      const rect = gameAreaRef.getBoundingClientRect();
      setGameWidth(rect.width);
      setGameHeight(rect.height);
    }
    
    // Add event listener for controls
    document.addEventListener('keydown', handleControls);
    
    // Start the game
    initGame();
  });
  
  onCleanup(() => {
    // Remove event listener when component unmounts
    document.removeEventListener('keydown', handleControls);
  });
  
  return (
    <div 
      ref={gameRef}
      class="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
    >
      <div class="bg-gray-800 p-5 rounded-xl max-w-xl w-full relative">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-2xl font-pixelify text-indigo-400">Secret Mini-Game!</h3>
          <div class="text-lg">
            Score: <span ref={scoreRef} class="text-yellow-400 font-bold">{score()}</span>
          </div>
          <button 
            class="text-gray-400 hover:text-white"
            onClick={closeGame}
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div 
          ref={gameAreaRef}
          class="relative h-64 border-2 border-dashed border-indigo-500/50 rounded-lg bg-gray-900/90 overflow-hidden mb-3"
        >
          {/* Player */}
          <div 
            ref={playerRef}
            class="absolute w-10 h-10 bg-indigo-500 rounded-full shadow-lg left-10 transition-transform"
            style={{ top: `calc(${playerPosition().y}% - 20px)` }}
          >
            <i class="fas fa-rocket absolute inset-0 flex items-center justify-center text-white"></i>
          </div>
          
          {/* Obstacles */}
          <For each={obstacles()}>
            {(obstacle) => (
              <>
                {/* Top obstacle */}
                <div 
                  id={`obs-top-${obstacle.id}`}
                  class="absolute bg-red-500/90 w-12 rounded-b-md"
                  style={{ 
                    left: `${obstacle.x}px`,
                    top: 0,
                    height: `${obstacle.height}%`,
                    "box-shadow": 'inset -2px -2px 4px rgba(0,0,0,0.3)'
                  }}
                />
                
                {/* Bottom obstacle */}
                <div 
                  id={`obs-bottom-${obstacle.id}`}
                  class="absolute bg-red-500/90 w-12 rounded-t-md"
                  style={{ 
                    left: `${obstacle.x}px`,
                    bottom: 0,
                    height: `${100 - obstacle.height - obstacle.gapSize}%`,
                    "box-shadow": 'inset -2px 2px 4px rgba(0,0,0,0.3)'
                  }}
                />
              </>
            )}
          </For>
        </div>
        
        <p class="text-gray-300 text-sm mb-2">
          Use the <span class="text-yellow-400">Up Arrow</span> key or <span class="text-yellow-400">Spacebar</span> to fly up.
          <span class="text-yellow-400"> Down Arrow</span> to dive down.
          Press <span class="text-yellow-400">Escape</span> to exit the game.
        </p>
        
        <p class="text-xs text-gray-500 italic">
          <i class="fas fa-info-circle mr-1"></i> 
          This secret game was unlocked with the Konami Code: ↑↑↓↓←→←→BA
        </p>
      </div>
    </div>
  );
};

export default FlappyGame; 