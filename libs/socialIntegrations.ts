// libs/socialIntegrations.ts
// Minimal API clients for third-party social platforms.
// These helpers respect each platform's OAuth flow and use fetch for network calls.

export type CrossPostPayload = {
  accessToken: string;
  content: string;
};

export function getLinkedInAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
  scope?: string;
}): string {
  const scope = encodeURIComponent(
    params.scope ?? 'openid profile w_member_social'
  );
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(
    params.clientId
  )}&redirect_uri=${encodeURIComponent(
    params.redirectUri
  )}&state=${encodeURIComponent(params.state)}&scope=${scope}`;
}

export async function exchangeLinkedInCode(params: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
}): Promise<string> {
  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: params.code,
      redirect_uri: params.redirectUri,
      client_id: params.clientId,
      client_secret: params.clientSecret,
    }),
  });
  if (!res.ok) throw new Error(`LinkedIn token exchange failed: ${res.status}`);
  const json = await res.json();
  return json.access_token as string;
}

export async function postToLinkedIn(
  payload: CrossPostPayload
): Promise<unknown> {
  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: 'urn:li:person:me',
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: payload.content },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  });
  if (!res.ok) throw new Error(`LinkedIn post failed: ${res.status}`);
  return res.json();
}

export function getInstagramAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
  scope?: string;
}): string {
  const scope = encodeURIComponent(params.scope ?? 'user_profile,user_media');
  return `https://api.instagram.com/oauth/authorize?response_type=code&client_id=${encodeURIComponent(
    params.clientId
  )}&redirect_uri=${encodeURIComponent(
    params.redirectUri
  )}&state=${encodeURIComponent(params.state)}&scope=${scope}`;
}

export async function exchangeInstagramCode(params: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
}): Promise<string> {
  const res = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: params.code,
      redirect_uri: params.redirectUri,
      client_id: params.clientId,
      client_secret: params.clientSecret,
    }),
  });
  if (!res.ok) throw new Error(`Instagram token exchange failed: ${res.status}`);
  const json = await res.json();
  return json.access_token as string;
}

export async function postToInstagram(
  payload: CrossPostPayload
): Promise<unknown> {
  const res = await fetch(
    `https://graph.facebook.com/v18.0/me/media?access_token=${encodeURIComponent(
      payload.accessToken
    )}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: payload.content }),
    }
  );
  if (!res.ok) throw new Error(`Instagram post failed: ${res.status}`);
  return res.json();
}
