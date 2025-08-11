// libs/socialIntegrations.ts
// Minimal, server-friendly API helpers for LinkedIn + Instagram (via Facebook Graph).
// NOTE: Call these from SERVER code (Next.js Route Handlers / server actions). Do not expose tokens in the client.

////////////////////////////
// Shared + utilities
////////////////////////////

export type CrossPostPayload = {
  accessToken: string;
  content: string;
};

type Json = Record<string, unknown>;

const GRAPH_VER = "v18.0";
const GRAPH = `https://graph.facebook.com/${GRAPH_VER}`;
const LINKEDIN = "https://api.linkedin.com";

function encForm(data: Record<string, string | number | boolean | undefined>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined && v !== null) params.append(k, String(v));
  }
  return params;
}

async function parseBody(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function assertOk(res: Response, ctx: string) {
  if (!res.ok) {
    const body = await parseBody(res);
    const msg =
      typeof body === "string" ? body : JSON.stringify(body, null, 2);
    throw new Error(`${ctx} failed: ${res.status} ${res.statusText}\n${msg}`);
  }
}

////////////////////////////
// LinkedIn
////////////////////////////

/**
 * Build the LinkedIn OAuth URL.
 * Scopes: default to `openid profile w_member_social` (posting requires w_member_social).
 */
export function getLinkedInAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
  scope?: string; // e.g. "openid profile w_member_social"
}): string {
  const scope = encodeURIComponent(
    params.scope ?? "openid profile w_member_social"
  );
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(
    params.clientId
  )}&redirect_uri=${encodeURIComponent(
    params.redirectUri
  )}&state=${encodeURIComponent(params.state)}&scope=${scope}`;
}

/**
 * Exchange auth code for LinkedIn access token.
 */
export async function exchangeLinkedInCode(params: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
}): Promise<string> {
  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: encForm({
      grant_type: "authorization_code",
      code: params.code,
      redirect_uri: params.redirectUri,
      client_id: params.clientId,
      client_secret: params.clientSecret,
    }),
  });
  await assertOk(res, "LinkedIn token exchange");
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

/**
 * Resolve the posting author URN for the current user token.
 * Uses OpenID endpoint `/v2/userinfo` (returns `sub` which is the member id).
 */
export async function getLinkedInAuthorUrn(accessToken: string): Promise<string> {
  const res = await fetch(`${LINKEDIN}/v2/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  await assertOk(res, "LinkedIn userinfo");
  const json = (await res.json()) as { sub?: string };
  if (!json.sub) throw new Error("LinkedIn userinfo missing `sub`.");
  return `urn:li:person:${json.sub}`;
}

/**
 * Post a simple text update to LinkedIn UGC.
 * If you already know the author's URN, pass it; otherwise this will resolve it.
 */
export async function postToLinkedIn(
  payload: CrossPostPayload,
  authorUrn?: string
): Promise<unknown> {
  const author = authorUrn ?? (await getLinkedInAuthorUrn(payload.accessToken));

  const res = await fetch(`${LINKEDIN}/v2/ugcPosts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: payload.content },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  });
  await assertOk(res, "LinkedIn post");
  return res.json();
}

////////////////////////////
// Instagram (via Facebook Graph)
// Requires: IG Business/Creator account connected to a Facebook Page.
// You must use Facebook Login (Graph OAuth), NOT Instagram Basic Display.
////////////////////////////

/**
 * Build the Facebook Login URL for IG Graph operations.
 * These scopes are typical for publishing: adjust to your app's review status.
 */
export function getFacebookAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
  scope?: string; // default provided below
}): string {
  const scope = encodeURIComponent(
    params.scope ??
      [
        "pages_show_list",
        "pages_read_engagement",
        "pages_manage_posts",
        "instagram_basic",
        "instagram_content_publish",
      ].join(",")
  );
  const u = new URL(`https://www.facebook.com/${GRAPH_VER}/dialog/oauth`);
  u.search = new URLSearchParams({
    response_type: "code",
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    state: params.state,
    scope,
  }).toString();
  return u.toString();
}

/**
 * Exchange Facebook auth code for a user access token.
 */
export async function exchangeFacebookCode(params: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
}): Promise<{ accessToken: string; tokenType?: string; expiresIn?: number }> {
  const u = new URL(`${GRAPH}/oauth/access_token`);
  u.search = new URLSearchParams({
    client_id: params.clientId,
    client_secret: params.clientSecret,
    redirect_uri: params.redirectUri,
    code: params.code,
  }).toString();
  const res = await fetch(u, { method: "GET" });
  await assertOk(res, "Facebook token exchange");
  const json = (await res.json()) as {
    access_token: string;
    token_type?: string;
    expires_in?: number;
  };
  return {
    accessToken: json.access_token,
    tokenType: json.token_type,
    expiresIn: json.expires_in,
  };
}

