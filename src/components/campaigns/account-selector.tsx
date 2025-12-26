'use client';

import { useState } from 'react';
import { Check, AlertCircle, RefreshCw, Instagram } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InstagramAccount {
  id: string;
  igUsername: string;
  profilePictureUrl?: string;
  isActive: boolean;
}

interface AccountSelectorProps {
  accounts: InstagramAccount[];
  selectedAccountIds: string[];
  onSelectionChange: (accountIds: string[]) => void;
  onReconnect?: (accountId: string) => void;
  className?: string;
}

export function AccountSelector({
  accounts,
  selectedAccountIds,
  onSelectionChange,
  onReconnect,
  className,
}: AccountSelectorProps) {
  const toggleAccount = (accountId: string) => {
    if (selectedAccountIds.includes(accountId)) {
      onSelectionChange(selectedAccountIds.filter((id) => id !== accountId));
    } else {
      onSelectionChange([...selectedAccountIds, accountId]);
    }
  };

  const activeAccounts = accounts.filter((acc) => acc.isActive);
  const inactiveAccounts = accounts.filter((acc) => !acc.isActive);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 text-sm text-foreground-muted">
        <Instagram className="h-4 w-4" />
        <span>Select Instagram account(s) to send messages from</span>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-8 text-foreground-muted">
          <p>No Instagram accounts connected.</p>
          <p className="text-sm mt-2">Please connect an account first.</p>
        </div>
      ) : (
        <>
          {/* Active Accounts */}
          {activeAccounts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Active Accounts</h3>
              <div className="space-y-2">
                {activeAccounts.map((account) => {
                  const isSelected = selectedAccountIds.includes(account.id);
                  return (
                    <div
                      key={account.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                        isSelected
                          ? 'border-accent bg-accent/10'
                          : 'border-border bg-background-elevated hover:border-border-hover'
                      )}
                      onClick={() => toggleAccount(account.id)}
                    >
                      <div className="relative">
                        <Avatar
                          src={account.profilePictureUrl}
                          name={account.igUsername}
                          size="md"
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 bg-accent rounded-full flex items-center justify-center border-2 border-background">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            @{account.igUsername}
                          </span>
                          <Badge variant="success" className="text-xs">
                            Active
                          </Badge>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAccount(account.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-5 w-5 rounded border-border text-accent focus:ring-accent"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Inactive Accounts */}
          {inactiveAccounts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Accounts Needing Reconnection</h3>
              <div className="space-y-2">
                {inactiveAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background-elevated opacity-60"
                  >
                    <Avatar
                      src={account.profilePictureUrl}
                      name={account.igUsername}
                      size="md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          @{account.igUsername}
                        </span>
                        <Badge variant="error" className="text-xs">
                          Reconnect Required
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onReconnect?.(account.id)}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reconnect
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selection Summary */}
          {selectedAccountIds.length > 0 && (
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm text-foreground">
                <span className="font-medium">{selectedAccountIds.length}</span> account
                {selectedAccountIds.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-foreground-muted mt-1">
                Recipients will be distributed evenly across selected accounts
              </p>
            </div>
          )}

          {/* Warning if no active accounts */}
          {activeAccounts.length === 0 && inactiveAccounts.length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              <p className="text-sm text-amber-400">
                No active accounts. Please reconnect an account to continue.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

