import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'INKLOOM AI — Brand Governance Platform',
  description: 'Create freely. Govern intelligently. Publish confidently. AI-powered brand compliance, hybrid RAG policy verification, and risk-managed publishing workflows.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