/**
 * Exchange short-lived token for long-lived token (recommended server-side).
 */
export async function extendFacebookAccessToken(params: {
  clientId: string;
  clientSecret: string;
  shortLivedToken: string;
}): Promise<{ accessToken: string; expiresIn?: number; tokenType?: string }> {
  const u = new URL(`${GRAPH}/oauth/access_token`);
  u.search = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: params.clientId,
    client_secret: params.clientSecret,
    fb_exchange_token: params.shortLivedToken,
  }).toString();
  const res = await fetch(u);
  await assertOk(res, "Facebook extend token");
  const json = (await res.json()) as {
    access_token: string;
    token_type?: string;
    expires_in?: number;
  };
  return {
    accessToken: json.access_token,
    tokenType: json.token_type,
    expiresIn: json.expires_in,
  };
}

/**
 * Get list of Pages the user manages (to find the Page connected to IG).
 * Returns id, name, and a page access token for each page.
 */
export async function getUserPages(userAccessToken: string): Promise<
  Array<{
    id: string;
    name?: string;
    access_token?: string;
  }>
> {
  const u = new URL(`${GRAPH}/me/accounts`);
  u.search = new URLSearchParams({
    fields: "id,name,access_token",
    access_token: userAccessToken,
  }).toString();
  const res = await fetch(u, { cache: "no-store" });
  await assertOk(res, "Facebook /me/accounts");
  const json = (await res.json()) as { data?: Array<any> };
  return json.data ?? [];
}

/**
 * From a Page ID, resolve the connected Instagram Business Account id.
 */
export async function getInstagramBusinessAccountId(params: {
  pageId: string;
  pageAccessToken: string; // token for that page
}): Promise<string | null> {
  const u = new URL(`${GRAPH}/${encodeURIComponent(params.pageId)}`);
  u.search = new URLSearchParams({
    fields: "instagram_business_account",
    access_token: params.pageAccessToken,
  }).toString();
  const res = await fetch(u, { cache: "no-store" });
  await assertOk(res, "Facebook page→IG account lookup");
  const json = (await res.json()) as {
    instagram_business_account?: { id?: string };
  };
  return json.instagram_business_account?.id ?? null;
}

/**
 * Create an IG media container for a single image.
 * The imageUrl MUST be publicly accessible.
 */
export async function createInstagramImageContainer(params: {
  igUserId: string;
  accessToken: string; // Page token or user token with page scopes that resolve to IG user
  imageUrl: string;
  caption?: string;
  userTagsJson?: string; // optional JSON string with user tags per Graph docs
}): Promise<{ id: string }> {
  const res = await fetch(`${GRAPH}/${encodeURIComponent(params.igUserId)}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: encForm({
      image_url: params.imageUrl,
      caption: params.caption ?? "",
      user_tags: params.userTagsJson,
      access_token: params.accessToken,
    }),
  });
  await assertOk(res, "IG create image container");
  return (await res.json()) as { id: string };
}

/**
 * Create child containers for a carousel (each child must set is_carousel_item=true).
 */
export async function createInstagramCarouselChild(params: {
  igUserId: string;
  accessToken: string;
  imageUrl: string;
}): Promise<{ id: string }> {
  const res = await fetch(`${GRAPH}/${encodeURIComponent(params.igUserId)}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: encForm({
      image_url: params.imageUrl,
      is_carousel_item: true,
      access_token: params.accessToken,
    }),
  });
  await assertOk(res, "IG create carousel child");
  return (await res.json()) as { id: string };
}

