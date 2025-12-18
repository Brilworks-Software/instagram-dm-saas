
import puppeteer, { Browser, Page } from 'puppeteer';
import { instagramCookieService } from './cookie-service';
import type { InstagramCookies, InstagramUserInfo } from './types';

// ============================================================================
// Types
// ============================================================================

export interface BrowserLoginSession {
  sessionId: string;
  status: 'pending' | 'waiting_login' | 'logged_in' | 'failed' | 'completed';
  browser?: Browser;
  page?: Page;
  cookies?: InstagramCookies;
  userInfo?: InstagramUserInfo;
  error?: string;
  createdAt: Date;
}

// ============================================================================
// Service
// ============================================================================

export class InstagramBrowserService {
  // Active login sessions
  private sessions: Map<string, BrowserLoginSession> = new Map();

  /**
   * Starts a browser login session.
   * Opens Instagram in a visible browser for the user to login.
   */
  async startBrowserLogin(workspaceId: string): Promise<{ sessionId: string; message: string }> {
    const sessionId = `login_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    console.log(`Starting browser login session: ${sessionId}`);
    
    // Create session
    const session: BrowserLoginSession = {
      sessionId,
      status: 'pending',
      createdAt: new Date(),
    };
    this.sessions.set(sessionId, session);
    
    // Launch browser in background
    this.launchBrowserAndWaitForLogin(sessionId, workspaceId).catch((error) => {
      console.error(`Browser login failed: ${error.message}`);
      const s = this.sessions.get(sessionId);
      if (s) {
        s.status = 'failed';
        s.error = error.message;
      }
    });
    
    return {
      sessionId,
      message: 'Browser is opening. Please login to Instagram in the browser window.',
    };
  }

  /**
   * Launches browser and waits for Instagram login.
   */
  private async launchBrowserAndWaitForLogin(sessionId: string, workspaceId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    let browser: Browser | null = null;

    try {
      // Launch visible browser
      browser = await puppeteer.launch({
        headless: false, // Show browser window
        defaultViewport: { width: 1280, height: 800 },
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--window-size=1280,800',
        ],
      });

      session.browser = browser;
      
      const page = await browser.newPage();
      session.page = page;
      
      // Set user agent to avoid detection
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Navigate to Instagram
      session.status = 'waiting_login';
      await page.goto('https://www.instagram.com/accounts/login/', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      console.log(`Browser opened for session ${sessionId}. Waiting for login...`);

      // Wait for successful login (check for presence of profile elements)
      await this.waitForLogin(page, sessionId);

      // Extract cookies after login
      const cookies = await this.extractCookies(page);
      session.cookies = cookies;

      // Verify and get user info
      const userInfo = await instagramCookieService.verifySession(cookies);
      session.userInfo = userInfo;

      // Try to save account to database (but don't fail if database is unavailable)
      try {
        await instagramCookieService.saveAccountWithCookies(workspaceId, cookies, userInfo);
      } catch (dbError) {
        console.warn(`Could not save to database: ${(dbError as Error).message}`);
      }

      session.status = 'completed';
      console.log(`Login successful for @${userInfo.username}`);

      // Close browser after short delay
      setTimeout(async () => {
        try {
          await browser?.close();
        } catch (e) {
          // Ignore close errors
        }
      }, 2000);

    } catch (error) {
      session.status = 'failed';
      session.error = (error as Error).message;
      console.error(`Browser login error: ${(error as Error).message}`);
      
      // Close browser on error
      try {
        await browser?.close();
      } catch (e) {
        // Ignore
      }
    }
  }

  /**
   * Waits for successful Instagram login.
   */
  private async waitForLogin(page: Page, sessionId: string): Promise<void> {
    const maxWaitTime = 5 * 60 * 1000; // 5 minutes max wait
    const checkInterval = 2000; // Check every 2 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const session = this.sessions.get(sessionId);
      if (!session || session.status === 'failed') {
        throw new Error('Session cancelled or failed');
      }

      // Check if we're on a logged-in page
      const currentUrl = page.url();
      
      // Check for login success indicators
      const isLoggedIn = await page.evaluate(() => {
        // Check for home feed or profile elements
        const hasHomeIcon = document.querySelector('[aria-label="Home"]') !== null;
        const hasProfileIcon = document.querySelector('[aria-label="Profile"]') !== null;
        const hasNavigation = document.querySelector('nav') !== null;
        const notOnLoginPage = !window.location.pathname.includes('/accounts/login');
        
        return (hasHomeIcon || hasProfileIcon) && hasNavigation && notOnLoginPage;
      });

      if (isLoggedIn || (currentUrl.includes('instagram.com') && !currentUrl.includes('/accounts/login'))) {
        // Double check with cookies
        const cookies = await page.cookies();
        const hasSessionId = cookies.some((c) => c.name === 'sessionid' && c.value);
        
        if (hasSessionId) {
          console.log(`Login detected for session ${sessionId}`);
          session.status = 'logged_in';
          return;
        }
      }

      await this.delay(checkInterval);
    }

    throw new Error('Login timeout. Please try again.');
  }

  /**
   * Extracts Instagram cookies from the page.
   */
  private async extractCookies(page: Page): Promise<InstagramCookies> {
    const cookies = await page.cookies();
    
    const getCookie = (name: string): string => {
      const cookie = cookies.find((c) => c.name === name);
      return cookie?.value || '';
    };

    const instagramCookies: InstagramCookies = {
      sessionId: getCookie('sessionid'),
      csrfToken: getCookie('csrftoken'),
      dsUserId: getCookie('ds_user_id'),
      igDid: getCookie('ig_did'),
      mid: getCookie('mid'),
      rur: getCookie('rur'),
    };

    if (!instagramCookies.sessionId || !instagramCookies.dsUserId) {
      throw new Error('Failed to extract required cookies. Please try logging in again.');
    }

    return instagramCookies;
  }

  // ==========================================================================
  // Session Management
  // ==========================================================================

  /**
   * Gets the status of a login session.
   */
  getSessionStatus(sessionId: string): BrowserLoginSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Return sanitized session (without browser/page refs)
    return {
      sessionId: session.sessionId,
      status: session.status,
      userInfo: session.userInfo,
      error: session.error,
      createdAt: session.createdAt,
    };
  }

  /**
   * Cancels a login session.
   */
  async cancelSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = 'failed';
    session.error = 'Session cancelled by user';

    try {
      await session.browser?.close();
    } catch (e) {
      // Ignore close errors
    }

    this.sessions.delete(sessionId);
  }

  /**
   * Cleans up old sessions.
   */
  cleanupOldSessions(): void {
    const maxAge = 10 * 60 * 1000; // 10 minutes
    const now = Date.now();

    Array.from(this.sessions.entries()).forEach(([sessionId, session]) => {
      if (now - session.createdAt.getTime() > maxAge) {
        this.cancelSession(sessionId);
      }
    });
  }

  // ==========================================================================
  // Quick Login with Existing Browser Session
  // ==========================================================================

  /**
   * Checks for existing Instagram session in the default Chrome profile.
   * This attempts to use cookies from the user's already logged-in browser.
   */
  async checkExistingSession(workspaceId: string): Promise<{
    found: boolean;
    userInfo?: InstagramUserInfo;
    accountId?: string;
  }> {
    let browser: Browser | null = null;

    try {
      // Try to launch with user's Chrome profile
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      });

      const page = await browser.newPage();
      
      // Navigate to Instagram
      await page.goto('https://www.instagram.com/', {
        waitUntil: 'networkidle2',
        timeout: 15000,
      });

      // Check if already logged in
      const cookies = await page.cookies();
      const sessionCookie = cookies.find((c) => c.name === 'sessionid' && c.value);

      if (!sessionCookie) {
        await browser.close();
        return { found: false };
      }

      // Extract cookies and verify
      const instagramCookies = await this.extractCookies(page);
      const userInfo = await instagramCookieService.verifySession(instagramCookies);

      // Save account
      const saved = await instagramCookieService.saveAccountWithCookies(
        workspaceId,
        instagramCookies,
        userInfo
      );

      await browser.close();

      return {
        found: true,
        userInfo,
        accountId: saved.id,
      };

    } catch (error) {
      console.warn(`No existing session found: ${(error as Error).message}`);
      
      try {
        await browser?.close();
      } catch (e) {
        // Ignore
      }

      return { found: false };
    }
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const instagramBrowserService = new InstagramBrowserService();

