/**
 * Jupiter Swap API Proxy
 * Handles real Jupiter V6 API calls from backend to bypass CORS
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Jupiter API endpoints
const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6';
const JUPITER_PRICE_API = 'https://price.jup.ag/v4';

/**
 * GET /api/jupiter/quote
 * Proxy Jupiter quote requests
 */
router.get('/quote', async (req, res) => {
  try {
    const { inputMint, outputMint, amount, slippageBps = 100 } = req.query;

    if (!inputMint || !outputMint || !amount) {
      return res.status(400).json({
        error: 'Missing required parameters: inputMint, outputMint, amount'
      });
    }

    console.log('🔍 Jupiter Quote Request:', {
      inputMint,
      outputMint,
      amount,
      slippageBps
    });

    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps: slippageBps.toString(),
      onlyDirectRoutes: 'false',
      asLegacyTransaction: 'false'
    });

    const response = await axios.get(`${JUPITER_QUOTE_API}/quote?${params}`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Nova-Arcade/1.0'
      }
    });

    console.log('✅ Jupiter Quote Success');
    res.json(response.data);

  } catch (error) {
    console.error('❌ Jupiter Quote Error:', error.message);
    
    if (error.response) {
      // Jupiter API error
      res.status(error.response.status).json({
        error: 'Jupiter API error',
        message: error.response.data?.error || error.message,
        status: error.response.status
      });
    } else if (error.code === 'ENOTFOUND') {
      res.status(503).json({
        error: 'Network error',
        message: 'Unable to reach Jupiter API'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

/**
 * POST /api/jupiter/swap
 * Proxy Jupiter swap transaction requests
 */
router.post('/swap', async (req, res) => {
  try {
    const { quoteResponse, userPublicKey, wrapAndUnwrapSol = true, prioritizationFeeLamports = 100000 } = req.body;

    if (!quoteResponse || !userPublicKey) {
      return res.status(400).json({
        error: 'Missing required parameters: quoteResponse, userPublicKey'
      });
    }

    console.log('🔄 Jupiter Swap Request for:', userPublicKey);

    const swapRequest = {
      quoteResponse,
      userPublicKey,
      wrapAndUnwrapSol,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports
    };

    const response = await axios.post(`${JUPITER_QUOTE_API}/swap`, swapRequest, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Nova-Arcade/1.0'
      }
    });

    console.log('✅ Jupiter Swap Transaction Ready');
    res.json(response.data);

  } catch (error) {
    console.error('❌ Jupiter Swap Error:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'Jupiter API error',
        message: error.response.data?.error || error.message,
        status: error.response.status
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

/**
 * GET /api/jupiter/price/:mint
 * Get token price from Jupiter
 */
router.get('/price/:mint', async (req, res) => {
  try {
    const { mint } = req.params;

    const response = await axios.get(`${JUPITER_PRICE_API}/price?ids=${mint}`, {
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Nova-Arcade/1.0'
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('❌ Jupiter Price Error:', error.message);
    res.status(500).json({
      error: 'Failed to get price',
      message: error.message
    });
  }
});

/**
 * GET /api/jupiter/tokens
 * Get list of supported tokens
 */
router.get('/tokens', async (req, res) => {
  try {
    // Return our supported tokens list
    const supportedTokens = [
      {
        mint: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
      },
      {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
      },
      {
        mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg'
      },
      {
        mint: process.env.NAG_TOKEN_MINT || '957tKDz9GKtY3X54WuJUkhYfnNJsrAoyQQZpMjS1pump',
        symbol: 'NAG',
        name: 'Nova Arcade Glitch',
        decimals: 6,
        logoURI: '/nag-logo.png'
      }
    ];

    res.json({ tokens: supportedTokens });

  } catch (error) {
    console.error('❌ Tokens Error:', error.message);
    res.status(500).json({
      error: 'Failed to get tokens',
      message: error.message
    });
  }
});

module.exports = router;
