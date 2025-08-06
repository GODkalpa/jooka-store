'use client';
import { ReactLenis } from 'lenis/react';
import React, { forwardRef } from 'react';

const StickyScrollComponent = forwardRef<HTMLElement>((props, ref) => {
  return (
    <ReactLenis root>
      <main className='bg-black' ref={ref}>
        <div className='wrapper'>
          <section className='text-white h-[80vh] w-full bg-black grid place-content-center sticky top-0'>
            <div className='absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]'></div>

            <div className="text-center space-y-4 px-6">
              <span className="text-sm font-medium tracking-[0.2em] text-gold/60 uppercase block">
                Heritage
              </span>
              <h1 className='2xl:text-6xl xl:text-5xl text-4xl font-serif font-light tracking-tight leading-[110%] text-gold'>
                Our Story
                <span className="block text-3xl md:text-4xl xl:text-4xl text-ivory/90 font-light italic mt-1">
                  Through Time
                </span>
              </h1>
              <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent w-16 mx-auto" />
              <p className="text-base md:text-lg text-ivory/70 font-light tracking-wide max-w-xl mx-auto leading-relaxed">
                Discover the journey of JOOKA through our visual story of craftsmanship, elegance, and timeless design
              </p>
              <span className="text-sm text-ivory/50 font-light tracking-wide block pt-2">
                Scroll down to explore 👇
              </span>
            </div>
          </section>
        </div>

        <section className='text-white w-full bg-black'>
          <div className='grid grid-cols-12 gap-3 p-4 max-w-7xl mx-auto'>
            <div className='grid gap-3 col-span-4'>
              <figure className='w-full'>
                <img
                  src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop'
                  alt='Luxury fashion atelier'
                  className='transition-all duration-500 w-full h-80 align-bottom object-cover rounded-md hover:scale-105'
                />
              </figure>
              <figure className='w-full'>
                <img
                  src='https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&auto=format&fit=crop'
                  alt='Elegant fashion design'
                  className='transition-all duration-500 w-full h-80 align-bottom object-cover rounded-md hover:scale-105'
                />
              </figure>
              <figure className='w-full'>
                <img
                  src='/stickyimages/mens-apparel-fashion-stores-interior-design-6.jpg'
                  alt='Mennpnpm apparel fashion store interior'
                  className='transition-all duration-500 w-full h-80 align-bottom object-cover rounded-md hover:scale-105'
                />
              </figure>
              <figure className='w-full'>
                <img
                  src='/stickyimages/tailors-hand-close-up-dressmaker-sewing-suit-fabric-with-hand-fashion-designer-tailor-sewer-workshop-studio-designing-new-collection-clothes_84738-6079.avif'
                  alt='Artisan craftsmanship'
                  className='transition-all duration-500 w-full h-80 align-bottom object-cover rounded-md hover:scale-105'
                />
              </figure>
              <figure className='w-full'>
                <img
                  src='https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop'
                  alt='Fashion heritage'
                  className='transition-all duration-500 w-full h-80 align-bottom object-cover rounded-md hover:scale-105'
                />
              </figure>
            </div>
            <div className='sticky top-0 h-screen w-full col-span-4 gap-3 grid grid-rows-3'>
              <figure className='w-full h-full relative group'>
                <img
                  src='https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&auto=format&fit=crop'
                  alt='JOOKA heritage collection'
                  className='transition-all duration-500 h-full w-full align-bottom object-cover rounded-md group-hover:scale-105'
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-md" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl font-serif font-light text-gold mb-2">2019</h3>
                  <p className="text-sm text-ivory/80 font-light">The beginning of our journey</p>
                </div>
              </figure>
              <figure className='w-full h-full relative group'>
                <img
                  src='https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&auto=format&fit=crop'
                  alt='Timeless elegance'
                  className='transition-all duration-500 h-full w-full align-bottom object-cover rounded-md group-hover:scale-105'
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-md" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl font-serif font-light text-gold mb-2">Craftsmanship</h3>
                  <p className="text-sm text-ivory/80 font-light">Meticulous attention to detail</p>
                </div>
              </figure>
              <figure className='w-full h-full relative group'>
                <img
                  src='/stickyimages/bdcdcc7efc928f6128717f37461e30bb.jpg'
                  alt='Modern luxury fashion'
                  className='transition-all duration-500 h-full w-full align-bottom object-cover rounded-md group-hover:scale-105'
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-md" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl font-serif font-light text-gold mb-2">Innovation</h3>
                  <p className="text-sm text-ivory/80 font-light">Modern luxury redefined</p>
                </div>
              </figure>
            </div>
            <div className='grid gap-3 col-span-4'>
              <figure className='w-full'>
                <img
                  src='/stickyimages/mens-apparel-fashion-stores-interior-design-5-1334x834.jpg'
                  alt='Fashion innovation'
                  className='transition-all duration-500 w-full h-80 align-bottom object-cover rounded-md hover:scale-105'
                />
              </figure>
              <figure className='w-full'>
                <img
                  src='https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=500&auto=format&fit=crop'
                  alt='Luxury retail experience'
                  className='transition-all duration-500 w-full h-80 align-bottom object-cover rounded-md hover:scale-105'
                />
              </figure>
              <figure className='w-full'>
                <img
                  src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop'
                  alt='Sustainable luxury'
                  className='transition-all duration-500 w-full h-80 align-bottom object-cover rounded-md hover:scale-105'
                />
              </figure>
              <figure className='w-full'>
                <img
                  src='/stickyimages/tailor.avif'
                  alt='Fashion craftsmanship'
                  className='transition-all duration-500 w-full h-80 align-bottom object-cover rounded-md hover:scale-105'
                />
              </figure>
              <figure className='w-full'>
                <img
                  src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop'
                  alt='JOOKA legacy'
                  className='transition-all duration-500 w-full h-80 align-bottom object-cover rounded-md hover:scale-105'
                />
              </figure>
            </div>
          </div>
        </section>

        <footer className='group bg-black py-12'>
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="space-y-6">
              <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent w-32 mx-auto" />
              <h1 className='text-[12vw] md:text-[8vw] lg:text-[6vw] leading-[100%] uppercase font-serif font-light bg-gradient-to-r from-gold via-gold/80 to-ivory bg-clip-text text-transparent transition-all ease-linear'>
                JOOKA
              </h1>
              <p className="text-ivory/60 font-light tracking-wide max-w-2xl mx-auto">
                Where timeless elegance meets modern craftsmanship. Every piece tells a story of heritage, sustainability, and uncompromising quality.
              </p>
              <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent w-32 mx-auto" />
            </div>
          </div>
        </footer>
      </main>
    </ReactLenis>
  );
});

StickyScrollComponent.displayName = 'StickyScrollComponent';

export default StickyScrollComponent;
