import './globals.css';

export const metadata = {
  title: 'Outfit Select',
  description: 'Three.js GLB outfit selector carousel in Next.js'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
