import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pocket — Simple Expense Tracker',
  description: 'Track your daily expenses simply and professionally.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
