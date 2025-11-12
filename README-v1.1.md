
---
# v1.1 Security & JWT Nonce Flow

## Nonce + Signed Message Flow
1. Frontend requests `POST /api/auth/nonce` with wallet address -> server writes nonce to profiles and returns nonce.
2. Frontend asks wallet to sign the nonce (Phantom: signMessage; MetaMask: personal_sign).
3. Frontend sends `POST /api/auth/verify` with chain, address, signature -> server verifies signature and issues JWT.
4. Frontend stores JWT (in-memory or secure cookie) and includes `Authorization: Bearer <token>` for protected endpoints.

## Environment Variables (server/.env)
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- BSC_RPC
- SOL_RPC
- JWT_SECRET
- MIN_HOLD (default 50000)
- MIN_STAKE (default 250000)
- TOKEN_DECIMALS (default 18 for EVM tokens)

