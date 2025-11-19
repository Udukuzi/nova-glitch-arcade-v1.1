import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Verify a signed message
 * @param publicKey - The public key of the signer
 * @param signature - The signature in hex format
 * @param message - The original message that was signed
 * @returns boolean - True if the signature is valid
 */
export const verifySignature = (
  publicKey: string,
  signature: string,
  message: string
): boolean => {
  try {
    const publicKeyObj = new PublicKey(publicKey);
    const signatureBytes = bs58.decode(signature);
    const messageBytes = new TextEncoder().encode(message);
    
    return publicKeyObj.verify(
      messageBytes,
      signatureBytes
    );
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

/**
 * Sign in with a wallet
 * @param publicKey - The public key of the wallet
 * @param signature - The signature in hex format
 * @param message - The original message that was signed
 * @returns boolean - True if sign in was successful
 */
export const signIn = async (
  publicKey: string,
  signature: string,
  message: string
): Promise<boolean> => {
  try {
    // In a real app, you would send this to your backend for verification
    // For now, we'll just verify it client-side
    const isValid = verifySignature(publicKey, signature, message);
    
    if (isValid) {
      // Store session data
      localStorage.setItem('wallet_session', 'true');
      localStorage.setItem('wallet_public_key', publicKey);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error during sign in:', error);
    return false;
  }
};

/**
 * Check if user is signed in
 * @returns boolean - True if user is signed in
 */
export const isSignedIn = (): boolean => {
  return localStorage.getItem('wallet_session') === 'true';
};

/**
 * Sign out the current user
 */
export const signOut = (): void => {
  localStorage.removeItem('wallet_session');
  localStorage.removeItem('wallet_public_key');
};
