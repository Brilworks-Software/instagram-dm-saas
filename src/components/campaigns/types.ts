// Shared types for campaign components

export interface InstagramAccount {
  id: string;
  igUsername: string;
  profilePictureUrl?: string;
  isActive: boolean;
}

export interface Contact {
  id: string;
  igUserId: string;
  igUsername: string;
  name?: string;
  profilePictureUrl?: string;
}

export interface Lead {
  id: string;
  igUserId: string;
  igUsername: string;
  name?: string;
  profilePictureUrl?: string;
}

