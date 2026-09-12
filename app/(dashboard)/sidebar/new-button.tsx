"use client"

import { Plus } from "lucide-react"
import { CreateOrganization } from "@clerk/nextjs"
import { X } from "lucide-react"
import { Hint } from "@/components/hint"
import { useState } from "react"

export const NewButton = () => {
    const [open, setOpen] = useState(false);

    return(
        <>
            <div className="aspect-square">
                <Hint label="Create organization"
                side="right"
                align="start"
                sideOffset={18}
                >

                <button className="bg-white/25 h-full w-full rounded-md flex items-center justify-center opacity-60 hover:opacity-100 transition" onClick={() => setOpen(true)}>
                    <Plus className="text-white" />
                </button>
                </Hint>
            </div>
            {open && (
              <div
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setOpen(false)
                }}
              >
              <div
                className="
                  bg-gradient-to-br from-gray-900/95 to-black/95
                  backdrop-blur-lg
                  rounded-xl
                  border border-gray-700/50
                  shadow-2xl
                  overflow-hidden
                  flex flex-col lg:flex-row
                  max-h-[90vh]
                "
              >


                {/* CLOSE BUTTON */}
                <button
                  onClick={() => setOpen(false)}
                  className="
                    absolute top-3 right-3 z-50
                    p-2 rounded-full bg-white/10 backdrop-blur-sm
                    hover:bg-white/20 transition
                    border border-white/20
                  "
                >
                  <X className="h-4 w-4 text-white" />
                </button>

                {/* ===== ONE BIG BLACK CONTAINER ===== */}
                <div
                  className="
                    bg-gradient-to-br from-gray-900/95 to-black/95
                    backdrop-blur-lg
                    rounded-xl
                    border border-gray-700/50
                    shadow-2xl
                    overflow-hidden
                    flex flex-col lg:flex-row
                  "
                >
                  {/* LEFT SIDE */}
                  <div className="flex-1 max-h-[95vh] overflow-y-auto">
                    <CreateOrganization />
                  </div>

                  {/* RIGHT SIDE (LIKE IMAGE) */}
                  <div
                    className="
                      hidden lg:flex
                      w-[240px]
                      bg-gradient-to-b from-black/90 to-black
                      p-8
                      flex-col items-center justify-center
                    "
                  >
                    <img
                      src="/logo.svg"
                      alt="Slate Logo"
                      className="w-28 h-28 mb-6 drop-shadow-lg"
                    />

                    <h1 className="text-2xl font-bold text-white text-center leading-tight">
                      Create Organization to Start{" "}
                      <span className="text-blue-400 bg-blue-900/20 px-2 py-1 rounded">
                        Slate
                      </span>
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            )}
        </>
    )
}