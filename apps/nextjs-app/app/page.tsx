// apps/nextjs-app/app/page.tsx
import React from 'react';
import { CustomHeroButton } from './components/HeroButton';

export default function Index() {
  return (
    <div className="wrapper">
      <div className="container">
        <div id="welcome">
          <h1>Welcome nextjs-app 👋</h1>
        </div>
        <div id="hero" className="rounded">
          <div className="text-container">
            <h2>You’re up and running</h2>
          </div>
          <div className="logo-container">{/* Your SVG logo or similar */}</div>
        </div>
        <div id="commands">
          {/* Other content */}
          <CustomHeroButton onClick={() => alert('Hero UI Button clicked!')} />
        </div>
      </div>
    </div>
  );
}
