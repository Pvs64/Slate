"use client"

import { useEffect, useState } from "react"
import { RenameModal } from "@/components/modals/rename-modals"

export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      const frame = window.requestAnimationFrame(() => setIsMounted(true));
      return () => window.cancelAnimationFrame(frame);
    }, []);


    if(!isMounted){
        return null;
    }

    return (
      <>
        <RenameModal/>
      </>
    )
}