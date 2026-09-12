
"use client";

import { Info } from "./info";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";
import { InkLoader } from "@/components/ink-loader";

export const Loading = () => {
    return (
        <main className="h-full w-full relative bg-neutral-50 touch-none flex items-center justify-center">
            <InkLoader message="Opening board..." submessage="Preparing your infinite canvas..." />
            <Info.Skeleton />
            <Participants.Skeleton />
            <Toolbar.Skeleton />
        </main>
    );
};