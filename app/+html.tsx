import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// Web document only; native screens still use the shared Expo Router layouts.
export default function Html({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0C0B09" />
        <meta name="description" content="PTown Access — explore the music, hospitality, and creative community of PTown Dinner Club in Paducah, Kentucky." />
        <title>PTown Access · PTown Dinner Club</title>
        <ScrollViewStyleReset />
        <style>{`html, body { background: #0C0B09; } a:focus-visible, button:focus-visible, [role="tab"]:focus-visible { outline: 2px solid #D9B76F; outline-offset: 4px; }`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
