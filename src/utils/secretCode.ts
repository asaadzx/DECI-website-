/**
 * Utility for detecting secret code input (Konami code)
 */

/**
 * Secret code detector class for handling keyboard sequences
 * Can detect patterns like the Konami code (up up down down left right left right b a)
 */
export class SecretCodeDetector {
  private sequence: string[] = [];
  private secretCode: string[];
  private callback: () => void;
  private enabled: boolean = false;
  private boundHandler: (e: KeyboardEvent) => void;
  
  /**
   * Constructor for SecretCodeDetector
   * @param secretCode - Array of key strings to detect
   * @param callback - Function to call when code is detected
   */
  constructor(secretCode: string[], callback: () => void) {
    this.secretCode = secretCode;
    this.callback = callback;
    this.boundHandler = this.handleKeyDown.bind(this);
  }
  
  /**
   * Start listening for the secret code
   */
  start(): void {
    if (this.enabled) return;
    
    this.enabled = true;
    document.addEventListener('keydown', this.boundHandler);
  }
  
  /**
   * Stop listening for the secret code
   */
  stop(): void {
    if (!this.enabled) return;
    
    this.enabled = false;
    document.removeEventListener('keydown', this.boundHandler);
    this.sequence = [];
  }
  
  /**
   * Handle keydown events and check for code matches
   */
  private handleKeyDown(e: KeyboardEvent): void {
    // Add the key to the sequence
    this.sequence.push(e.key);
    
    // Trim sequence to match secret code length
    if (this.sequence.length > this.secretCode.length) {
      this.sequence.shift();
    }
    
    // Check if the sequence matches the secret code
    if (this.sequenceMatches()) {
      // Reset sequence
      this.sequence = [];
      
      // Call the callback
      this.callback();
    }
  }
  
  /**
   * Check if current sequence matches the secret code
   */
  private sequenceMatches(): boolean {
    // Only check if the sequence is the same length as the secret code
    if (this.sequence.length !== this.secretCode.length) {
      return false;
    }
    
    // Check each key in the sequence
    for (let i = 0; i < this.secretCode.length; i++) {
      if (this.sequence[i] !== this.secretCode[i]) {
        return false;
      }
    }
    
    return true;
  }
}

/**
 * Konami code sequence: up, up, down, down, left, right, left, right, b, a
 */
const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 
  'ArrowDown', 'ArrowDown', 
  'ArrowLeft', 'ArrowRight', 
  'ArrowLeft', 'ArrowRight', 
  'b', 'a'
];

/**
 * Set up secret code detection with a callback
 * @param callback - Function to call when code is detected
 * @returns The SecretCodeDetector instance
 */
export function setupSecretCodeDetection(callback: () => void): SecretCodeDetector {
  const detector = new SecretCodeDetector(KONAMI_CODE, callback);
  detector.start();
  return detector;
} 