# WhisperBox

A secure, end-to-end encrypted messaging application built with Next.js, TypeScript, and the Web Crypto API. The server never sees plaintext — all encryption and decryption happens on the client.

---

## Live Demo

[https://whisperboxdemo.netlify.app/](https://whisperboxdemo.netlify.app/)

---

## Setup Instructions

### Requirements
- Node.js 18 or higher
- npm 9 or higher

### Steps

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/whisperbox.git
cd whisperbox
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create your environment file:**

Create a `.env.local` file at the root:
```
NEXT_PUBLIC_API_BASE_URL=https://whisperbox.koyeb.app
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open the app:**

Visit `http://localhost:3000` in your browser.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                     │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │   Next.js    │    │  Web Crypto  │    │   IndexedDB   │  │
│  │   App Router │    │     API      │    │  (Private Key)│  │
│  │   (React UI) │◄──►│ (Encryption) │    │               │  │
│  └──────┬───────┘    └──────────────┘    └───────────────┘  │
│         │                                                   │
│         │  Only encrypted blobs leave the client            │
│         │                                                   │
└─────────┼───────────────────────────────────────────────────┘
          │ HTTPS
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    WhisperBox API (Server)                  │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │    Auth      │    │   Messages   │    │     Users     │  │
│  │  (JWT Tokens)│    │  (Encrypted  │    │  (Public Keys)│  │
│  │              │    │   Blobs Only)│    │               │  │
│  └──────────────┘    └──────────────┘    └───────────────┘  │
│                                                             │
│           Server NEVER sees plaintext messages              │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
src/
├── app/
│   ├── page.tsx              # Root — redirects based on auth
│   ├── login/page.tsx        # Login page
│   ├── register/page.tsx     # Register page
│   └── chat/
│       ├── page.tsx          # Conversations list + chat (desktop split)
│       └── [userId]/page.tsx # Direct chat URL
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx     # Login form with key unwrapping
│   │   └── RegisterForm.tsx  # Register form with key generation
│   ├── chat/
│   │   ├── ConversationList.tsx      # Sidebar conversation list
│   │   ├── ChatWindow.tsx            # Message display + decrypt
│   │   ├── MessageBubble.tsx         # Individual message bubble
│   │   ├── MessageInput.tsx          # Text input + send
│   │   └── NewConversationModal.tsx  # User search modal
│   └── shared/
│       ├── AuthPanel.tsx      # Dark branding panel
│       ├── AuthInput.tsx      # Reusable input with icons
│       └── ProtectedRoute.tsx # Route guard
├── lib/
│   ├── crypto.ts    # All encryption/decryption logic
│   ├── api.ts       # API calls + session management
│   ├── storage.ts   # IndexedDB private key storage
│   └── constants.ts # API URLs, crypto config
├── types/
│   ├── auth.ts      # User, Session types
│   └── message.ts   # Message, Payload types
└── context/
    └── AuthContext.tsx  # Global auth state
```

---

## Encryption Flow Explanation

### Registration

```
1. Browser generates RSA-OAEP key pair (2048-bit)
         ↓
2. Browser generates random PBKDF2 salt (16 bytes)
         ↓
3. PBKDF2 derives wrapping key from password + salt
   (100,000 iterations of SHA-256)
         ↓
4. AES-KW wraps (encrypts) the private key
         ↓
5. Send to server:
   - public_key (plaintext — anyone can use to encrypt TO this user)
   - wrapped_private_key (encrypted — server cannot read)
   - pbkdf2_salt (needed to re-derive wrapping key on login)
   - password (server hashes and stores — never stored as plaintext)
         ↓
6. Store unwrapped private key in IndexedDB for this session
```

### Login

```
1. Send username + password to server
         ↓
2. Server returns:
   - JWT access token + refresh token
   - wrapped_private_key (the encrypted private key)
   - pbkdf2_salt
         ↓
3. Re-derive wrapping key from password + salt using PBKDF2
         ↓
4. AES-KW unwraps the private key
         ↓
5. Store unwrapped private key in IndexedDB
```

### Sending a Message

```
1. Generate a random AES-GCM key (256-bit) — unique per message
         ↓
2. Generate a random IV (12 bytes) — unique per message
         ↓
3. Encrypt message text with AES-GCM key + IV → ciphertext
         ↓
4. Encrypt AES key with RECIPIENT's RSA public key → encryptedKey
         ↓
5. Encrypt AES key with SENDER's own RSA public key → encryptedKeyForSelf
         ↓
6. Send to server:
   {
     ciphertext,         ← encrypted message
     iv,                 ← initialization vector
     encryptedKey,       ← AES key for recipient
     encryptedKeyForSelf ← AES key for sender (to read own sent messages)
   }
```

### Receiving a Message

```
1. Fetch encrypted message from server
         ↓
2. Get private key from IndexedDB
         ↓
3. Decrypt encryptedKey using RSA private key → AES key
         ↓
4. Decrypt ciphertext using AES key + IV → plaintext
         ↓
5. Display plaintext in the UI
   (plaintext is NEVER sent to the server)
```

---

## Key Management Explanation

### Public Key
- Generated on the client during registration
- Stored on the server in plaintext
- Anyone can fetch it to encrypt messages TO this user
- Used for: encrypting the AES message key

### Private Key
- Generated on the client during registration
- **Never sent to the server in plaintext**
- Wrapped (encrypted) with a password-derived AES-KW key before being stored on the server
- Unwrapped locally on login using the user's password
- Stored in **IndexedDB** for the current session — not localStorage
- Deleted from IndexedDB on logout

### Wrapping Key
- Derived from the user's password using PBKDF2 (100,000 iterations)
- **Never stored anywhere** — re-derived on every login
- Used only to wrap/unwrap the private key
- If the user forgets their password, the private key cannot be recovered

### Session Tokens
- JWT access token stored in localStorage
- Refresh token stored in localStorage
- Access token sent with every API request as `Authorization: Bearer <token>`
- Auto-refreshed when expired

---

## Security Trade-offs

### What is secure
- The server never sees plaintext messages
- Private keys never leave the client in plaintext
- Each message uses a unique AES key and IV (forward secrecy per message)
- Passwords are hashed on the server
- HTTPS enforced on all connections
- IndexedDB used for private key storage instead of localStorage

### Trade-offs made

**1. Wrapped private key stored on server**

The private key (encrypted with the password-derived key) is stored on the server so users can log in from any device. The trade-off is that if the server is compromised AND the attacker can brute-force the password, they can recover the private key. A more secure alternative would be to never store the private key anywhere and require users to manually transfer it between devices.

**2. Password-based key derivation**

The security of the private key depends entirely on the strength of the user's password. Weak passwords (fewer than 8 characters, common words) significantly reduce security even with 100,000 PBKDF2 iterations. A hardware security key (WebAuthn) would be more secure but adds complexity.

**3. Access tokens in localStorage**

JWT access tokens are stored in localStorage which is accessible to JavaScript. This makes the app vulnerable to XSS attacks that steal tokens. A more secure alternative is HttpOnly cookies, but this requires backend support.

**4. No perfect forward secrecy across sessions**

While each message uses a unique AES key (providing per-message forward secrecy), the RSA key pair is long-lived. If a user's private key is ever compromised, all past messages encrypted with that key pair could potentially be decrypted. True perfect forward secrecy (as in Signal Protocol) would require ephemeral key exchange per session.

**5. No message authentication beyond encryption**

AES-GCM provides authenticated encryption which detects tampering. However there is no additional signature on messages to prove they came from the claimed sender. A malicious server could theoretically swap message payloads.

---

## Known Limitations

- **Single device sessions** — private key is stored in IndexedDB per browser. Logging in on a new device requires entering the password again to unwrap the private key from the server.

- **No message history across devices** — messages are decrypted and displayed client-side. A new device login will show message ciphertexts fetched from the server, which are decrypted using the locally stored private key. If the private key is not yet in IndexedDB (fresh login), old messages are decrypted on demand.

- **No password recovery** — if a user forgets their password, the private key cannot be unwrapped and all messages become inaccessible. There is no reset mechanism.

- **No group messaging** — only 1-to-1 encrypted conversations are supported.

- **No file or media sharing** — only text messages are supported.

- **No push notifications** — the app uses polling (on page load) rather than WebSockets or push notifications. New messages only appear when the chat window is open.

- **No message deletion** — once a message is sent it cannot be deleted from the server.

- **Browser compatibility** — the Web Crypto API is required. This is supported in all modern browsers but not in very old browsers (IE11, old Safari).

- **IndexedDB cleared on browser data clear** — if a user clears their browser data, the private key is deleted from IndexedDB. They will need to log in again to restore it from the server using their password.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | Frontend framework and routing |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Web Crypto API | All encryption and key operations |
| IndexedDB | Secure private key storage |
| React Icons (Lucide) | UI icons |
| WhisperBox API | Backend — auth, message storage, key exchange |
| Netlify | Hosting and deployment |
