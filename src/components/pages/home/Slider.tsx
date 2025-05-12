"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAppSelector } from "@/redux/hooks";
import { selectStorefrontData } from "@/redux/features/storefront/storeSlice";
import { useGetAllSectionsQuery } from "@/redux/features/storefront/storefront.api";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import Preloader from "@/components/common/Preloader";

const Slider: React.FC = () => {
  const { data: sectionsData, isLoading } = useGetAllSectionsQuery(undefined);
  const sliderData = useAppSelector(selectStorefrontData);
  const [isMobile, setIsMobile] = useState(false);
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handlePrevSlide = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const handleNextSlide = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  if (isLoading) return <Preloader />;

  if (!sliderData?.sliders?.length) return null;

  const hasMultipleSlides = sliderData.sliders.length > 1;
  const slides = hasMultipleSlides
    ? sliderData.sliders
    : [...sliderData.sliders, ...sliderData.sliders];

  return (
    <div className="relative w-full h-screen top-28 mb-32 overflow-hidden group">
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        speed={1000}
        loop={hasMultipleSlides}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          el: ".custom-pagination",
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className} w-3 h-3 bg-white bg-opacity-50 rounded-full transition-all duration-300 hover:bg-opacity-100"></span>`;
          },
        }}
        modules={[Pagination, Autoplay, EffectFade, Navigation]}
        className="h-full w-full"
      >
        {slides.map((item: any, index: number) => (
          <SwiperSlide key={index} className="relative">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src={isMobile ? item.image.mobile : item.image.desktop}
                alt={item.title || `Fashion Slide ${index + 1}`}
                fill
                priority={index === 0}
                quality={90}
                sizes="100vw"
                className="object-cover object-center md:object-top lg:object-center"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
              />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-black/40 z-10" />

            {/* Content */}
            <div className="relative z-20 h-full flex items-center justify-center text-center px-4 lg:px-20">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-white max-w-4xl mx-auto"
              >
                {item.title && (
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 tracking-tight uppercase"
                  >
                    {item.title}
                  </motion.h1>
                )}

                {item.subTitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-6 sm:mb-8 font-light opacity-90"
                  >
                    {item.subTitle}
                  </motion.p>
                )}

                {item.link && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                  >
                    <Link
                      href={item.link}
                      className="group inline-flex items-center px-6 sm:px-8 py-2 sm:py-3 bg-tomato text-white rounded-full 
                      hover:bg-opacity-90 transition-all duration-300 
                      font-semibold text-base sm:text-lg tracking-wider"
                    >
                      Shop Now
                      <ChevronRight
                        className="ml-2 transition-transform group-hover:translate-x-1"
                        size={20}
                      />
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      {hasMultipleSlides && (
        <div className="absolute top-1/2 left-0 right-0 z-30 flex justify-between items-center px-4 lg:px-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            className="swiper-button-slider-prev bg-white/20 hover:bg-white/40 rounded-full p-2 transition-all duration-300 backdrop-blur-sm"
            onClick={handlePrevSlide}
          >
            <ChevronLeft className="text-white" size={24} />
          </button>
          <button
            className="swiper-button-slider-next bg-white/20 hover:bg-white/40 rounded-full p-2 transition-all duration-300 backdrop-blur-sm"
            onClick={handleNextSlide}
          >
            <ChevronRight className="text-white" size={24} />
          </button>
        </div>
      )}

      {/* Custom Pagination */}
      <div className="custom-pagination absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-2"></div>
    </div>
  );
};

export default Slider;
