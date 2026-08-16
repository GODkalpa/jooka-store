import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { MinimalistHero } from '@/components/ui/minimalist-hero';

const JookaHeroDemo = () => {
  const socialLinks = [
    { icon: Facebook, href: '#' },
    { icon: Instagram, href: '#' },
    { icon: Twitter, href: '#' },
    { icon: Linkedin, href: '#' },
  ];

  return (
    <div className="bg-canvas text-black">
      <MinimalistHero
        mainText="Capsule Edition 01: Curated apparel designed for timeless living. Crafted with heavyweight cotton and precision tailoring in Nepal."
        readMoreLink="/shop"
        imageSrc="/hero-img.png"
        imageAlt="JOOKA Capsule Collection"
        overlayText={{
          part1: 'CAPSULE',
          part2: 'DROP 01',
        }}
        socialLinks={socialLinks}
        locationText="Kathmandu / Dharan, NP"
        className="bg-canvas text-black font-sans border-b border-border-muted"
        showNavbar={false}
      />
    </div>
  );
};

export default JookaHeroDemo;
