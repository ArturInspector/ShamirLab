// Modular arithmetic utilities for RSA

/**
 * Modular exponentiation using square-and-multiply method
 * Calculates (base^exponent) mod modulus efficiently
 * Returns steps for visualization
 */
export function modPow(base, exponent, modulus) {
  if (modulus === 1) return { result: 0, steps: [] };
  
  const steps = [];
  let result = 1;
  base = base % modulus;
  
  // Convert exponent to binary
  const binaryExp = exponent.toString(2);
  steps.push({
    type: 'binary',
    exponent: exponent,
    binary: binaryExp,
    description: `Convert exponent ${exponent} to binary: ${binaryExp}`
  });
  
  // Process each bit from left to right
  for (let i = 0; i < binaryExp.length; i++) {
    const bit = binaryExp[i];
    
    // Always square (except first iteration)
    if (i > 0) {
      const oldResult = result;
      result = (result * result) % modulus;
      steps.push({
        type: 'square',
        bit: bit,
        oldValue: oldResult,
        newValue: result,
        description: `Square: ${oldResult}² mod ${modulus} = ${result}`
      });
    } else {
      result = base;
      steps.push({
        type: 'initialize',
        value: result,
        description: `Initialize result = ${base}`
      });
    }
    
    // If bit is 1, multiply by base
    if (bit === '1' && i > 0) {
      const oldResult = result;
      result = (result * base) % modulus;
      steps.push({
        type: 'multiply',
        bit: bit,
        oldValue: oldResult,
        base: base,
        newValue: result,
        description: `Bit is 1, multiply: ${oldResult} × ${base} mod ${modulus} = ${result}`
      });
    }
  }
  
  return {
    result: result,
    steps: steps
  };
}

/**
 * Simple modular multiplication for display
 */
export function modMul(a, b, modulus) {
  return (a * b) % modulus;
}

/**
 * Calculate Euler's totient function φ(n)
 * For RSA: φ(n) = (p-1) × (q-1)
 */
export function eulerTotient(p, q) {
  return (p - 1) * (q - 1);
}

