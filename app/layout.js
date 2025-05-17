// app/layout.js

import './globals.css';

export const metadata = {
  title: 'Interactive Web Design Generator',
  description: 'Generate web designs from text or image prompts',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}