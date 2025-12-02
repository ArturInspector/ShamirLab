// Prime number utilities for RSA

/**
 * Check if a number is prime using trial division
 * Simple approach for educational purposes
 */
export function isPrime(n) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  
  // Check divisibility up to sqrt(n)
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) {
      return false;
    }
  }
  return true;
}

/**
 * Calculate GCD using Euclidean algorithm
 * Returns steps for visualization
 */
export function gcd(a, b) {
  const steps = [];
  let x = a;
  let y = b;
  
  while (y !== 0) {
    const remainder = x % y;
    steps.push({
      dividend: x,
      divisor: y,
      quotient: Math.floor(x / y),
      remainder: remainder
    });
    x = y;
    y = remainder;
  }
  
  return {
    result: x,
    steps: steps
  };
}

/**
 * Extended Euclidean Algorithm
 * Finds d such that (d * e) % phi = 1
 */
export function extendedGcd(a, b) {
  const steps = [];
  
  if (b === 0) {
    return { gcd: a, x: 1, y: 0, steps: [] };
  }
  
  let oldR = a, r = b;
  let oldS = 1, s = 0;
  let oldT = 0, t = 1;
  
  while (r !== 0) {
    const quotient = Math.floor(oldR / r);
    
    steps.push({
      oldR, r, oldS, s, oldT, t, quotient
    });
    
    [oldR, r] = [r, oldR - quotient * r];
    [oldS, s] = [s, oldS - quotient * s];
    [oldT, t] = [t, oldT - quotient * t];
  }
  
  return {
    gcd: oldR,
    x: oldS,
    y: oldT,
    steps: steps
  };
}

/**
 * Calculate modular inverse
 * Find d such that (e * d) mod phi = 1
 */
export function modInverse(e, phi) {
  const result = extendedGcd(e, phi);
  
  if (result.gcd !== 1) {
    return null; // No modular inverse exists
  }
  
  // Make sure result is positive
  let d = result.x;
  if (d < 0) {
    d = d + phi;
  }
  
  return {
    d: d,
    steps: result.steps
  };
}

/**
 * Generate a list of small primes for educational use
 */
export function getSmallPrimes() {
  return [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
}

