// ImageGallery.tsx
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import ZoomImage from "./ZoomImage";

// Improved ZoomImage component with lens effect instead of background

const MemoizedZoomImage = React.memo(ZoomImage);

interface ImageGalleryProps {
  images: string[];
  productName: string;
  disableZoomOnMobile?: boolean;
}

// ImageGallery component with fixed thumbnail scrolling
const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  productName,
  disableZoomOnMobile = true,
}) => {
  const [nav1, setNav1] = useState<Slider | null>(null);
  const [nav2, setNav2] = useState<Slider | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);

  // Check viewport size
  useEffect(() => {
    const checkViewport = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);

    return () => {
      window.removeEventListener("resize", checkViewport);
    };
  }, []);

  const slider1Settings = {
    arrows: false,
  };

  const slider2Settings = {
    arrows: false,
    slidesToShow: 4,
    centerMode: true,
    centerPadding: "0px",
    focusOnSelect: true,
    vertical: true,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          vertical: false,
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 576,
        settings: {
          vertical: false,
          slidesToShow: 4,
        },
      },
    ],
  };

  return (
    <div className="image-gallery-container">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Thumbnails - Vertical on desktop, horizontal on mobile */}
        <div className="md:w-1/6 lg:w-1/7 order-2 md:order-1">
          <div className="">
            <Slider
              asNavFor={nav1 || undefined}
              ref={(slider: Slider | null) => setNav2(slider)}
              {...slider2Settings}
            >
              {images.map((image, index) => (
                <div key={index} className="slider-item p-1 cursor-pointer">
                  <Image
                    height={500}
                    width={500}
                    src={image}
                    alt={`${productName} thumbnail ${index + 1}`}
                    className="w-full h-auto object-cover rounded"
                  />
                </div>
              ))}
            </Slider>
          </div>
        </div>

        {/* Main Image */}
        <div className="md:w-5/6 lg:w-4/5 order-1 md:order-2">
          <div className="image-gallery-main">
            <Slider
              asNavFor={nav2 || undefined}
              ref={(slider: Slider | null) => setNav1(slider)}
              {...slider1Settings}
              initialSlide={currentSlide}
            >
              {images.map((image, index) => (
                <div key={index} className="main-slide">
                  <MemoizedZoomImage
                    src={image}
                    alt={`${productName} image ${index + 1}`}
                    disableOnMobile={disableZoomOnMobile}
                  />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ImageGallery);
