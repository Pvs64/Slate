"use client"

import Link from "next/link"
import Image from "next/image"
import { Poppins } from "next/font/google"
import { cn } from "@/lib/utils"
import { OrganizationSwitcher } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Star } from "lucide-react"
import { useSearchParams } from "next/navigation"

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
})

export const OrgSidebar = () => {

    const searchParames = useSearchParams();
    const favorites = searchParames.get("favorites");



  return (
    <div className="hidden lg:flex flex-col space-y-6 w-[206px] pl-5 pt-5 h-full">
      {/* Logo */}
      <Link href="/">
        <div className="flex items-center gap-x-2">
          <Image src="/logo.svg" alt="Logo" height={40} width={40} priority />
          <span className={cn("text-2xl font-semibold", font.className)}>
            Slate
          </span>
        </div>
      </Link>

      {/* Organization Switcher */}
      <OrganizationSwitcher
        hidePersonal
        appearance={{
          elements: {
            /* FULL WIDTH + HEIGHT */
            rootBox: {
              width: "90%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            },

            organizationSwitcherTrigger: {
              width: "100%",
              height: "48px", // ✅ full consistent height
              padding: "8px 12px",
              borderRadius: "10px",
              border: "1px solid #E5E7EB",
              backgroundColor: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            },

            /* ORGANIZATION AVATAR SIZE */
            organizationAvatarBox: {
              width: "32px",
              height: "32px",
            },

            organizationAvatarImage: {
              width: "32px",
              height: "32px",
              borderRadius: "6px",
            },
          },
        }}
      />

      <div className="space-y-1 w-full">
        <Button 
        
        variant={favorites ? "ghost" : "secondary"}
        asChild
        size="lg"
        className="font-normal justify-start px-2 w-[90%]"
        >
            <Link href="/">
              <LayoutDashboard className="h-4 w-4 mr-2"/>
              Team boards
            </Link>
        </Button>

        <Button 
        variant={favorites ?  "secondary" : "ghost" }
        asChild
        size="lg"
        className="font-normal justify-start px-2 w-[90%]"
        >
            <Link href={{
                pathname: "/",
                query: {favorites: true}
            }}>
              <Star className="h-4 w-4 mr-2"/>
              Favorite boards
            </Link>
        </Button>
      </div>
    </div>
  )
}