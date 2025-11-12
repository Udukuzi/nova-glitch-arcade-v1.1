import { useState } from 'react'

interface SocialLink {
  name: string
  icon: string
  url?: string // Will be added when links are ready
  inactive?: boolean
  isImage?: boolean
  imagePath?: string
}

export default function Footer() {
  // Social links - inactive until URLs are provided (only 3: X, Telegram, DexScreener)
  const socialLinks: SocialLink[] = [
    { name: 'X (Twitter)', icon: 'X', url: 'https://x.com/i/communities/1986850191111250304', inactive: false, isImage: true, imagePath: '/x_logo.png' },
    { name: 'Telegram', icon: '✈️', url: 'https://t.me/NAGTokenBot', inactive: false },
    { name: 'DexScreener', icon: 'D', url: 'https://dexscreener.com/solana/Gd5oUtNMQ5rHG9io17Rv2XdrZ3LGQHQcCqQgD8sSw3GB', inactive: false, isImage: true, imagePath: '/dexscreener_logo.png' },
  ]

  const handleSocialClick = (link: SocialLink) => {
    if (link.url && !link.inactive) {
      window.open(link.url, '_blank', 'noopener,noreferrer')
    } else {
      // Show coming soon message
      alert(`${link.name} link will be available soon!`)
    }
  }

  return (
    <footer style={{
      marginTop: 60,
      padding: '40px 20px',
      borderTop: '1px solid #1e2236',
      textAlign: 'center',
      background: 'linear-gradient(180deg, transparent, rgba(14, 15, 21, 0.5))'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        <h3 style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: 20,
          marginBottom: 20,
          color: '#eaeaf0'
        }}>
          Connect With Us
        </h3>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap',
          marginBottom: 30
        }}>
          {socialLinks.map((link, index) => (
            <button
              key={index}
              data-index={index}
              onClick={() => handleSocialClick(link)}
              disabled={link.inactive}
              style={{
                background: link.inactive 
                  ? 'rgba(30, 34, 54, 0.5)' 
                  : `linear-gradient(135deg, ${link.name === 'DexScreener' ? '#6b46c1' : link.name === 'X (Twitter)' ? '#000' : '#1e2236'}, #0e0f15)`,
                border: `2px solid ${link.inactive ? '#1e2236' : (link.name === 'DexScreener' ? '#8af0ff' : link.name === 'X (Twitter)' ? '#fff' : '#0088cc')}`,
                borderRadius: 12,
                padding: '16px 24px',
                cursor: link.inactive ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: link.inactive ? 0.5 : 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                minWidth: 100,
                position: 'relative',
                overflow: 'hidden',
                // Arcade glow effect
                filter: link.inactive 
                  ? 'none' 
                  : link.name === 'X (Twitter)'
                  ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))'
                  : link.name === 'Telegram'
                  ? 'drop-shadow(0 0 10px rgba(0, 136, 204, 0.6)) drop-shadow(0 0 20px rgba(0, 136, 204, 0.4))'
                  : 'drop-shadow(0 0 10px rgba(138, 240, 255, 0.6)) drop-shadow(0 0 20px rgba(138, 240, 255, 0.4))'
              }}
              onMouseEnter={(e) => {
                if (!link.inactive) {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)'
                  const shadowColor = link.name === 'DexScreener' 
                    ? 'rgba(138, 240, 255, 0.9)' 
                    : link.name === 'X (Twitter)'
                    ? 'rgba(255, 255, 255, 0.8)'
                    : 'rgba(0, 136, 204, 0.9)'
                  e.currentTarget.style.boxShadow = `0 8px 20px ${shadowColor}`
                  e.currentTarget.style.filter = link.name === 'X (Twitter)'
                    ? 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 30px rgba(255, 255, 255, 0.5))'
                    : link.name === 'Telegram'
                    ? 'drop-shadow(0 0 15px rgba(0, 136, 204, 0.9)) drop-shadow(0 0 30px rgba(0, 136, 204, 0.6))'
                    : 'drop-shadow(0 0 15px rgba(138, 240, 255, 0.9)) drop-shadow(0 0 30px rgba(138, 240, 255, 0.6))'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = 'none'
                const linkIndex = parseInt(e.currentTarget.getAttribute('data-index') || '0')
                const currentLink = socialLinks[linkIndex]
                e.currentTarget.style.filter = currentLink.inactive 
                  ? 'none' 
                  : currentLink.name === 'X (Twitter)'
                  ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))'
                  : currentLink.name === 'Telegram'
                  ? 'drop-shadow(0 0 10px rgba(0, 136, 204, 0.6)) drop-shadow(0 0 20px rgba(0, 136, 204, 0.4))'
                  : 'drop-shadow(0 0 10px rgba(138, 240, 255, 0.6)) drop-shadow(0 0 20px rgba(138, 240, 255, 0.4))'
              }}
            >
              {/* Render logo images - Uniform 48x48 size for all logos */}
              {link.name === 'X (Twitter)' ? (
                <img 
                  src="/x_logo.png" 
                  alt="X (Twitter)"
                  onError={(e) => {
                    // Fallback if image doesn't exist yet
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent && !parent.querySelector('.fallback-x')) {
                      const fallback = document.createElement('div')
                      fallback.className = 'fallback-x'
                      fallback.style.cssText = 'width: 48px; height: 48px; background: #000; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; font-size: 28px; font-weight: bold; color: #fff; font-family: Arial, sans-serif;'
                      fallback.textContent = 'X'
                      parent.appendChild(fallback)
                    }
                  }}
                  style={{
                    width: 48,
                    height: 48,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))'
                  }}
                />
              ) : link.name === 'Telegram' ? (
                <img 
                  src="/telegram_logo.svg" 
                  alt="Telegram"
                  onError={(e) => {
                    // Fallback to Font Awesome icon if image doesn't load
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent && !parent.querySelector('.fallback-telegram')) {
                      const fallback = document.createElement('i')
                      fallback.className = 'fab fa-telegram-plane fallback-telegram'
                      fallback.style.cssText = 'font-size: 32px; color: #0088cc; text-shadow: 0 0 10px rgba(0, 136, 204, 0.8);'
                      parent.appendChild(fallback)
                    }
                  }}
                  style={{
                    width: 48,
                    height: 48,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 10px rgba(0, 136, 204, 0.6)) drop-shadow(0 0 20px rgba(0, 136, 204, 0.4))'
                  }}
                />
              ) : link.name === 'DexScreener' ? (
                <img 
                  src="/dexscreener_logo.png" 
                  alt="DexScreener"
                  onError={(e) => {
                    // Fallback if image doesn't exist yet
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent && !parent.querySelector('.fallback-dex')) {
                      const fallback = document.createElement('div')
                      fallback.className = 'fallback-dex'
                      fallback.style.cssText = 'font-size: 18px; color: #8af0ff; font-family: Orbitron, sans-serif; font-weight: bold;'
                      fallback.textContent = 'DEX'
                      parent.appendChild(fallback)
                    }
                  }}
                  style={{
                    width: 48,
                    height: 48,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 10px rgba(138, 240, 255, 0.6)) drop-shadow(0 0 20px rgba(138, 240, 255, 0.4))'
                  }}
                />
              ) : (
                <span style={{ fontSize: 32 }}>{link.icon}</span>
              )}
              <span style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: 14,
                color: '#eaeaf0',
                opacity: 0.9
              }}>
                {link.name}
              </span>
              {link.inactive && (
                <span style={{
                  fontSize: 10,
                  color: '#8af0ff',
                  opacity: 0.7,
                  marginTop: -4
                }}>
                  Coming Soon
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{
          marginTop: 30,
          paddingTop: 30,
          borderTop: '1px solid #1e2236',
          opacity: 0.6
        }}>
          <p style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: 14,
            color: '#8af0ff'
          }}>
            © 2025 Nova Arcade Glitch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

