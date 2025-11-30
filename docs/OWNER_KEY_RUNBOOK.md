# Owner-Key Runbook: Key Creation, Recovery, Rotation, and Incident Response

## 1. Key Creation
- On first use, user sets a passphrase (optionally uses OS keystore/hardware key).
- System derives K_owner using PBKDF2 and stores:
  - A salt (non-secret, stored server-side).
  - A hint (optional, local).
- No passphrase or key material is ever sent to server.

## 2. Lost Key Scenario
- If user loses passphrase and does not have device-keystore backup:
  - Memory artifacts remain encrypted forever (cannot be decrypted).
  - Provide:
    - Option A: reset identity → generate new K_owner, start fresh (old memory shards inaccessible).
    - Clear UX warnings that old “soul” is effectively lost.

## 3. Key Rotation
- User decides to rotate key:
  - Client decrypts all artifacts with old key.
  - Re-encrypts with new key.
  - Uploads new ciphertext and marks old ciphertext as retired.
- In practice, you can stream this to avoid memory explosions.

## 4. New Device / Rehome
- Login on a new device:
  - User enters passphrase.
  - Device derives K_owner.
  - Device can now decrypt previously stored ciphertext.
- You may use OS keychain to store the key securely on each device.

## 5. Incident Response
- If suspicion of compromise:
  - User rotates K_owner or resets identity.
  - Immediately revoke sessions and API tokens.
  - Provide log overview:
    - Which personas were active.
    - What actions they took (high-level, no private content).
  - In a severe event, allow user to wipe all encrypted artifacts server-side (even though attacker can’t decrypt them, user may want deletion).
