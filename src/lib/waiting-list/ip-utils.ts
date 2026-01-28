import { NextRequest } from 'next/server';

/**
 * IP location data structure
 */
export interface IPLocation {
  city: string;
  region: string;
  country: string;
  countryCode: string;
  timezone: string;
  isp: string;
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return request.ip || 'unknown';
}

/**
 * Get location data from IP address using ipapi.co
 */
export async function getIPLocation(ip: string): Promise<IPLocation | null> {
  if (!ip || ip === 'unknown') {
    console.warn('Invalid IP provided to getIPLocation:', ip);
    return null;
  }

  console.log('🌐 Fetching location for IP:', ip);
  
  try {
    const url = `https://freeipapi.com/api/json/${ip}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout for the fetch itself
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ ipapi.co response not ok:",
        response.status,
        response.statusText
      );
      console.error("Error response body:", errorText);
      return null;
    }

    const data = await response.json();
    console.log('📍 IP API raw response:', JSON.stringify(data));

    // Check if API returned an error
    if (data.error) {
      console.error("❌ ipapi.co API error:", data.reason || data.error);
      return null;
    }

    // Check if we got valid location data
    if (!data.cityName && !data.regionName && !data.countryName) {
      console.warn("⚠️ No location data in response:", data);
      return null;
    }

    const location: IPLocation = {
      city: data.cityName || "",
      region: data.regionName || "",
      country: data.countryName || "",
      countryCode: data.countryCode || "",
      timezone: data.timeZones[0] || "",
      isp: data.asnOrganization || "",
    };

    console.log('✅ Parsed location:', location);
    return location;
  } catch (error) {
    console.error('❌ Error fetching IP location:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return null;
  }
}

