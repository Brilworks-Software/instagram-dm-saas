import { ImageResponse } from 'next/og'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Force Node.js runtime to support filesystem access
export const runtime = 'nodejs'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  try {
    // Read the logo file
    const logoPath = join(process.cwd(), 'public/images/logo.png')
    const logoData = readFileSync(logoPath)
    const base64Logo = `data:image/png;base64,${logoData.toString('base64')}`

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            overflow: 'hidden', // Ensure we don't show outside the box
          }}
        >
          {/* Render the image significantly larger to zoom in and remove padding */}
          <img
            src={base64Logo}
            style={{
              width: '54px', // 1.7x scale to fill the space
              height: '54px',
              objectFit: 'contain',
            }}
          />
        </div>
      ),
      {
        ...size,
      }
    )
  } catch (e) {
    console.error('Error generating icon:', e)
    // Fallback to a simple colored box if something fails, so we know it's working but failing to load image
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#ec4899', // Pink fallback
            borderRadius: '8px',
          }}
        />
      ),
      { ...size }
    )
  }
}
