// "use client";
// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { ChevronLeft, ChevronRight } from "lucide-react";

// /**
//  * MESSIA Premium Hero Section
//  * - Auto-slides every 5 seconds
//  * - Smooth fade transitions (no rewind jump)
//  * - Elegant small Next/Prev buttons
//  * - Fully responsive across all devices
//  */

// const slides = [
//   {
//     id: 1,
//     image: "/hero1.jpg",
//     title: "Welcome to MESSIA", 
//     subtitle:
//       "Your magical destination for personalized and thoughtful gifts.",
//   },
//   {
//     id: 2,
//     image: "/HomeSectionBgImg.jpg",
//     title: "Curate Your Perfect Box",
//     subtitle:
//       "MESSIA crafts gift experiences that match your style and budget.",
//   },
//   {
//     id: 3,
//     image: "/flower.jpg",
//     title: "Bloom with Love",
//     subtitle:
//       "Send beautiful floral gifts that speak the language of emotion with MESSIA.",
//   },
//   {
//     id: 4,
//     image: "/hero3.jpg",
//     title: "Make Every Occasion Special",
//     subtitle:
//       "From birthdays to anniversaries, let MESSIA handle the magic.",
//   },
// ];

// export default function HomeSection({ ctaOnClick = () => {} }) {
//   const [current, setCurrent] = useState(0);

//   // Auto-slide every 5 seconds
//   useEffect(() => {
//     const timer = setInterval(() => {
//       nextSlide();
//     }, 5000);
//     return () => clearInterval(timer);
//   }, []);

//   const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
//   const prevSlide = () =>
//     setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

//   return (
//     <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
//       {/* ===== Background Slides ===== */}
//       {slides.map((slide, index) => (
//         <div
//           key={slide.id}
//           className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
//             index === current ? "opacity-100 z-10" : "opacity-0 z-0"
//           }`}
//         >
//           <Image
//             src={slide.image}
//             alt={slide.title}
//             fill
//             priority={index === current}
//             className="object-cover w-full h-full"
//           />
//           <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
//         </div>
//       ))}

//       {/* ===== Text Content ===== */}
//       <div className="relative z-20 w-full max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-16 sm:py-24 lg:py-32">
//         <div className="max-w-xl text-center md:text-left transition-all duration-700 ease-in-out">
//           <h1
//             key={slides[current].id}
//             className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-[#b11233] leading-tight animate-fade"
//           >
//             {slides[current].title}
//           </h1>

//           <p className="mt-4 text-gray-700 text-base sm:text-lg md:text-xl max-w-md md:max-w-lg mx-auto md:mx-0">
//             {slides[current].subtitle}
//           </p>

//           <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 md:gap-6">
//             {/* Get Started Button */}
//             <button
//               onClick={ctaOnClick}
//               className="bg-[#b11233] text-white font-medium px-6 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base"
//             >
//               Get Started
//             </button>

//             {/* Premium Prev / Next Buttons */}
//             <div className="flex gap-2 mt-2 sm:mt-0">
//               <button
//                 onClick={prevSlide}
//                 aria-label="Previous Slide"
//                 className="p-2.5 rounded-full backdrop-blur-md bg-white/50 hover:bg-white/70 border border-white/30 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110"
//               >
//                 <ChevronLeft className="w-4 h-4 text-[#b11233]" />
//               </button>

//               <button
//                 onClick={nextSlide}
//                 aria-label="Next Slide"
//                 className="p-2.5 rounded-full backdrop-blur-md bg-white/50 hover:bg-white/70 border border-white/30 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110"
//               >
//                 <ChevronRight className="w-4 h-4 text-[#b11233]" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ===== Navigation Dots ===== */}
//       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
//         {slides.map((_, index) => (
//           <button
//             key={index}
//             onClick={() => setCurrent(index)}
//             className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
//               index === current ? "bg-[#b11233] w-5" : "bg-gray-400/70"
//             }`}
//           />
//         ))}
//       </div>
//     </section>
//   );
// }
