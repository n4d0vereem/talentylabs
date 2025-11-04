// Better Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  user?: User;
}

// Application types
export type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type DashboardStats = {
  totalCreators: number;
  activeCampaigns: number;
  totalReach: number;
  engagement: number;
};

// Form types
export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

