"use client"

import Image from "next/image"

export const EmptyFavorites = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4">

      {/* RESPONSIVE IMAGE (SAME AS elements.png) */}
      <div
        className="
          w-[200px]
          sm:w-[240px]
          md:w-[280px]
          lg:w-[200px]
          2xl:w-[380px]
        "
      >
        <Image
          src="/favitores.png"
          alt="No results"
          width={400}
          height={400}
          className="w-full h-auto object-contain"
          priority
        />
      </div>

      <h2 className="text-2xl font-semibold mt-6 text-center">
        No favorite boards!
      </h2>

      <p className="text-muted-foreground text-sm mt-2 text-center">
        Try favoriting a board.
      </p>
    </div>
  )
}
