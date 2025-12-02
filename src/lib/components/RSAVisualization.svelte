<script>
  import { onMount } from 'svelte';
  import StepIndicator from './StepIndicator.svelte';
  import NumberInput from './NumberInput.svelte';
  import MathNotation from './MathNotation.svelte';
  import { RSAKeyGenerator, rsaEncrypt, rsaDecrypt, getCommonExponents } from '../algorithms/rsa.js';
  import { isPrime } from '../algorithms/primeUtils.js';
  
  // State
  let currentStep = 1;
  let p = 17;
  let q = 23;
  let n = null;
  let phi = null;
  let e = 5;
  let d = null;
  let message = 42;
  let ciphertext = null;
  let decryptedMessage = null;
  
  // Validation states
  let pValid = null;
  let qValid = null;
  let eValid = null;
  
  // Step data
  let step2Data = null;
  let step3Data = null;
  let step4Data = null;
  let step5Data = null;
  let step6Data = null;
  let step7Data = null;
  
  // Animation states
  let animating = false;
  
  // Initialize
  onMount(() => {
    validatePrimes();
  });
  
  // Validate primes when they change
  $: {
    if (p) pValid = isPrime(parseInt(p));
    if (q) qValid = isPrime(parseInt(q));
  }
  
  function validatePrimes() {
    const pNum = parseInt(p);
    const qNum = parseInt(q);
    pValid = isPrime(pNum);
    qValid = isPrime(qNum);
  }
  
  function nextStep() {
    if (currentStep === 1) {
      // Validate primes before moving forward
      const pNum = parseInt(p);
      const qNum = parseInt(q);
      
      if (!isPrime(pNum) || !isPrime(qNum)) {
        alert('Both p and q must be prime numbers!');
        return;
      }
      
      if (pNum === qNum) {
        alert('p and q must be different primes!');
        return;
      }
      
      // Calculate n
      const generator = new RSAKeyGenerator(pNum, qNum);
      n = generator.calculateN();
      step2Data = { p: pNum, q: qNum, n: n };
      currentStep = 2;
    } else if (currentStep === 2) {
      // Calculate phi
      const pNum = parseInt(p);
      const qNum = parseInt(q);
      const generator = new RSAKeyGenerator(pNum, qNum);
      generator.calculateN();
      const phiData = generator.calculatePhi();
      phi = phiData.phi;
      step3Data = phiData;
      currentStep = 3;
    } else if (currentStep === 3) {
      // Choose e
      const pNum = parseInt(p);
      const qNum = parseInt(q);
      const generator = new RSAKeyGenerator(pNum, qNum);
      generator.calculateN();
      generator.calculatePhi();
      
      const eResult = generator.chooseE(parseInt(e));
      if (!eResult.valid) {
        alert(eResult.reason);
        return;
      }
      
      step4Data = eResult;
      currentStep = 4;
    } else if (currentStep === 4) {
      // Calculate d
      const pNum = parseInt(p);
      const qNum = parseInt(q);
      const generator = new RSAKeyGenerator(pNum, qNum);
      generator.calculateN();
      generator.calculatePhi();
      generator.chooseE(parseInt(e));
      
      const dResult = generator.calculateD();
      if (!dResult.valid) {
        alert(dResult.reason);
        return;
      }
      
      d = dResult.d;
      step5Data = dResult;
      currentStep = 5;
    } else if (currentStep === 5) {
      // Encrypt
      const messageNum = parseInt(message);
      if (messageNum >= n) {
        alert(`Message must be less than n (${n})`);
        return;
      }
      
      const publicKey = { e: parseInt(e), n: n };
      const encryptResult = rsaEncrypt(messageNum, publicKey);
      
      if (!encryptResult.valid) {
        alert(encryptResult.reason);
        return;
      }
      
      ciphertext = encryptResult.ciphertext;
      step6Data = encryptResult;
      currentStep = 6;
    } else if (currentStep === 6) {
      // Decrypt
      const privateKey = { d: d, n: n };
      const decryptResult = rsaDecrypt(ciphertext, privateKey);
      
      decryptedMessage = decryptResult.message;
      step7Data = decryptResult;
      currentStep = 7;
    }
  }
  
  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }
  
  function reset() {
    currentStep = 1;
    p = 17;
    q = 23;
    n = null;
    phi = null;
    e = 5;
    d = null;
    message = 42;
    ciphertext = null;
    decryptedMessage = null;
    
    // Clear all step data
    step2Data = null;
    step3Data = null;
    step4Data = null;
    step5Data = null;
    step6Data = null;
    step7Data = null;
    
    validatePrimes();
  }
</script>

