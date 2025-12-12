'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Instagram, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  X,
  Copy,
  Check,
  Cookie,
  Send,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { InstagramAccount } from '@/types';

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID;
const META_OAUTH_REDIRECT_URI = process.env.NEXT_PUBLIC_META_OAUTH_REDIRECT_URI || `${typeof window !== 'undefined' ? window.location.origin : ''}/api/instagram/callback`;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface InstagramCookies {
  sessionId: string;
  csrfToken: string;
  dsUserId: string;
  igDid?: string;
  mid?: string;
  rur?: string;
}

export default function InstagramSettingsPage() {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [showSendDMModal, setShowSendDMModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountsWithCookies, setAccountsWithCookies] = useState<Set<string>>(new Set());
  
  // Cookie-based auth state
  const [cookies, setCookies] = useState<InstagramCookies>({
    sessionId: '',
    csrfToken: '',
    dsUserId: '',
    igDid: '',
    mid: '',
    rur: '',
  });
  const [isVerifyingCookies, setIsVerifyingCookies] = useState(false);
  const [cookieUser, setCookieUser] = useState<{ username: string; fullName: string; profilePicUrl?: string } | null>(null);
  
  // Browser login state
  const [isBrowserLoggingIn, setIsBrowserLoggingIn] = useState(false);
  const [browserSessionId, setBrowserSessionId] = useState<string | null>(null);
  const [browserLoginStatus, setBrowserLoginStatus] = useState<string>('');
  
  // Send DM state
  const [dmRecipient, setDmRecipient] = useState('');
  const [dmMessage, setDmMessage] = useState('');
  const [isSendingDM, setIsSendingDM] = useState(false);
  const [dmResult, setDmResult] = useState<{ success: boolean; error?: string } | null>(null);

  // Check which accounts have valid cookies in localStorage
  const checkAccountCookies = useCallback((accountsList: InstagramAccount[]) => {
    const accountsWithValidCookies = new Set<string>();
    
    accountsList.forEach(account => {
      const cookiesStr = localStorage.getItem(`dmflow_cookies_${account.igUserId}`);
      console.log(`Checking cookies for account ${account.igUsername} (ID: ${account.igUserId}):`, cookiesStr ? 'FOUND' : 'NOT FOUND');
      if (cookiesStr) {
        try {
          const cookies = JSON.parse(cookiesStr);
          // Check if cookies object has the required fields
          if (cookies.sessionId && cookies.csrfToken && cookies.dsUserId) {
            console.log(`✓ Valid cookies found for @${account.igUsername}`);
            accountsWithValidCookies.add(account.id);
          } else {
            console.log(`✗ Invalid cookies structure for @${account.igUsername}`);
          }
        } catch (e) {
          console.error('Failed to parse cookies:', e);
        }
      }
    });
    
    console.log('Accounts with valid cookies:', accountsWithValidCookies.size, 'out of', accountsList.length);
    setAccountsWithCookies(accountsWithValidCookies);
  }, []);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('instagram_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching accounts:', error);
        setAccounts([]);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedAccounts: InstagramAccount[] = (data || []).map((acc: any) => ({
        id: acc.id,
        igUserId: acc.ig_user_id,
        igUsername: acc.ig_username,
        profilePictureUrl: acc.profile_picture_url,
        isActive: acc.is_active,
        dailyDmLimit: acc.daily_dm_limit,
        dmsSentToday: acc.dms_sent_today,
        createdAt: acc.created_at,
      }));

      setAccounts(transformedAccounts);
      
      // Check cookies after loading accounts
      setTimeout(() => {
        checkAccountCookies(transformedAccounts);
      }, 100);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Check for success/error from OAuth callback or extension
  useEffect(() => {
    const handleConnectedAccount = async () => {
      const params = new URLSearchParams(window.location.search);
      const success = params.get('success');
      const account = params.get('account');
      const errorParam = params.get('error');
      const message = params.get('message');
      const connectedData = params.get('connected');

      // Handle account connected from extension
      if (connectedData) {
        try {
          const accountData = JSON.parse(atob(connectedData));
          console.log('Received account data from extension:', accountData);
          
          // Save to Supabase database
          const supabase = createClient();
          
          // Use fixed workspace ID (from seed data)
          const workspaceId = '11111111-1111-1111-1111-111111111111';
          
          // Check if account already exists
          const { data: existingAccount } = await supabase
            .from('instagram_accounts')
            .select('id')
            .eq('ig_user_id', String(accountData.pk))
            .eq('workspace_id', workspaceId)
            .single();

          const encryptedCookies = btoa(JSON.stringify(accountData.cookies));
          
          if (existingAccount) {
            // Update existing account
            const { error: updateError } = await supabase
              .from('instagram_accounts')
              .update({
                ig_username: accountData.username,
                profile_picture_url: accountData.profilePicUrl,
                access_token: encryptedCookies,
                access_token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                is_active: true,
              })
              .eq('id', existingAccount.id);

            if (updateError) {
              console.error('Error updating account:', updateError);
              setErrorMessage('Failed to update account: ' + updateError.message);
            } else {
              console.log('Account updated successfully');
            }
          } else {
            // Insert new account
            const { error: insertError } = await supabase
              .from('instagram_accounts')
              .insert({
                workspace_id: workspaceId,
                ig_user_id: String(accountData.pk),
                ig_username: accountData.username,
                profile_picture_url: accountData.profilePicUrl,
                access_token: encryptedCookies,
                access_token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                is_active: true,
                daily_dm_limit: 100,
                dms_sent_today: 0,
              });

            if (insertError) {
              console.error('Error inserting account:', insertError);
              setErrorMessage('Failed to save account: ' + insertError.message);
            } else {
              console.log('Account inserted successfully');
            }
          }
          
          // Save cookies to localStorage for quick DM sending
          localStorage.setItem(`dmflow_cookies_${accountData.pk}`, JSON.stringify(accountData.cookies));
          
          setSuccessMessage(`Successfully connected @${accountData.username}!`);
          
          // Wait a moment then refresh
          setTimeout(async () => {
            await fetchAccounts();
          }, 500);
        } catch (e) {
          console.error('Failed to save connected account:', e);
          setErrorMessage('Failed to process account data');
        }
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      if (success === 'true' && account) {
        setSuccessMessage(`Successfully connected @${account}!`);
        window.history.replaceState({}, '', window.location.pathname);
      } else if (errorParam) {
        setErrorMessage(message || `Connection failed: ${errorParam}`);
        window.history.replaceState({}, '', window.location.pathname);
      }
    };

    handleConnectedAccount();
  }, [fetchAccounts]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    
    // Check if Meta OAuth is configured
    if (!META_APP_ID) {
      setShowSetupModal(true);
      setIsConnecting(false);
      return;
    }

    // Build Meta OAuth URL directly
    const scopes = [
      'instagram_basic',
      'instagram_manage_messages',
      'pages_show_list',
      'pages_messaging',
      'pages_read_engagement',
    ].join(',');

    const state = btoa(JSON.stringify({ 
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(7)
    }));

    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.set('client_id', META_APP_ID);
    authUrl.searchParams.set('redirect_uri', META_OAUTH_REDIRECT_URI);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('response_type', 'code');

    // Redirect to Meta OAuth
    window.location.href = authUrl.toString();
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return;

    try {
      const supabase = createClient();
      await supabase
        .from('instagram_accounts')
        .delete()
        .eq('id', accountId);

      setAccounts(prev => prev.filter(a => a.id !== accountId));
    } catch (error) {
      console.error('Error disconnecting account:', error);
    }
  };

  const handleRefresh = async (accountId: string) => {
    try {
      const supabase = createClient();
      await supabase
        .from('instagram_accounts')
        .update({ dms_sent_today: 0 })
        .eq('id', accountId);

      setAccounts(prev =>
        prev.map(a => a.id === accountId ? { ...a, dmsSentToday: 0 } : a)
      );
    } catch (error) {
      console.error('Error refreshing account:', error);
    }
  };

  const handleReconnect = (account: InstagramAccount) => {
    // Open Instagram in a new tab and show instructions to use the extension
    window.open('https://www.instagram.com/', '_blank');
    alert(`To reconnect @${account.igUsername}:\n\n1. Make sure you're logged in to @${account.igUsername} on Instagram\n2. Click the DMflow extension icon\n3. Click "Grab Instagram Session"\n\nYour cookies will be updated automatically.`);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // Cookie-based authentication
  const handleVerifyCookies = async () => {
    if (!cookies.sessionId || !cookies.csrfToken || !cookies.dsUserId) {
      setErrorMessage('Please fill in at least sessionId, csrfToken, and dsUserId');
      return;
    }

    setIsVerifyingCookies(true);
    setErrorMessage(null);
    setCookieUser(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/instagram/cookie/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies }),
      });

      const data = await response.json();

      if (data.success) {
        setCookieUser(data.user);
        setSuccessMessage(`Session verified for @${data.user.username}`);
      } else {
        setErrorMessage(data.message || 'Failed to verify cookies');
      }
    } catch (error) {
      setErrorMessage('Failed to connect to backend. Make sure it\'s running on port 3001.');
    } finally {
      setIsVerifyingCookies(false);
    }
  };

  const handleConnectWithCookies = async () => {
    if (!cookieUser) {
      setErrorMessage('Please verify cookies first');
      return;
    }

    setIsVerifyingCookies(true);

    try {
      const supabase = createClient();
      const { data: workspaces } = await supabase
        .from('workspaces')
        .select('id')
        .limit(1)
        .single();

      const response = await fetch(`${BACKEND_URL}/api/instagram/cookie/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cookies,
          workspaceId: workspaces?.id 
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Also save to Supabase for UI
        const { data: savedAccount, error } = await supabase
          .from('instagram_accounts')
          .upsert({
            workspace_id: workspaces?.id,
            ig_user_id: data.account.pk,
            ig_username: data.account.username,
            profile_picture_url: data.account.profilePicUrl,
            access_token: 'cookie_auth',
            access_token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
            daily_dm_limit: 100,
            dms_sent_today: 0,
          }, {
            onConflict: 'ig_user_id,workspace_id'
          })
          .select()
          .single();

        if (!error && savedAccount) {
          const newAccount: InstagramAccount = {
            id: savedAccount.id,
            igUserId: savedAccount.ig_user_id,
            igUsername: savedAccount.ig_username,
            profilePictureUrl: savedAccount.profile_picture_url,
            isActive: savedAccount.is_active,
            dailyDmLimit: savedAccount.daily_dm_limit,
            dmsSentToday: savedAccount.dms_sent_today,
            createdAt: savedAccount.created_at,
          };
          setAccounts(prev => {
            const filtered = prev.filter(a => a.igUserId !== newAccount.igUserId);
            return [newAccount, ...filtered];
          });
        }

        setSuccessMessage(`Connected @${data.account.username} successfully!`);
        setShowCookieModal(false);
        setCookies({ sessionId: '', csrfToken: '', dsUserId: '', igDid: '', mid: '', rur: '' });
        setCookieUser(null);
      } else {
        setErrorMessage(data.message || 'Failed to connect account');
      }
    } catch (error) {
      setErrorMessage('Failed to connect account');
    } finally {
      setIsVerifyingCookies(false);
    }
  };

  // Simple Browser Login - Opens Instagram in new tab
  const [showExtractModal, setShowExtractModal] = useState(false);
  
  const handleBrowserLogin = () => {
    // Open Instagram in a new tab
    window.open('https://www.instagram.com/', '_blank');
    // Show the extract cookies modal
    setShowExtractModal(true);
  };

  const handleCancelBrowserLogin = () => {
    setIsBrowserLoggingIn(false);
    setBrowserSessionId(null);
    setBrowserLoginStatus('');
    setShowExtractModal(false);
  };

  // Send DM functionality
  const handleSendDM = async () => {
    if (!dmRecipient.trim() || !dmMessage.trim()) {
      setErrorMessage('Please enter recipient username and message');
      return;
    }

    if (!cookies.sessionId) {
      setErrorMessage('Please enter your Instagram cookies first');
      return;
    }

    setIsSendingDM(true);
    setDmResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/instagram/cookie/dm/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cookies,
          recipientUsername: dmRecipient.replace('@', ''),
          message: dmMessage,
        }),
      });

      const data = await response.json();
      setDmResult(data);

      if (data.success) {
        setSuccessMessage(`DM sent to @${dmRecipient.replace('@', '')}!`);
        setDmMessage('');
      } else {
        setErrorMessage(data.error || 'Failed to send DM');
      }
    } catch (error) {
      setErrorMessage('Failed to send DM. Make sure backend is running.');
      setDmResult({ success: false, error: 'Connection failed' });
    } finally {
      setIsSendingDM(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Instagram Accounts"
        subtitle="Connect and manage your Instagram Business accounts"
      />

      <div className="p-6 max-w-4xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
              <p className="text-sm text-success font-medium">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="p-1 hover:bg-success/20 rounded"
            >
              <X className="h-4 w-4 text-success" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-error flex-shrink-0" />
              <p className="text-sm text-error">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 hover:bg-error/20 rounded"
            >
              <X className="h-4 w-4 text-error" />
            </button>
          </div>
        )}

        {/* Connection Card */}
        <div className="bg-gradient-to-br from-background-secondary to-background-tertiary rounded-2xl border border-border p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Instagram className="h-8 w-8 text-white" />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {accounts.length > 0 ? 'Add Another Instagram Account' : 'Connect Your Instagram Account'}
              </h2>
              <p className="text-foreground-muted mb-4 max-w-xl">
                {accounts.length > 0 ? (
                  <>
                    You can connect <strong>multiple Instagram accounts</strong> to manage them all from one place. 
                    Each account can send DMs independently.
                  </>
                ) : (
                  <>
                    Install our Chrome extension for <strong>one-click automatic connection</strong>. 
                    No manual copying needed - just click and connect! Works with any Instagram account.
                  </>
                )}
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <Button 
                  onClick={handleBrowserLogin} 
                  isLoading={isBrowserLoggingIn}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {accounts.length > 0 ? 'Add Account' : 'Connect with Extension'}
                </Button>

                {accounts.length > 0 && (
                  <Button variant="secondary" onClick={() => setShowSendDMModal(true)}>
                    <Send className="h-4 w-4" />
                    Quick Send DM
                  </Button>
                )}

                <Button variant="ghost" onClick={() => setShowCookieModal(true)}>
                  <Cookie className="h-4 w-4" />
                  Manual Connection
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-background-secondary rounded-xl border border-border p-6 mb-8">
          <h3 className="text-sm font-medium text-foreground mb-4">How It Works (One-Click with Extension)</h3>
          <div className="grid gap-3">
            {[
              'Install our Chrome extension (one-time setup)',
              'Go to Instagram and login to your account',
              'Click the extension icon → "Grab Session"',
              'Done! Start sending DMs instantly 🚀',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="h-5 w-5 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-foreground-muted">{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20">
            <p className="text-xs text-success">
              ✅ <strong>Fully automated:</strong> No manual copying - extension grabs everything automatically!
            </p>
          </div>
        </div>

        {/* Connected Accounts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Connected Accounts ({accounts.length})
            </h3>
            {accounts.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBrowserLogin}
                isLoading={isBrowserLoggingIn}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Account
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-background-secondary rounded-xl border border-border p-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-background-elevated" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-background-elevated rounded" />
                      <div className="h-3 w-24 bg-background-elevated rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : accounts?.length ? (
            <div className="space-y-4">
              {accounts.map((account, index) => (
                <div
                  key={account.id}
                  className={cn(
                    'bg-background-secondary rounded-xl border border-border p-6 transition-all hover:border-border-hover',
                    'animate-slide-up'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={account.profilePictureUrl}
                      name={account.igUsername}
                      size="xl"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">@{account.igUsername}</h4>
                        {account.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="error">Inactive</Badge>
                        )}
                      </div>

                      <p className="text-sm text-foreground-muted mb-3">
                        Connected {new Date(account.createdAt).toLocaleDateString()}
                      </p>

                      {/* DM Limit Progress */}
                      <div className="flex items-center gap-4">
                        <div className="flex-1 max-w-xs">
                          <div className="flex items-center justify-between text-xs text-foreground-muted mb-1">
                            <span>Daily DM Limit</span>
                            <span>{account.dmsSentToday} / {account.dailyDmLimit}</span>
                          </div>
                          <div className="h-2 bg-background-elevated rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                account.dmsSentToday / account.dailyDmLimit > 0.8
                                  ? 'bg-warning'
                                  : 'bg-accent'
                              )}
                              style={{ width: `${(account.dmsSentToday / account.dailyDmLimit) * 100}%` }}
                            />
                          </div>
                        </div>

                        {account.dmsSentToday / account.dailyDmLimit > 0.8 && (
                          <div className="flex items-center gap-1 text-warning text-xs">
                            <AlertCircle className="h-3 w-3" />
                            <span>Nearing limit</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {accountsWithCookies.has(account.id) ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Session Active</span>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleReconnect(account)}
                          title="Refresh session cookies"
                          className="text-amber-400 border-amber-500/20 hover:bg-amber-500/10"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reconnect
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(account.id)}
                        className="text-error hover:text-error hover:bg-error/10"
                        title="Disconnect account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-background-secondary rounded-xl border border-dashed border-border p-12 text-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                <Instagram className="h-7 w-7 text-white" />
              </div>
              <h4 className="text-foreground font-medium mb-1">No accounts connected</h4>
              <p className="text-sm text-foreground-muted mb-4">
                Connect your Instagram account to start sending DMs
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Button 
                  onClick={handleBrowserLogin} 
                  isLoading={isBrowserLoggingIn}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Instagram className="h-4 w-4" />
                  Login with Instagram
                </Button>
                <Button variant="secondary" onClick={() => setShowCookieModal(true)}>
                  <Cookie className="h-4 w-4" />
                  Use Cookies
                </Button>
              </div>
              {browserLoginStatus && (
                <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20 inline-flex items-center gap-3">
                  <Loader2 className="h-4 w-4 text-accent animate-spin" />
                  <span className="text-sm text-accent">{browserLoginStatus}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-secondary rounded-2xl border border-border max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Setup Required</h2>
              <button
                onClick={() => setShowSetupModal(false)}
                className="p-2 rounded-lg hover:bg-background-elevated text-foreground-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-foreground-muted">
                To connect real Instagram accounts, you need to configure the Meta API integration. Follow these steps:
              </p>

              <div className="space-y-4">
                <div className="bg-background-elevated rounded-lg p-4">
                  <h3 className="font-medium text-foreground mb-2">1. Create a Meta Developer App</h3>
                  <p className="text-sm text-foreground-muted mb-2">
                    Go to Meta for Developers and create a new app with Instagram Graph API.
                  </p>
                  <a
                    href="https://developers.facebook.com/apps/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline flex items-center gap-1"
                  >
                    Open Meta Developer Portal
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="bg-background-elevated rounded-lg p-4">
                  <h3 className="font-medium text-foreground mb-2">2. Configure Environment Variables</h3>
                  <p className="text-sm text-foreground-muted mb-3">
                    Add these to your backend .env file:
                  </p>
                  <div className="space-y-2">
                    {[
                      { key: 'META_APP_ID', value: 'your_app_id' },
                      { key: 'META_APP_SECRET', value: 'your_app_secret' },
                      { key: 'META_OAUTH_REDIRECT_URI', value: 'http://localhost:3001/api/instagram/oauth/callback' },
                    ].map((env) => (
                      <div key={env.key} className="flex items-center gap-2 bg-background-secondary rounded px-3 py-2">
                        <code className="flex-1 text-xs text-foreground-muted">
                          {env.key}={env.value}
                        </code>
                        <button
                          onClick={() => copyToClipboard(`${env.key}=${env.value}`, env.key)}
                          className="p-1 hover:bg-background-elevated rounded"
                        >
                          {copied === env.key ? (
                            <Check className="h-3 w-3 text-success" />
                          ) : (
                            <Copy className="h-3 w-3 text-foreground-muted" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-background-elevated rounded-lg p-4">
                  <h3 className="font-medium text-foreground mb-2">3. Start the Backend Server</h3>
                  <p className="text-sm text-foreground-muted mb-2">
                    Run the NestJS backend on port 3001:
                  </p>
                  <div className="flex items-center gap-2 bg-background-secondary rounded px-3 py-2">
                    <code className="flex-1 text-xs text-foreground-muted">
                      cd backend && npm run start:dev
                    </code>
                    <button
                      onClick={() => copyToClipboard('cd backend && npm run start:dev', 'cmd')}
                      className="p-1 hover:bg-background-elevated rounded"
                    >
                      {copied === 'cmd' ? (
                        <Check className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3 text-foreground-muted" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <Button variant="secondary" onClick={() => setShowSetupModal(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Authentication Modal */}
      {showCookieModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background-secondary rounded-2xl border border-border max-w-2xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Cookie className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Connect with Browser Cookies</h2>
                  <p className="text-xs text-foreground-muted">Use your existing Instagram session</p>
                </div>
              </div>
              <button
                onClick={() => { setShowCookieModal(false); setCookieUser(null); }}
                className="p-2 rounded-lg hover:bg-background-elevated text-foreground-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Instructions */}
              <div className="bg-background-elevated rounded-xl p-4 space-y-3">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center">?</span>
                  How to get your Instagram cookies
                </h3>
                <ol className="text-sm text-foreground-muted space-y-2 ml-7 list-decimal">
                  <li>Open Instagram.com in your browser and login</li>
                  <li>Press F12 to open Developer Tools</li>
                  <li>Go to Application tab → Cookies → instagram.com</li>
                  <li>Copy the values for: <code className="px-1.5 py-0.5 rounded bg-background-secondary text-accent text-xs">sessionid</code>, <code className="px-1.5 py-0.5 rounded bg-background-secondary text-accent text-xs">csrftoken</code>, <code className="px-1.5 py-0.5 rounded bg-background-secondary text-accent text-xs">ds_user_id</code></li>
                </ol>
              </div>

              {/* Cookie Inputs */}
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Session ID <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={cookies.sessionId}
                      onChange={(e) => setCookies(prev => ({ ...prev, sessionId: e.target.value }))}
                      placeholder="sessionid cookie value"
                      className="w-full px-4 py-2.5 rounded-lg bg-background-elevated border border-border text-foreground placeholder-foreground-subtle focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      CSRF Token <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={cookies.csrfToken}
                      onChange={(e) => setCookies(prev => ({ ...prev, csrfToken: e.target.value }))}
                      placeholder="csrftoken cookie value"
                      className="w-full px-4 py-2.5 rounded-lg bg-background-elevated border border-border text-foreground placeholder-foreground-subtle focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors text-sm font-mono"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      DS User ID <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={cookies.dsUserId}
                      onChange={(e) => setCookies(prev => ({ ...prev, dsUserId: e.target.value }))}
                      placeholder="ds_user_id cookie value"
                      className="w-full px-4 py-2.5 rounded-lg bg-background-elevated border border-border text-foreground placeholder-foreground-subtle focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      IG DID <span className="text-foreground-subtle">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={cookies.igDid}
                      onChange={(e) => setCookies(prev => ({ ...prev, igDid: e.target.value }))}
                      placeholder="ig_did cookie value"
                      className="w-full px-4 py-2.5 rounded-lg bg-background-elevated border border-border text-foreground placeholder-foreground-subtle focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      MID <span className="text-foreground-subtle">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={cookies.mid}
                      onChange={(e) => setCookies(prev => ({ ...prev, mid: e.target.value }))}
                      placeholder="mid cookie value"
                      className="w-full px-4 py-2.5 rounded-lg bg-background-elevated border border-border text-foreground placeholder-foreground-subtle focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      RUR <span className="text-foreground-subtle">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={cookies.rur}
                      onChange={(e) => setCookies(prev => ({ ...prev, rur: e.target.value }))}
                      placeholder="rur cookie value"
                      className="w-full px-4 py-2.5 rounded-lg bg-background-elevated border border-border text-foreground placeholder-foreground-subtle focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Verified User */}
              {cookieUser && (
                <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center gap-4">
                  <Avatar
                    src={cookieUser.profilePicUrl}
                    name={cookieUser.username}
                    size="lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">@{cookieUser.username}</span>
                      <Badge variant="success">Verified</Badge>
                    </div>
                    <p className="text-sm text-foreground-muted">{cookieUser.fullName}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              )}

              {/* Warning */}
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                <p className="text-xs text-warning">
                  ⚠️ <strong>Security Notice:</strong> Using browser cookies bypasses official API. This approach may violate Instagram&apos;s ToS and could result in account restrictions. Use at your own risk. Never share your cookies with untrusted services.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button variant="secondary" onClick={() => { setShowCookieModal(false); setCookieUser(null); }} className="flex-1">
                  Cancel
                </Button>
                {!cookieUser ? (
                  <Button 
                    onClick={handleVerifyCookies}
                    isLoading={isVerifyingCookies}
                    disabled={!cookies.sessionId || !cookies.csrfToken || !cookies.dsUserId}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Verify Session
                  </Button>
                ) : (
                  <Button 
                    onClick={handleConnectWithCookies}
                    isLoading={isVerifyingCookies}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Plus className="h-4 w-4" />
                    Connect Account
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chrome Extension Modal */}
      {showExtractModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background-secondary rounded-2xl border border-border max-w-lg w-full my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Instagram className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Install Chrome Extension</h2>
                  <p className="text-xs text-foreground-muted">One-click automatic connection</p>
                </div>
              </div>
              <button
                onClick={() => setShowExtractModal(false)}
                className="p-2 rounded-lg hover:bg-background-elevated text-foreground-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Step 1 - Install Extension */}
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1">Install the Chrome Extension</h3>
                  <p className="text-sm text-foreground-muted mb-3">
                    Load the extension in Chrome Developer Mode:
                  </p>
                  <ol className="text-sm text-foreground-muted space-y-1 mb-3 list-decimal ml-4">
                    <li>Open <code className="px-1 py-0.5 rounded bg-background-elevated text-accent text-xs">chrome://extensions</code></li>
                    <li>Enable &quot;Developer mode&quot; (top right)</li>
                    <li>Click &quot;Load unpacked&quot;</li>
                    <li>Select the <code className="px-1 py-0.5 rounded bg-background-elevated text-accent text-xs">extension</code> folder</li>
                  </ol>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText('chrome://extensions');
                      setCopied('extensions-url');
                      setTimeout(() => setCopied(null), 2000);
                    }}
                  >
                    {copied === 'extensions-url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied === 'extensions-url' ? 'Copied!' : 'Copy URL'}
                  </Button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1">Open Instagram</h3>
                  <p className="text-sm text-foreground-muted mb-3">
                    Go to Instagram and make sure you&apos;re logged in.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open('https://www.instagram.com/', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Instagram
                  </Button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-success/20 text-success flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1">Click Extension → Grab Session</h3>
                  <p className="text-sm text-foreground-muted">
                    While on Instagram, click the DMflow extension icon and hit &quot;Grab Instagram Session&quot;. 
                    Your account connects automatically! 🎉
                  </p>
                </div>
              </div>

              {/* Extension folder path */}
              <div className="bg-background-elevated rounded-xl p-4">
                <p className="text-xs font-medium text-foreground-muted mb-2">Extension folder location:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-accent font-mono bg-background-secondary px-3 py-2 rounded-lg overflow-x-auto">
                    instagram-dm-saas/extension
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('extension');
                      setCopied('folder');
                      setTimeout(() => setCopied(null), 2000);
                    }}
                    className="p-2 hover:bg-background-secondary rounded-lg"
                  >
                    {copied === 'folder' ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-foreground-muted" />}
                  </button>
                </div>
              </div>

              {/* Alternative */}
              <div className="border-t border-border pt-4">
                <button
                  onClick={() => { setShowExtractModal(false); setShowCookieModal(true); }}
                  className="text-sm text-foreground-muted hover:text-accent flex items-center gap-2"
                >
                  <Cookie className="h-4 w-4" />
                  Or paste cookies manually instead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Send DM Modal */}
      {showSendDMModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-secondary rounded-2xl border border-border max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Send className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Quick Send DM</h2>
                  <p className="text-xs text-foreground-muted">Send a direct message instantly</p>
                </div>
              </div>
              <button
                onClick={() => { setShowSendDMModal(false); setDmResult(null); }}
                className="p-2 rounded-lg hover:bg-background-elevated text-foreground-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Cookie check */}
              {!cookies.sessionId && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-warning font-medium">Cookies Required</p>
                    <p className="text-xs text-warning/80 mt-1">
                      You need to enter your Instagram cookies first. 
                      <button 
                        onClick={() => { setShowSendDMModal(false); setShowCookieModal(true); }}
                        className="underline ml-1"
                      >
                        Connect with cookies
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* Mini cookie inputs for quick use */}
              {!cookies.sessionId && (
                <div className="grid gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground-muted mb-1.5">Session ID</label>
                    <input
                      type="text"
                      value={cookies.sessionId}
                      onChange={(e) => setCookies(prev => ({ ...prev, sessionId: e.target.value }))}
                      placeholder="Paste sessionid here"
                      className="w-full px-3 py-2 rounded-lg bg-background-elevated border border-border text-foreground placeholder-foreground-subtle focus:border-accent outline-none text-sm font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground-muted mb-1.5">CSRF Token</label>
                      <input
                        type="text"
                        value={cookies.csrfToken}
                        onChange={(e) => setCookies(prev => ({ ...prev, csrfToken: e.target.value }))}
                        placeholder="csrftoken"
                        className="w-full px-3 py-2 rounded-lg bg-background-elevated border border-border text-foreground placeholder-foreground-subtle focus:border-accent outline-none text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground-muted mb-1.5">DS User ID</label>
                      <input
                        type="text"
                        value={cookies.dsUserId}
                        onChange={(e) => setCookies(prev => ({ ...prev, dsUserId: e.target.value }))}
                        placeholder="ds_user_id"
                        className="w-full px-3 py-2 rounded-lg bg-background-elevated border border-border text-foreground placeholder-foreground-subtle focus:border-accent outline-none text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Recipient Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">@</span>
                  <input
                    type="text"
                    value={dmRecipient}
                    onChange={(e) => setDmRecipient(e.target.value)}
                    placeholder="username"
                    className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-background-elevated border border-border text-foreground placeholder-foreground-subtle focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <textarea
                  value={dmMessage}
                  onChange={(e) => setDmMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg bg-background-elevated border border-border text-foreground placeholder-foreground-subtle focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors resize-none"
                />
                <p className="text-xs text-foreground-muted mt-1">{dmMessage.length} characters</p>
              </div>

              {/* Result */}
              {dmResult && (
                <div className={cn(
                  "rounded-lg p-3 flex items-center gap-3",
                  dmResult.success ? "bg-success/10 border border-success/20" : "bg-error/10 border border-error/20"
                )}>
                  {dmResult.success ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                      <p className="text-sm text-success">Message sent successfully!</p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-error flex-shrink-0" />
                      <p className="text-sm text-error">{dmResult.error || 'Failed to send message'}</p>
                    </>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button variant="secondary" onClick={() => { setShowSendDMModal(false); setDmResult(null); }} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendDM}
                  isLoading={isSendingDM}
                  disabled={!cookies.sessionId || !cookies.csrfToken || !cookies.dsUserId || !dmRecipient.trim() || !dmMessage.trim()}
                  className="flex-1"
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
