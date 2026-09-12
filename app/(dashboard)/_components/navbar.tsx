"use client"

import { 
  OrganizationSwitcher, 
  UserButton, 
  useOrganization 
} from "@clerk/nextjs"
import { SearchInput } from "./search-input"
import { InviteButton } from "./invite-button"

export const Navbar = () => {

  const {organization} = useOrganization();

    return(
        <div className="flex items-center gap-x-4 p-5 bg-white border-b border-neutral-200/70">
            <div className="hidden lg:flex lg:flex-1 ">
               <SearchInput/>
            </div>
            <div className="block lg:hidden flex-1">

                  <OrganizationSwitcher
                        hidePersonal
                        appearance={{
                          elements: {
                            /* FULL WIDTH + HEIGHT */
                            rootBox: {
                              width: "100%",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              maxWidth: "376px"
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

            </div>
            {organization && <InviteButton/>}
              <UserButton/>
        </div>
    )
}