// Core RSA algorithm implementation

import { isPrime, gcd, modInverse } from './primeUtils.js';
import { modPow, eulerTotient } from './modularMath.js';

/**
 * RSA Key Generation
 */
export class RSAKeyGenerator {
  constructor(p, q) {
    this.p = p;
    this.q = q;
    this.n = null;
    this.phi = null;
    this.e = null;
    this.d = null;
  }
  
  /**
   * Validate prime numbers
   */
  validatePrimes() {
    return {
      pIsPrime: isPrime(this.p),
      qIsPrime: isPrime(this.q),
      areDifferent: this.p !== this.q,
      valid: isPrime(this.p) && isPrime(this.q) && this.p !== this.q
    };
  }
  
  /**
   * Calculate n = p × q
   */
  calculateN() {
    this.n = this.p * this.q;
    return this.n;
  }
  
  /**
   * Calculate φ(n) = (p-1) × (q-1)
   */
  calculatePhi() {
    this.phi = eulerTotient(this.p, this.q);
    return {
      phi: this.phi,
      pMinus1: this.p - 1,
      qMinus1: this.q - 1
    };
  }
  
  /**
   * Choose public exponent e
   * Common choices: 3, 5, 17, 257, 65537
   */
  chooseE(e = 65537) {
    // Validate e
    if (e <= 1 || e >= this.phi) {
      return { valid: false, reason: 'e must be between 1 and φ(n)' };
    }
    
    const gcdResult = gcd(e, this.phi);
    if (gcdResult.result !== 1) {
      return { 
        valid: false, 
        reason: `gcd(e, φ(n)) = ${gcdResult.result}, must be 1`,
        gcdSteps: gcdResult.steps
      };
    }
    
    this.e = e;
    return {
      valid: true,
      e: this.e,
      gcdSteps: gcdResult.steps
    };
  }
  
  /**
   * Calculate private exponent d
   * d is modular inverse of e mod φ(n)
   */
  calculateD() {
    const result = modInverse(this.e, this.phi);
    
    if (!result) {
      return { valid: false, reason: 'No modular inverse exists' };
    }
    
    this.d = result.d;
    return {
      valid: true,
      d: this.d,
      steps: result.steps
    };
  }
  
  /**
   * Get public key
   */
  getPublicKey() {
    return { e: this.e, n: this.n };
  }
  
  /**
   * Get private key
   */
  getPrivateKey() {
    return { d: this.d, n: this.n };
  }
}

/**
 * RSA Encryption
 * c = m^e mod n
 */
export function rsaEncrypt(message, publicKey) {
  const { e, n } = publicKey;
  
  // Validate message
  if (message >= n) {
    return {
      valid: false,
      reason: `Message must be less than n (${n})`
    };
  }
  
  const result = modPow(message, e, n);
  
  return {
    valid: true,
    ciphertext: result.result,
    steps: result.steps
  };
}

/**
 * RSA Decryption
 * m = c^d mod n
 */
export function rsaDecrypt(ciphertext, privateKey) {
  const { d, n } = privateKey;
  
  const result = modPow(ciphertext, d, n);
  
  return {
    valid: true,
    message: result.result,
    steps: result.steps
  };
}

/**
 * Get common public exponents
 */
export function getCommonExponents() {
  return [
    { value: 3, name: 'e = 3', description: 'Smallest odd prime' },
    { value: 5, name: 'e = 5', description: 'Small prime' },
    { value: 17, name: 'e = 17', description: 'Fermat prime F2' },
    { value: 257, name: 'e = 257', description: 'Fermat prime F3' },
    { value: 65537, name: 'e = 65537', description: 'Fermat prime F4 (most common)' }
  ];
}

