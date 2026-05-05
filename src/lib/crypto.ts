import { CRYPTO_CONFIG } from "./constants";

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

export function generateSalt(): string {
  const salt = crypto.getRandomValues(
    new Uint8Array(CRYPTO_CONFIG.PBKDF2_SALT_LENGTH),
  );
  return bufferToBase64(salt.buffer);
}

async function deriveWrappingKey(
  password: string,
  saltBase64: string,
): Promise<CryptoKey> {
  const passwordBytes = new TextEncoder().encode(password);
  const saltBytes = base64ToBuffer(saltBase64);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: CRYPTO_CONFIG.PBKDF2_ITERATIONS,
      hash: CRYPTO_CONFIG.PBKDF2_HASH,
    },
    keyMaterial,
    {
      name: "AES-KW",
      length: CRYPTO_CONFIG.AES_KEY_LENGTH,
    },
    false,
    ["wrapKey", "unwrapKey"],
  );
}

export async function generateKeyPair(): Promise<{
  publicKeyBase64: string;
  privateKey: CryptoKey;
}> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: CRYPTO_CONFIG.RSA_KEY_SIZE,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: CRYPTO_CONFIG.RSA_HASH,
    },
    true,
    ["encrypt", "decrypt"],
  );

  const publicKeyBuffer = await crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey,
  );
  const publicKeyBase64 = bufferToBase64(publicKeyBuffer);

  return {
    publicKeyBase64,
    privateKey: keyPair.privateKey,
  };
}

export async function wrapPrivateKey(
  privateKey: CryptoKey,
  password: string,
  saltBase64: string,
): Promise<string> {
  const wrappingKey = await deriveWrappingKey(password, saltBase64);
  const wrappedBuffer = await crypto.subtle.wrapKey(
    "pkcs8",
    privateKey,
    wrappingKey,
    "AES-KW",
  );

  return bufferToBase64(wrappedBuffer);
}

export async function unwrapPrivateKey(
  wrappedPrivateKeyBase64: string,
  password: string,
  saltBase64: string,
): Promise<CryptoKey> {
  const wrappingKey = await deriveWrappingKey(password, saltBase64);
  const wrappedKeyBuffer = base64ToBuffer(wrappedPrivateKeyBase64);

  return crypto.subtle.unwrapKey(
    "pkcs8",
    wrappedKeyBuffer,
    wrappingKey,
    "AES-KW",
    {
      name: "RSA-OAEP",
      hash: CRYPTO_CONFIG.RSA_HASH,
    },
    true,
    ["decrypt"],
  );
}

export async function importPublicKey(
  publicKeyBase64: string,
): Promise<CryptoKey> {
  const keyBuffer = base64ToBuffer(publicKeyBase64);

  return crypto.subtle.importKey(
    "spki",
    keyBuffer,
    {
      name: "RSA-OAEP",
      hash: CRYPTO_CONFIG.RSA_HASH,
    },
    true,
    ["encrypt"],
  );
}

export async function encryptMessage(
  plaintext: string,
  recipientPublicKeyBase64: string,
  senderPublicKeyBase64: string,
): Promise<{
  ciphertext: string;
  iv: string;
  encryptedKey: string;
  encryptedKeyForSelf: string;
}> {
  const aesKey = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: CRYPTO_CONFIG.AES_KEY_LENGTH,
    },
    true,
    ["encrypt", "decrypt"],
  );

  const iv = crypto.getRandomValues(
    new Uint8Array(CRYPTO_CONFIG.AES_IV_LENGTH),
  );
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey,
    plaintextBytes,
  );

  const aesKeyBuffer = await crypto.subtle.exportKey("raw", aesKey);
  const recipientPublicKey = await importPublicKey(recipientPublicKeyBase64);

  const encryptedKeyBuffer = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    recipientPublicKey,
    aesKeyBuffer,
  );

  const senderPublicKey = await importPublicKey(senderPublicKeyBase64);
  const encryptedKeyForSelfBuffer = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    senderPublicKey,
    aesKeyBuffer,
  );

  return {
    ciphertext: bufferToBase64(ciphertextBuffer),
    iv: bufferToBase64(iv.buffer),
    encryptedKey: bufferToBase64(encryptedKeyBuffer),
    encryptedKeyForSelf: bufferToBase64(encryptedKeyForSelfBuffer),
  };
}

export async function decryptMessage(
  ciphertextBase64: string,
  ivBase64: string,
  encryptedKeyBase64: string,
  privateKey: CryptoKey,
): Promise<string> {
  // step 1 — decrypt the AES key using our RSA private key
  const encryptedKeyBuffer = base64ToBuffer(encryptedKeyBase64);
  const aesKeyBuffer = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey, // our private key
    encryptedKeyBuffer, // the encrypted AES key
  );

  // step 2 — import the decrypted AES key back into a CryptoKey object
  const aesKey = await crypto.subtle.importKey(
    "raw", // format
    aesKeyBuffer, // the raw AES key bytes
    { name: "AES-GCM" },
    false, // not extractable
    ["decrypt"], // can only be used for decryption
  );

  // step 3 — convert the IV and ciphertext from Base64 back to bytes
  const iv = base64ToBuffer(ivBase64);
  const ciphertextBuffer = base64ToBuffer(ciphertextBase64);

  // step 4 — decrypt the message with the AES key and IV
  const plaintextBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv, // must use the exact same IV that was used during encryption
    },
    aesKey,
    ciphertextBuffer,
  );

  // step 5 — convert the decrypted bytes back to a string
  // TextDecoder is the reverse of TextEncoder
  return new TextDecoder().decode(plaintextBuffer);
}
