"use client";

import qs from "query-string";
import { useRouter } from "next/navigation";
import { useDebounceValue } from "usehooks-ts";
import { Search } from "lucide-react";
import { useState, ChangeEvent, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

export const SearchInput = () => {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [debouncedValue] = useDebounceValue(value, 500);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: "/",
        query: {
          search: debouncedValue,
        },
      },
      { skipEmptyString: true, skipNull: true }
    );

    router.push(url);
  }, [debouncedValue, router]);

  return (
    <div className="relative w-full max-w-[480px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <Input
        ref={inputRef}
        className="h-9 w-full rounded-lg border border-neutral-200/90 bg-neutral-50/90 pl-9 pr-14 text-sm text-neutral-800 placeholder:text-neutral-400 shadow-sm transition-colors focus:bg-white focus:border-blue-400 focus-visible:ring-1 focus-visible:ring-blue-400"
        placeholder="Search boards..."
        onChange={handleChange}
        value={value}
      />
      <div className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded border border-neutral-200/80 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400 shadow-xs">
        <span className="text-[11px] leading-none">⌘</span>K
      </div>
    </div>
  );
};