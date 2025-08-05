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
    <div className="bg-black text-gold">
      <MinimalistHero
        mainText="Discover luxury fashion that defines elegance and sophistication. Each piece is carefully curated to embody timeless style and exceptional quality."
        readMoreLink="/shop"
        imageSrc="/hero-img.png"
        imageAlt="Luxury fashion model showcasing JOOKA's elegant collection"
        overlayText={{
          part1: 'luxury',
          part2: 'redefined.',
        }}
        socialLinks={socialLinks}
        locationText="Dharan, NP"
        className="bg-black text-gold font-serif"
        showNavbar={false}
      />
    </div>
  );
};

export default JookaHeroDemo;
