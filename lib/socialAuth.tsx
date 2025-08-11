import { createContext, useContext, ReactNode } from 'react';

export type SocialAuthTokens = {
  linkedinToken?: string;
  instagramToken?: string;
};

const SocialAuthContext = createContext<SocialAuthTokens>({});

export function SocialAuthProvider({
  children,
  linkedinToken,
  instagramToken,
}: SocialAuthTokens & { children: ReactNode }) {
  return (
    <SocialAuthContext.Provider value={{ linkedinToken, instagramToken }}>
      {children}
    </SocialAuthContext.Provider>
  );
}

export function useSocialAuth() {
  return useContext(SocialAuthContext);
}