<div class="rsa-visualization">
  <header class="header">
    <h1>RSA Encryption Visualized</h1>
    <p class="intro">
      RSA is a public-key cryptosystem widely used for secure data transmission. 
      Let's explore how it works, step by step.
    </p>
  </header>
  
  <StepIndicator {currentStep} totalSteps={7} />
  
  <div class="step-content">
    {#if currentStep === 1}
      <div class="step step-1">
        <h2>Step 1: Choose Prime Numbers</h2>
        <div class="explanation">
          <p>
            RSA security relies on the difficulty of factoring large numbers. 
            We start by choosing two different prime numbers, <strong>p</strong> and <strong>q</strong>.
          </p>
          <p class="security-note">
            ⚠️ In practice, these would be very large primes (hundreds of digits). 
            We use small primes here for educational purposes.
          </p>
        </div>
        
        <div class="inputs-row">
          <NumberInput bind:value={p} label="Prime p" placeholder="17" isValid={pValid} />
          <NumberInput bind:value={q} label="Prime q" placeholder="23" isValid={qValid} />
        </div>
        
        <div class="math-display">
          <MathNotation formula={'p = ' + p} displayMode={true} />
          <MathNotation formula={'q = ' + q} displayMode={true} />
        </div>
      </div>
    {/if}
    
    {#if currentStep === 2}
      <div class="step step-2">
        <h2>Step 2: Calculate n (Modulus)</h2>
        <div class="explanation">
          <p>
            We multiply our two primes to get <strong>n</strong>, which is the modulus for 
            both the public and private keys.
          </p>
        </div>
        
        <div class="calculation-box">
          <div class="calc-step">
            <MathNotation formula={'n = p \\times q'} displayMode={true} />
          </div>
          
          {#if step2Data}
            <div class="calc-step animated">
              <MathNotation formula={'n = ' + step2Data.p + ' \\times ' + step2Data.q} displayMode={true} />
            </div>
            
            <div class="calc-result">
              <MathNotation formula={'n = ' + step2Data.n} displayMode={true} />
            </div>
          {/if}
        </div>
        
        <div class="info-box">
          <strong>Why is this important?</strong>
          <p>
            The value <strong>n</strong> is public and used in both encryption and decryption. 
            However, factoring <strong>n</strong> back into <strong>p</strong> and <strong>q</strong> 
            is computationally difficult for large primes, which is the basis of RSA security.
          </p>
        </div>
      </div>
    {/if}
    
    {#if currentStep === 3}
      <div class="step step-3">
        <h2>Step 3: Calculate φ(n) - Euler's Totient</h2>
        <div class="explanation">
          <p>
            Euler's totient function φ(n) counts how many numbers less than <strong>n</strong> 
            are coprime to <strong>n</strong> (share no common factors except 1).
          </p>
          <p>
            For the product of two primes, there's a simple formula:
          </p>
        </div>
        
        <div class="calculation-box">
          <div class="calc-step">
            <MathNotation formula={'\\varphi(n) = (p - 1) \\times (q - 1)'} displayMode={true} />
          </div>
          
          {#if step3Data}
            <div class="calc-step animated">
              <MathNotation formula={'\\varphi(n) = (' + p + ' - 1) \\times (' + q + ' - 1)'} displayMode={true} />
            </div>
            
            <div class="calc-step animated">
              <MathNotation formula={'\\varphi(n) = ' + step3Data.pMinus1 + ' \\times ' + step3Data.qMinus1} displayMode={true} />
            </div>
            
            <div class="calc-result">
              <MathNotation formula={'\\varphi(n) = ' + step3Data.phi} displayMode={true} />
            </div>
          {/if}
        </div>
        
        <div class="info-box">
          <strong>Why do we need φ(n)?</strong>
          <p>
            φ(n) is essential for calculating the private key exponent <strong>d</strong>. 
            It's also why keeping <strong>p</strong> and <strong>q</strong> secret is crucial—
            if someone knows them, they can calculate φ(n) and break the encryption!
          </p>
        </div>
      </div>
    {/if}
    
    {#if currentStep === 4}
      <div class="step step-4">
        <h2>Step 4: Choose Public Exponent e</h2>
        <div class="explanation">
          <p>
            The public exponent <strong>e</strong> must satisfy:
          </p>
          <ul>
            <li>1 &lt; e &lt; φ(n)</li>
            <li>gcd(e, φ(n)) = 1 (e and φ(n) are coprime)</li>
          </ul>
        </div>
        
        <div class="inputs-row">
          <NumberInput bind:value={e} label="Public exponent e" placeholder="65537" />
        </div>
        
        <div class="calculation-box">
          <MathNotation formula={'\\text{gcd}(e, \\varphi(n)) = \\text{gcd}(' + e + ', ' + phi + ') = 1'} displayMode={true} />
        </div>
        
        <div class="info-box">
          <strong>Common choices:</strong>
          <p>
            In practice, e = 65537 (2^16 + 1) is most common because it makes encryption fast.
            Smaller values like 3 or 5 also work but may have security considerations.
          </p>
        </div>
      </div>
    {/if}
    
    {#if currentStep === 5}
      <div class="step step-5">
        <h2>Step 5: Calculate Private Exponent d</h2>
        <div class="explanation">
          <p>
            The private exponent <strong>d</strong> is the modular multiplicative inverse of 
            <strong>e</strong> modulo φ(n). In other words:
          </p>
        </div>
        
        <div class="calculation-box">
          <div class="calc-step">
            <MathNotation formula={'d \\times e \\equiv 1 \\pmod{\\varphi(n)}'} displayMode={true} />
          </div>
          
          {#if step5Data && step5Data.d}
            <div class="calc-result">
              <MathNotation formula={'d = ' + step5Data.d} displayMode={true} />
            </div>
            
            <div class="verification">
              <p>Verification:</p>
              <MathNotation formula={step5Data.d + ' \\times ' + e + ' \\equiv 1 \\pmod{' + phi + '}'} displayMode={true} />
            </div>
          {/if}
        </div>
        
        <div class="info-box">
          <strong>The Private Key</strong>
          <p>
            <strong>d</strong> must be kept secret! Anyone who knows <strong>d</strong> 
            can decrypt messages encrypted with the public key.
          </p>
          <p>
            <strong>Public Key:</strong> (e = {e}, n = {n})<br>
            <strong>Private Key:</strong> (d = {d}, n = {n})
          </p>
        </div>
      </div>
    {/if}
    
    {#if currentStep === 6}
      <div class="step step-6">
        <h2>Step 6: Encrypt a Message</h2>
        <div class="explanation">
          <p>
            To encrypt a message <strong>m</strong>, we calculate:
          </p>
        </div>
        
        <div class="inputs-row">
          <NumberInput bind:value={message} label="Message m (must be < n)" placeholder="42" />
        </div>
        
        <div class="calculation-box">
          <div class="calc-step">
            <MathNotation formula={'c = m^e \\bmod n'} displayMode={true} />
          </div>
          
          {#if step6Data}
            <div class="calc-step animated">
              <MathNotation formula={'c = ' + message + '^{' + e + '} \\bmod ' + n} displayMode={true} />
            </div>
            
            <div class="calc-result">
              <MathNotation formula={'c = ' + step6Data.ciphertext} displayMode={true} />
            </div>
          {/if}
        </div>
        
        <div class="info-box">
          <strong>The Ciphertext</strong>
          <p>
            The encrypted message <strong>c = {ciphertext || '?'}</strong> can be safely 
            transmitted over an insecure channel. Without the private key, it's 
            computationally infeasible to decrypt!
          </p>
        </div>
      </div>
    {/if}
    
    {#if currentStep === 7}
      <div class="step step-7">
        <h2>Step 7: Decrypt the Message</h2>
        <div class="explanation">
          <p>
            To decrypt the ciphertext <strong>c</strong>, we use the private key:
          </p>
        </div>
        
        <div class="calculation-box">
          <div class="calc-step">
            <MathNotation formula={'m = c^d \\bmod n'} displayMode={true} />
          </div>
          
          {#if step7Data}
            <div class="calc-step animated">
              <MathNotation formula={'m = ' + ciphertext + '^{' + d + '} \\bmod ' + n} displayMode={true} />
            </div>
            
            <div class="calc-result">
              <MathNotation formula={'m = ' + step7Data.message} displayMode={true} />
            </div>
          {/if}
        </div>
        
        {#if decryptedMessage === parseInt(message)}
          <div class="success-box">
            <h3>✓ Success!</h3>
            <p>
              We've successfully recovered the original message: <strong>{decryptedMessage}</strong>
            </p>
            <p>
              This demonstrates how RSA encryption and decryption work together to 
              securely transmit information!
            </p>
          </div>
        {/if}
      </div>
    {/if}
  </div>
  
  {#if currentStep === 7}
    <div class="usage-tip">
      <p>
        <strong>Хотите попробовать еще раз?</strong> Нажмите кнопку "Start Over" выше, 
        чтобы начать заново с другими значениями. Вы можете изменить простые числа p и q 
        на шаге 1 для новых вычислений.
      </p>
      <p>
        <strong>Want to try again?</strong> Click the "Start Over" button above to restart 
        with different values. You can change the prime numbers p and q in step 1 for new calculations.
      </p>
    </div>
  {/if}
  
  <div class="controls">
    <button class="btn btn-secondary" on:click={prevStep} disabled={currentStep === 1}>
      ← Previous Step
    </button>
    
    <button class="btn btn-primary" on:click={reset}>
      Reset
    </button>
    
    {#if currentStep < 7}
      <button class="btn btn-primary" on:click={nextStep}>
        Next Step →
      </button>
    {:else}
      <button class="btn btn-success" on:click={reset}>
        Start Over
      </button>
    {/if}
  </div>
</div>

<style>
  .rsa-visualization {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  h1 {
    font-family: 'Courier New', monospace;
    font-size: 2.5rem;
    color: #2C3E50;
    margin-bottom: 1rem;
    text-decoration: underline;
    text-decoration-color: #4A5568;
    text-decoration-thickness: 3px;
  }
  
  .intro {
    font-family: 'Georgia', serif;
    font-size: 1.125rem;
    color: #2C3E50;
    line-height: 1.6;
    max-width: 700px;
    margin: 0 auto;
  }
  
  .step-content {
    min-height: 500px;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.8);
    border: 2px solid #95A5A6;
    border-radius: 8px;
    margin-bottom: 2rem;
  }
  
  .step h2 {
    font-family: 'Courier New', monospace;
    font-size: 1.75rem;
    color: #4A5568;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid #95A5A6;
    padding-bottom: 0.5rem;
  }
  
  .explanation {
    font-family: 'Georgia', serif;
    font-size: 1rem;
    line-height: 1.8;
    color: #2C3E50;
    margin-bottom: 2rem;
  }
  
  .explanation p {
    margin-bottom: 1rem;
  }
  
  .explanation ul {
    margin-left: 2rem;
    margin-bottom: 1rem;
  }
  
  .explanation li {
    margin-bottom: 0.5rem;
  }
  
  .security-note {
    background: #fff3cd;
    border-left: 4px solid #E74C3C;
    padding: 1rem;
    margin: 1rem 0;
    font-size: 0.95rem;
  }
  
  .inputs-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .math-display {
    background: rgba(74, 85, 104, 0.05);
    padding: 1.5rem;
    border-radius: 4px;
    border: 1px dashed #4A5568;
  }
  
  .calculation-box {
    background: rgba(74, 85, 104, 0.05);
    padding: 2rem;
    border-radius: 8px;
    border: 2px solid #4A5568;
    margin: 2rem 0;
  }
  
  .calc-step {
    margin: 1.5rem 0;
    padding: 1rem;
    background: white;
    border-radius: 4px;
  }
  
  .calc-step.animated {
    animation: slideIn 0.5s ease-out;
  }
  
  .calc-result {
    margin: 2rem 0;
    padding: 1.5rem;
    background: #e8f5e9;
    border: 3px solid #27AE60;
    border-radius: 8px;
    font-size: 1.5rem;
  }
  
  .info-box {
    background: #e3f2fd;
    border-left: 4px solid #4A5568;
    padding: 1.5rem;
    margin: 2rem 0;
    border-radius: 4px;
    font-family: 'Georgia', serif;
  }
  
  .info-box strong {
    display: block;
    font-family: 'Courier New', monospace;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: #2C3E50;
  }
  
  .info-box p {
    margin: 0.5rem 0;
    line-height: 1.6;
  }
  
  .success-box {
    background: #e8f5e9;
    border: 3px solid #27AE60;
    padding: 2rem;
    border-radius: 8px;
    margin: 2rem 0;
    text-align: center;
  }
  
  .success-box h3 {
    font-family: 'Courier New', monospace;
    font-size: 2rem;
    color: #27AE60;
    margin-bottom: 1rem;
  }
  
  .success-box p {
    font-family: 'Georgia', serif;
    font-size: 1.1rem;
    line-height: 1.8;
    margin: 0.5rem 0;
  }
  
  .usage-tip {
    background: #e3f2fd;
    border-left: 4px solid #4A5568;
    padding: 1.5rem;
    margin: 2rem 0 1rem 0;
    border-radius: 4px;
    font-family: 'Georgia', serif;
  }
  
  .usage-tip p {
    margin: 0.5rem 0;
    line-height: 1.6;
    color: #2C3E50;
  }
  
  .usage-tip strong {
    color: #4A5568;
    font-weight: 600;
  }
  
  .controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .btn {
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-family: 'Courier New', monospace;
    font-weight: 600;
    border: 2px solid;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .btn-primary {
    background: #4A5568;
    border-color: #4A5568;
    color: white;
  }
  
  .btn-primary:hover:not(:disabled) {
    background: #2C3E50;
    border-color: #2C3E50;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .btn-secondary {
    background: white;
    border-color: #95A5A6;
    color: #2C3E50;
  }
  
  .btn-secondary:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #4A5568;
  }
  
  .btn-success {
    background: #27AE60;
    border-color: #27AE60;
    color: white;
  }
  
  .btn-success:hover {
    background: #229954;
    border-color: #229954;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
  }
  
  .verification {
    margin-top: 1.5rem;
    padding: 1rem;
    background: rgba(39, 174, 96, 0.1);
    border-radius: 4px;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>

