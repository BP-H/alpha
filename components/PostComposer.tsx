// components/PostComposer.tsx
'use client';

import { useState } from 'react';
import CrossPostToggles, {
  CrossPostSelection,
} from '@/components/CrossPostToggles';
import {
  postToInstagram,
  postToLinkedIn,
} from '@/libs/socialIntegrations';
import { useSocialAuth } from '@/lib/socialAuth';

export default function PostComposer() {
  const [text, setText] = useState('');
  const [dest, setDest] = useState<CrossPostSelection>({
    linkedin: false,
    instagram: false,
  });
  const { linkedinToken, instagramToken } = useSocialAuth();

  const submit = async () => {
    try {
      if (dest.linkedin)
        await postToLinkedIn({
          accessToken: linkedinToken ?? '',
          content: text,
        });
      if (dest.instagram)
        await postToInstagram({
          accessToken: instagramToken ?? '',
          content: text,
        });
      setText('');
      alert('Post sent successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to send post');
    }
  };

  return (
    <div className="card composer">
      <textarea
        placeholder="Share something..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <CrossPostToggles value={dest} onChange={setDest} />
      <button className="btn primary" onClick={submit} disabled={!text.trim()}>
        Post
      </button>
      <style jsx>{`
        .composer { display:flex; flex-direction:column; gap:8px; margin-bottom:16px; }
        textarea {
          width:100%;
          min-height:60px;
          border-radius:12px;
          background:#0c0e14;
          border:1px solid var(--stroke);
          color:var(--ink);
          padding:8px;
          resize:vertical;
        }
        button { align-self:flex-end; }
      `}</style>
    </div>
  );
}
