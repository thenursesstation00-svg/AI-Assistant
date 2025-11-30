// frontend/src/utils/crypto.js
const enc = new TextEncoder();
const dec = new TextDecoder();

export async function deriveOwnerKey(passphrase, salt) {
  const pwKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 200_000,
      hash: "SHA-256",
    },
    pwKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return key;
}

export async function encryptBlob(key, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  return {
    iv: Array.from(iv),
    ct: Array.from(new Uint8Array(ct)),
  };
}

export async function decryptBlob(key, payload) {
  const { iv, ct } = payload;
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    key,
    new Uint8Array(ct)
  );
  return dec.decode(plain);
}
