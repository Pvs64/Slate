"use client";

import { HelpCircle } from "lucide-react";
import { Hint } from "@/components/hint";
import { List } from "./list";
import { NewButton } from "./new-button";

export const Sidebar = () => {
    return (
        <aside className="fixed z-[1] left-0 bg-blue-950 h-full w-[60px] flex p-3 flex-col justify-between text-white">
            <div className="flex flex-col gap-y-4">
                <List/>
                <NewButton/>
            </div>
            <div className="flex flex-col items-center gap-y-2">
                <Hint label="Help & Resources" side="right" sideOffset={18}>
                    <button
                        onClick={() => window.open("https://github.com", "_blank")}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-blue-200/70 hover:text-white hover:bg-white/10 transition"
                        aria-label="Help & Resources"
                    >
                        <HelpCircle className="h-5 w-5" />
                    </button>
                </Hint>
            </div>
        </aside>
    )
}