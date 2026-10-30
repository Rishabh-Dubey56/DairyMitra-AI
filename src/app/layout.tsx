'use client';

import React, { useState } from 'react';
import './globals.css';
import { LanguageProvider } from '@/components/common/LanguageContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <title>DairyMitra AI - Smart Dairy Farm Management Platform</title>
        <meta name="description" content="AI-Powered Dairy Farm Management Platform for livestock, milk production, expenses, and AI veterinary & nutrition advice." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-[#F8FAF7] text-slate-800 antialiased min-h-screen">
        <LanguageProvider>
          <div className="flex min-h-screen">
            {/* Sidebar (Desktop persistent, Mobile drawer) */}
            <Sidebar 
              isMobileOpen={mobileMenuOpen} 
              onCloseMobile={() => setMobileMenuOpen(false)} 
            />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col lg:pl-64 min-w-0">
              <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-slide-up">
                {children}
              </main>
            </div>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
