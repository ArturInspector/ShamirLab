<script>
  import { onMount } from 'svelte';
  import MathNotation from './MathNotation.svelte';
  import { RSAKeyGenerator, rsaEncrypt, rsaDecrypt } from '../algorithms/rsa.js';
  import { tStore } from '../i18n/store.js';
  
  let step = 1;
  let aliceP = 17;
  let aliceQ = 23;
  let bobP = 19;
  let bobQ = 29;
  
  let aliceKeys = null;
  let bobKeys = null;
  let message = '';
  let encryptedMessage = null;
  let decryptedMessage = null;
  let encryptionError = null;
  
  let animating = false;
  
  function generateKeys(person, p, q) {
    const generator = new RSAKeyGenerator(p, q);
    generator.calculateN();
    generator.calculatePhi();
    
    // Try common e values, starting with smaller ones for educational purposes
    let e = 3;
    let eResult = generator.chooseE(e);
    if (!eResult.valid) {
      e = 5;
      eResult = generator.chooseE(e);
    }
    if (!eResult.valid) {
      e = 17;
      eResult = generator.chooseE(e);
    }
    if (!eResult.valid) {
      e = 65537;
      eResult = generator.chooseE(e);
    }
    
    const dResult = generator.calculateD();
    
    return {
      public: { e: generator.e, n: generator.n },
      private: { d: generator.d, n: generator.n }
    };
  }
  
  function nextStep() {
    if (step === 1) {
      aliceKeys = generateKeys('Alice', aliceP, aliceQ);
      step = 2;
    } else if (step === 2) {
      bobKeys = generateKeys('Bob', bobP, bobQ);
      step = 3;
    } else if (step === 3 && message) {
      // Alice encrypts message with Bob's public key
      const messageNum = parseInt(message);
      if (isNaN(messageNum)) {
        encryptionError = $tStore('aliceBob.error.invalidMessage');
        return;
      }
      const result = rsaEncrypt(messageNum, bobKeys.public);
      if (result.valid) {
        encryptedMessage = result;
        encryptionError = null;
        step = 4;
      } else {
        encryptionError = $tStore('aliceBob.error.encryptionFailed').replace('{reason}', result.reason || 'Unknown error');
        encryptedMessage = null;
      }
    } else if (step === 4) {
      // Bob decrypts with his private key
      if (encryptedMessage && encryptedMessage.valid) {
        decryptedMessage = rsaDecrypt(encryptedMessage.ciphertext, bobKeys.private);
        step = 5;
      }
    }
  }
  
  function reset() {
    step = 1;
    message = '';
    aliceKeys = null;
    bobKeys = null;
    encryptedMessage = null;
    decryptedMessage = null;
    encryptionError = null;
  }
</script>

