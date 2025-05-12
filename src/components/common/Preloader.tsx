"use client";
import Image from "next/image";

const Preloader = () => {
  return (
    <div
      className="fixed top-0 left-0 z-50 w-screen h-screen flex items-center justify-center"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="flex flex-col items-center">
        <Image
          src="/Logo (2).png"
          alt="Loading"
          width={300}
          height={300}
          priority
        />
      </div>
    </div>
  );
};

export default Preloader;
