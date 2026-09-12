"use client";
import { Plus, X } from "lucide-react";
import { OrganizationProfile } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
export const InviteButton = () => {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors rounded-lg px-3.5 h-9 text-xs sm:text-sm"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Invite members
      </Button>
      {open && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 md:p-6" 
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="relative w-full h-full max-w-6xl max-h-[95vh] overflow-visible  ">
            <button
              onClick={() => setOpen(false)}
              className="
                absolute top-2 right-2 sm:top-4 sm:right-4 z-50
                p-2 rounded-full bg-white/10 backdrop-blur-sm
                hover:bg-white/20 transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500
                border border-white/20
              "
              aria-label="Close modal"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>
            <div className="
              w-full h-[] 
              bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-lg
              rounded-lg md:rounded-xl lg:rounded-2xl
              overflow-hidden
              flex flex-col lg:flex-row
              border border-gray-700/50
              shadow-2xl
            ">
              <div className="flex-1 flex flex-col max-h-[95vh] overflow-y-auto lg:overflow-y-visible">
              {/* SIMPLIFIED VERSION WITHOUT THEME PROP */}
              <OrganizationProfile
                routing="hash"
                appearance={{
                  // REMOVED baseTheme entirely
                  elements: {
                    rootBox: "w-full h-full flex-1 bg-transparent",
                    card: "shadow-none border-none rounded-none w-full h-full flex flex-col bg-transparent",
                    navbar: `flex-shrink-0 border-b border-gray-700/50 bg-transparent ${isMobile ? 'px-2 py-3' : 'px-6 py-4'}`,
                    scrollBox: "flex-1 overflow-auto bg-transparent",
                    headerTitle: `${isMobile ? 'text-lg' : 'text-2xl'} font-semibold text-white`,
                    headerSubtitle: "text-gray-300",
                    table: "bg-transparent",
                    tableHead: "",
                    tableHeader: `${isMobile ? 'px-2 py-3 text-xs' : 'px-4 py-3'} text-black font-medium`,
                    tableRow: "border-b  border-gray-700/30 hover:bg-gray-800/20 transition-colors",
                    tableCell: `${isMobile ? 'px-2 py-3 text-sm' : 'px-4 py-3'} text-white`,
                    searchInput: `bg-gray-800/30 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500/50 ${isMobile ? 'text-sm' : ''}`,
                    formButtonPrimary: `bg-blue-600 hover:bg-blue-700 ${isMobile ? 'text-sm px-3 py-2' : ''}`,
                  }
                }}
              />
              </div>
              <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-black/90 to-black p-8 flex-col items-center justify-center">
                <img src="/logo.svg" alt="Slate Logo" className="w-32 h-32  mb-4 drop-shadow-lg" />
                <h1 className="text-3xl font-bold text-white text-center leading-tight">
                  Invite members to <span className="text-blue-400 bg-blue-900/20 px-2 py-1 rounded">Slate</span>
                </h1>
              </div>
            </div>
          
          </div>
        </div>
      )}
    </>
  );
}