<div class="alice-bob">
  <h2>{$tStore('aliceBob.title')}</h2>
  
  <div class="characters">
    <div class="character alice" class:active={step >= 1}>
      <div class="avatar">A</div>
      <div class="name">{$tStore('aliceBob.alice')}</div>
      {#if aliceKeys}
        <div class="keys">
          <div class="key public">{$tStore('aliceBob.publicKey')}: (e={aliceKeys.public.e}, n={aliceKeys.public.n})</div>
          <div class="key private">{$tStore('aliceBob.privateKey')}: (d={aliceKeys.private.d}, n={aliceKeys.private.n})</div>
        </div>
      {/if}
    </div>
    
    <div class="arrow">→</div>
    
    <div class="character bob" class:active={step >= 2}>
      <div class="avatar">B</div>
      <div class="name">{$tStore('aliceBob.bob')}</div>
      {#if bobKeys}
        <div class="keys">
          <div class="key public">{$tStore('aliceBob.publicKey')}: (e={bobKeys.public.e}, n={bobKeys.public.n})</div>
          <div class="key private">{$tStore('aliceBob.privateKey')}: (d={bobKeys.private.d}, n={bobKeys.private.n})</div>
        </div>
      {/if}
    </div>
  </div>
  
  <div class="scenario">
    {#if step === 1}
      <div class="step-box">
        <h3>{$tStore('aliceBob.step1.title')}</h3>
        <p>{$tStore('aliceBob.step1.description').replace('{p}', aliceP).replace('{q}', aliceQ)}</p>
        <button class="action-btn" on:click={nextStep}>{$tStore('aliceBob.step1.button')}</button>
      </div>
    {:else if step === 2}
      <div class="step-box">
        <h3>{$tStore('aliceBob.step2.title')}</h3>
        <p>{$tStore('aliceBob.step2.description').replace('{p}', bobP).replace('{q}', bobQ)}</p>
        <button class="action-btn" on:click={nextStep}>{$tStore('aliceBob.step2.button')}</button>
      </div>
    {:else if step === 3}
      <div class="step-box">
        <h3>{$tStore('aliceBob.step3.title')}</h3>
        <p>{$tStore('aliceBob.step3.description')}</p>
        <div class="input-group">
          <input 
            type="text" 
            bind:value={message} 
            placeholder={$tStore('aliceBob.step3.placeholder')}
            class="message-input"
          />
          <button class="action-btn" on:click={nextStep} disabled={!message}>
            {$tStore('aliceBob.step3.button')}
          </button>
        </div>
        {#if encryptionError}
          <p class="error-message">{encryptionError}</p>
        {/if}
        <p class="hint">{$tStore('aliceBob.step3.hint')}</p>
      </div>
    {:else if step === 4}
      <div class="step-box">
        <h3>{$tStore('aliceBob.step4.title')}</h3>
        <div class="message-flow">
          <div class="message-box original">
            <strong>{$tStore('aliceBob.step4.original')}:</strong> {message}
          </div>
          <div class="arrow-large">↓</div>
          <div class="message-box encrypted">
            <strong>{$tStore('aliceBob.step4.encrypted')}:</strong> {encryptedMessage?.ciphertext ?? ''}
          </div>
          <p class="security-note">{$tStore('aliceBob.step4.securityNote')}</p>
        </div>
        <button class="action-btn" on:click={nextStep}>{$tStore('aliceBob.step4.button')}</button>
      </div>
    {:else if step === 5}
      <div class="step-box success">
        <h3>{$tStore('aliceBob.step5.title')}</h3>
        <div class="message-flow">
          <div class="message-box encrypted">
            <strong>{$tStore('aliceBob.step5.received')}:</strong> {encryptedMessage?.ciphertext ?? ''}
          </div>
          <div class="arrow-large">↓</div>
          <div class="message-box decrypted">
            <strong>{$tStore('aliceBob.step5.decrypted')}:</strong> {decryptedMessage?.message ?? ''}
          </div>
        </div>
        <div class="success-message">
          <p>{$tStore('aliceBob.step5.success1')}</p>
          <p>{$tStore('aliceBob.step5.success2')}</p>
        </div>
        <button class="action-btn" on:click={reset}>{$tStore('aliceBob.step5.button')}</button>
      </div>
    {/if}
  </div>
  
  {#if step >= 3 && aliceKeys && bobKeys}
    <div class="math-visualization">
      <h4>{$tStore('aliceBob.math.title')}</h4>
      {#if step === 3}
        <div class="formula-step">
          <p>{$tStore('aliceBob.math.encrypt')}</p>
          <MathNotation formula={'c = m^{' + bobKeys.public.e + '} \\bmod ' + bobKeys.public.n} displayMode={true} />
        </div>
      {:else if step >= 4}
        <div class="formula-step">
          <p>{$tStore('aliceBob.math.decrypt')}</p>
          <MathNotation formula={'m = c^{' + bobKeys.private.d + '} \\bmod ' + bobKeys.private.n} displayMode={true} />
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .alice-bob {
    padding: 2rem;
    background: var(--bg-card);
    background-image: var(--div-image-url, url('/div.jpg'));
    background-size: cover;
    background-position: center;
    background-blend-mode: overlay;
    border-radius: 12px;
    border: 1px solid var(--border-dark);
    margin: 2rem 0;
    position: relative;
    overflow: hidden;
  }
  
  .alice-bob::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-card);
    opacity: 0.8;
    z-index: 0;
    border-radius: 12px;
  }
  
  .alice-bob > * {
    position: relative;
    z-index: 1;
  }
  
  h2 {
    text-align: center;
    color: var(--text-formula);
    margin-bottom: 2rem;
    font-size: 2rem;
  }
  
  .characters {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 3rem;
    margin-bottom: 3rem;
    flex-wrap: wrap;
  }
  
  @media (max-width: 768px) {
    .characters {
      gap: 1.5rem;
      flex-direction: column;
    }
    
    .arrow {
      transform: rotate(90deg);
    }
    
    .character {
      min-width: 100%;
    }
  }
  
  .character {
    text-align: center;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid var(--border-dark);
    border-radius: 12px;
    min-width: 200px;
    transition: all 0.3s ease;
    opacity: 0.5;
  }
  
  .character.active {
    opacity: 1;
    border-color: var(--accent-blue);
    box-shadow: 0 0 30px rgba(96, 165, 250, 0.5), 0 4px 20px rgba(96, 165, 250, 0.3);
    transform: scale(1.02);
  }
  
  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: bold;
    color: var(--bg-deep);
    margin: 0 auto 0.5rem auto;
    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.4);
  }
  
  .name {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-formula);
    margin-bottom: 1rem;
  }
  
  .keys {
    font-size: 0.85rem;
    text-align: left;
  }
  
  .key {
    margin: 0.5rem 0;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    font-family: var(--font-mono);
  }
  
  .key.public {
    color: var(--accent-blue);
  }
  
  .key.private {
    color: var(--accent-green);
  }
  
  .arrow {
    font-size: 2rem;
    color: var(--text-tertiary);
  }
  
  .scenario {
    margin: 2rem 0;
  }
  
  .step-box {
    background: rgba(255, 255, 255, 0.05);
    padding: 2rem;
    border-radius: 12px;
    border: 1px solid var(--border-medium);
    text-align: center;
  }
  
  .step-box.success {
    border-color: var(--accent-green);
    background: rgba(52, 211, 153, 0.1);
  }
  
  .step-box h3 {
    color: var(--text-formula);
    margin-bottom: 1rem;
  }
  
  .step-box p {
    color: var(--text-secondary);
    margin: 0.5rem 0;
  }
  
  .input-group {
    display: flex;
    gap: 1rem;
    margin: 1.5rem 0;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .message-input {
    padding: 0.75rem 1rem;
    font-size: 1rem;
    background: var(--bg-dark);
    border: 1px solid var(--border-medium);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: var(--font-mono);
    min-width: 200px;
  }
  
  .message-input:focus {
    outline: none;
    border-color: var(--accent-blue);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
  }
  
  .action-btn {
    padding: 0.75rem 2rem;
    background: var(--accent-blue);
    color: var(--bg-deep);
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: var(--font-sans);
  }
  
  .action-btn:hover:not(:disabled) {
    background: var(--accent-cyan);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.4);
  }
  
  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .hint {
    font-size: 0.9rem;
    color: var(--text-tertiary);
    font-style: italic;
    margin-top: 1rem;
  }
  
  .error-message {
    color: var(--error);
    font-size: 0.9rem;
    margin-top: 1rem;
    padding: 0.5rem;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 4px;
    border: 1px solid var(--error);
  }
  
  .message-flow {
    margin: 2rem 0;
  }
  
  .message-box {
    padding: 1.5rem;
    border-radius: 8px;
    margin: 1rem 0;
    font-family: var(--font-mono);
    font-size: 1.25rem;
  }
  
  .message-box.original {
    background: rgba(96, 165, 250, 0.2);
    border: 2px solid var(--accent-blue);
    color: var(--accent-blue);
  }
  
  .message-box.encrypted {
    background: rgba(239, 68, 68, 0.2);
    border: 2px solid var(--error);
    color: var(--error);
  }
  
  .message-box.decrypted {
    background: rgba(52, 211, 153, 0.2);
    border: 2px solid var(--accent-green);
    color: var(--accent-green);
  }
  
  .arrow-large {
    font-size: 2rem;
    text-align: center;
    color: var(--text-tertiary);
    margin: 0.5rem 0;
  }
  
  .security-note {
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-top: 1rem;
  }
  
  .success-message {
    margin: 2rem 0;
    padding: 1.5rem;
    background: rgba(52, 211, 153, 0.1);
    border-radius: 8px;
  }
  
  .success-message p {
    color: var(--text-secondary);
    margin: 0.5rem 0;
  }
  
  .math-visualization {
    margin-top: 2rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    border: 1px dashed var(--border-medium);
  }
  
  .math-visualization h4 {
    color: var(--text-formula);
    margin-bottom: 1rem;
  }
  
  .formula-step {
    margin: 1rem 0;
  }
  
  .formula-step p {
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }
  
  @media (max-width: 768px) {
    .characters {
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .arrow {
      transform: rotate(90deg);
    }
  }
</style>

