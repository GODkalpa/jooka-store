'use client'

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the props interface for type safety and reusability
interface MinimalistHeroProps {
  logoText?: string;
  navLinks?: { label: string; href: string }[];
  mainText: string;
  readMoreLink: string;
  imageSrc: string;
  imageAlt: string;
  overlayText: {
    part1: string;
    part2: string;
  };
  socialLinks: { icon: LucideIcon; href: string }[];
  locationText: string;
  className?: string;
  showNavbar?: boolean;
}

// Helper component for navigation links
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="text-sm font-medium tracking-widest text-foreground/60 transition-colors hover:text-foreground"
  >
    {children}
  </a>
);

// Helper component for social media icons
const SocialIcon = ({ href, icon: Icon }: { href: string; icon: LucideIcon }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-foreground/60 transition-colors hover:text-foreground">
    <Icon className="h-5 w-5" />
  </a>
);

// The main reusable Hero Section component
export const MinimalistHero = ({
  logoText,
  navLinks,
  mainText,
  readMoreLink,
  imageSrc,
  imageAlt,
  overlayText,
  socialLinks,
  locationText,
  className,
  showNavbar = false,
}: MinimalistHeroProps) => {
  return (
    <div
      className={cn(
        'relative flex w-full flex-col items-center justify-between overflow-hidden bg-background p-8 font-sans md:p-12',
        className
      )}
      style={{
        minHeight: showNavbar ? 'calc(100vh - 2.5rem)' : '100vh',
        height: showNavbar ? 'calc(100vh - 2.5rem)' : '100vh',
        paddingTop: showNavbar ? '0' : '5rem'
      }}
    >
      {/* Header - Only show if showNavbar is true */}
      {showNavbar && (
        <header className="z-30 flex w-full max-w-7xl items-center justify-between">
          <div className="text-xl font-bold tracking-wider opacity-0 animate-fade-in-left" style={{ animationDelay: '0s', animationFillMode: 'forwards' }} suppressHydrationWarning>
            {logoText}
          </div>
          <div className="hidden items-center space-x-8 md:flex">
            {navLinks?.map((link) => (
              <NavLink key={link.label} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </div>
          <button className="flex flex-col space-y-1.5 md:hidden opacity-0 animate-fade-in-right" style={{ animationDelay: '0s', animationFillMode: 'forwards' }} aria-label="Open menu" suppressHydrationWarning>
            <span className="block h-0.5 w-6 bg-foreground"></span>
            <span className="block h-0.5 w-6 bg-foreground"></span>
            <span className="block h-0.5 w-5 bg-foreground"></span>
          </button>
        </header>
      )}

      {/* Main Content Area */}
      <div className="relative grid w-full max-w-7xl flex-grow grid-cols-1 items-center md:grid-cols-3">
        {/* Left Text Content */}
        <div className="z-20 order-2 md:order-1 text-center md:text-left opacity-0 animate-fade-in-up" style={{ animationDelay: '1s', animationFillMode: 'forwards' }} suppressHydrationWarning>
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-foreground/80 md:mx-0">{mainText}</p>
          <a href={readMoreLink} className="mt-4 inline-block text-sm font-medium text-foreground underline decoration-from-font">
            Read More
          </a>
        </div>

        {/* Center Image with Circle */}
        <div className="relative order-1 md:order-2 flex justify-center items-center h-full">
            <div className="absolute z-0 h-[380px] w-[380px] rounded-full bg-gold md:h-[450px] md:w-[450px] lg:h-[500px] lg:w-[500px] opacity-0 animate-scale-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }} suppressHydrationWarning></div>
            <div className="relative z-10 h-[600px] w-[600px] md:h-[700px] md:w-[700px] lg:h-[800px] lg:w-[800px] rounded-full overflow-hidden opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }} suppressHydrationWarning>
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="h-full w-full object-cover object-center"
                    onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = `https://placehold.co/600x600/eab308/ffffff?text=Image+Not+Found`;
                    }}
                />
            </div>
        </div>

        {/* Right Text */}
        <div className="z-20 order-3 flex items-center justify-center text-center md:justify-start md:text-left opacity-0 animate-fade-in-up" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }} suppressHydrationWarning>
          <h1 className="text-7xl font-extrabold text-white md:text-8xl lg:text-9xl">
            {overlayText.part1}
            <br />
            {overlayText.part2}
          </h1>
        </div>
      </div>

      {/* Footer Elements */}
      <footer className="z-30 flex w-full max-w-7xl items-center justify-between">
        <div className="flex items-center space-x-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }} suppressHydrationWarning>
          {socialLinks.map((link, index) => (
            <SocialIcon key={index} href={link.href} icon={link.icon} />
          ))}
        </div>
        <div className="text-sm font-medium text-foreground/80 opacity-0 animate-fade-in-up" style={{ animationDelay: '1.3s', animationFillMode: 'forwards' }} suppressHydrationWarning>
          {locationText}
        </div>
      </footer>
    </div>
  );
};