/**
 * Create the parent carousel container from an array of child container IDs.
 */
export async function createInstagramCarouselContainer(params: {
  igUserId: string;
  accessToken: string;
  childContainerIds: string[]; // 2–10 items
  caption?: string;
}): Promise<{ id: string }> {
  const res = await fetch(`${GRAPH}/${encodeURIComponent(params.igUserId)}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: encForm({
      media_type: "CAROUSEL",
      children: params.childContainerIds.join(","),
      caption: params.caption ?? "",
      access_token: params.accessToken,
    }),
  });
  await assertOk(res, "IG create carousel container");
  return (await res.json()) as { id: string };
}

/**
 * Publish a container to the IG feed.
 */
export async function publishInstagramMedia(params: {
  igUserId: string;
  creationId: string;
  accessToken: string;
}): Promise<Json> {
  const res = await fetch(
    `${GRAPH}/${encodeURIComponent(params.igUserId)}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encForm({
        creation_id: params.creationId,
        access_token: params.accessToken,
      }),
    }
  );
  await assertOk(res, "IG publish");
  return (await res.json()) as Json;
}

/**
 * Convenience: Post a single image to IG in two steps (create -> publish).
 */
export async function postInstagramImage(params: {
  igUserId: string;
  accessToken: string;
  imageUrl: string;
  caption?: string;
}) {
  const { id } = await createInstagramImageContainer(params);
  return publishInstagramMedia({
    igUserId: params.igUserId,
    creationId: id,
    accessToken: params.accessToken,
  });
}

/**
 * Convenience: Post a carousel of images (2–10).
 */
export async function postInstagramCarousel(params: {
  igUserId: string;
  accessToken: string;
  imageUrls: string[];
  caption?: string;
}) {
  if (!params.imageUrls || params.imageUrls.length < 2) {
    throw new Error("Carousel requires at least 2 image URLs.");
  }
  const children: string[] = [];
  for (const url of params.imageUrls) {
    const child = await createInstagramCarouselChild({
      igUserId: params.igUserId,
      accessToken: params.accessToken,
      imageUrl: url,
    });
    children.push(child.id);
  }
  const { id } = await createInstagramCarouselContainer({
    igUserId: params.igUserId,
    accessToken: params.accessToken,
    childContainerIds: children,
    caption: params.caption,
  });
  return publishInstagramMedia({
    igUserId: params.igUserId,
    creationId: id,
    accessToken: params.accessToken,
  });
}

/**
 * (Deprecated signature compatibility)
 * Your previous code called `postToInstagram({ accessToken, content })`.
 * IG Graph API cannot publish without an image/video URL and IG user id.
 * This wrapper throws a helpful error telling you what to pass.
 */
export async function postToInstagram(_payload: CrossPostPayload): Promise<never> {
  throw new Error(
    "postToInstagram requires { igUserId, imageUrl, accessToken, caption? }. " +
      "Use postInstagramImage({ igUserId, accessToken, imageUrl, caption }) or postInstagramCarousel(...)."
  );
}

/**
 * (Deprecated) Instagram Basic Display is READ-ONLY. Kept here so callers don't accidentally use it.
 * If you truly need Basic Display to read media, implement separately. Do NOT try to publish with it.
 */
export async function exchangeInstagramCode(): Promise<never> {
  throw new Error(
    "Instagram Basic Display code exchange is read-only and cannot be used for publishing. " +
      "Use Facebook Login (Graph OAuth): exchangeFacebookCode(...) instead."
  );
}
