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
    <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-5 md:w-5" />
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
        'relative flex w-full flex-col items-center justify-between overflow-hidden bg-background p-2 sm:p-4 md:p-8 font-sans',
        showNavbar
          ? 'min-h-screen md:h-[calc(100vh-5rem)]'
          : 'min-h-[95vh] sm:min-h-[98vh] md:h-[calc(100vh-3rem)]',
        className
      )}
      style={{
        paddingTop: showNavbar ? '0' : '0'
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
      <div className="relative grid w-full max-w-7xl grid-cols-1 items-center gap-1 sm:gap-2 md:grid-cols-3 md:gap-0 flex-1 py-0 sm:py-1 md:py-8">
        {/* Left Text Content */}
        <div className="z-20 order-2 md:order-1 text-center md:text-left px-2 sm:px-4 md:px-0 self-start mt-1 sm:mt-2 md:mt-0 md:self-center opacity-0 animate-fade-in-up" style={{ animationDelay: '1s', animationFillMode: 'forwards' }} suppressHydrationWarning>
          <p className="mx-auto max-w-md text-sm sm:text-base md:text-sm leading-relaxed text-foreground/90 md:mx-0 mb-4 sm:mb-6">{mainText}</p>
          <a href={readMoreLink} className="inline-block text-sm sm:text-base md:text-sm font-medium text-foreground underline decoration-from-font hover:text-gold transition-colors">
            Read More
          </a>
        </div>

        {/* Center Image with Circle */}
        <div className="relative order-1 md:order-2 flex justify-center items-center py-0 md:py-0 min-h-[180px] sm:min-h-[200px] md:min-h-[800px]">
            <div className="absolute z-0 h-[280px] w-[280px] sm:h-[320px] sm:w-[320px] md:h-[450px] md:w-[450px] lg:h-[500px] lg:w-[500px] rounded-full bg-gold opacity-0 animate-scale-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }} suppressHydrationWarning></div>
            <div className="relative z-10 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }} suppressHydrationWarning>
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="h-auto max-h-[450px] sm:max-h-[550px] md:max-h-[700px] lg:max-h-[800px] w-auto object-contain"
                    onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = `https://placehold.co/400x600/eab308/ffffff?text=Image+Not+Found`;
                    }}
                />
            </div>
            
            {/* Mobile Overlay Text - Only visible on mobile */}
            <div className="absolute inset-0 z-20 flex items-center justify-center md:hidden opacity-0 animate-fade-in-up" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }} suppressHydrationWarning>
              <h1 className="text-6xl sm:text-7xl font-extrabold text-white leading-[0.8] text-center">
                {overlayText.part1}
                <br />
                {overlayText.part2}
              </h1>
            </div>
        </div>

        {/* Right Text - Hidden on mobile, visible on desktop */}
        <div className="z-20 order-3 hidden md:flex items-center justify-center text-center md:justify-start md:text-left px-2 sm:px-4 md:px-0 py-4 sm:py-6 md:py-0 opacity-0 animate-fade-in-up" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }} suppressHydrationWarning>
          <h1 className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-extrabold text-white leading-[0.8] sm:leading-[0.75] md:leading-tight">
            {overlayText.part1}
            <br />
            {overlayText.part2}
          </h1>
        </div>
      </div>

      {/* Footer Elements */}
      <footer className="z-30 flex w-full max-w-7xl items-center justify-between px-2 sm:px-4 md:px-0 pb-2 sm:pb-4 md:pb-8">
        <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-5 opacity-0 animate-fade-in-up" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }} suppressHydrationWarning>
          {socialLinks.map((link, index) => (
            <SocialIcon key={index} href={link.href} icon={link.icon} />
          ))}
        </div>
        <div className="text-sm sm:text-base md:text-sm font-medium text-foreground/80 opacity-0 animate-fade-in-up" style={{ animationDelay: '1.3s', animationFillMode: 'forwards' }} suppressHydrationWarning>
          {locationText}
        </div>
      </footer>
    </div>
  );
};
