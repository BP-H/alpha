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

export default function PostComposer() {
  const [text, setText] = useState('');
  const [dest, setDest] = useState<CrossPostSelection>({
    linkedin: false,
    instagram: false,
  });

  const submit = async () => {
    // Placeholder access tokens; production would obtain via OAuth.
    const dummyToken = '';
    try {
      if (dest.linkedin)
        await postToLinkedIn({ accessToken: dummyToken, content: text });
      if (dest.instagram)
        await postToInstagram({ accessToken: dummyToken, content: text });
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card composer">
      <label htmlFor="postText">Share something...</label>
      <textarea
        id="postText"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <CrossPostToggles value={dest} onChange={setDest} />
      <button className="btn primary" onClick={submit} disabled={!text.trim()}>
        Post
      </button>
      <style jsx>{`
        .composer { display:flex; flex-direction:column; gap:8px; margin-bottom:16px; }
        label {
          color:var(--ink);
        }
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
