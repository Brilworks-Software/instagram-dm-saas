export interface InstagramCookies {
  sessionId: string;
  csrfToken: string;
  dsUserId: string;
  igDid?: string;
  mid?: string;
  rur?: string;
}

export interface InstagramUserInfo {
  pk: string;
  username: string;
  fullName: string;
  profilePicUrl?: string;
  isPrivate: boolean;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  isVerified?: boolean;
  bio?: string;
}

