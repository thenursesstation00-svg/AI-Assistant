import { deriveOwnerKey, encryptBlob, decryptBlob } from './crypto';

test('deriveOwnerKey returns a CryptoKey', async () => {
  const key = await deriveOwnerKey('testpass', 'testsalt');
  expect(key).toBeDefined();
});

test('encryptBlob and decryptBlob roundtrip', async () => {
  const key = await deriveOwnerKey('testpass', 'testsalt');
  const plaintext = 'hello world';
  const encrypted = await encryptBlob(key, plaintext);
  expect(encrypted).toHaveProperty('iv');
  expect(encrypted).toHaveProperty('ct');
  const decrypted = await decryptBlob(key, encrypted);
  expect(decrypted).toBe(plaintext);
});
