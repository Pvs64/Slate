"use client";

import { useRef } from "react";
import { FileUp } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@/liveblocks.config";
import { Camera, Layer, LayerType } from "@/types/canvas";
import { LiveObject } from "@liveblocks/client";
import { nanoid } from "nanoid";

const MAX_PDF_SIZE = 4 * 1024 * 1024;

interface PdfImporterProps { camera: Camera; }

export const PdfImporter = ({ camera }: PdfImporterProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const insertPdf = useMutation(({ storage, setMyPresence }, payload: { src: string; name: string }) => {
    const id = nanoid();
    storage.get("layers").set(
      id,
      new LiveObject<Layer>({
        type: LayerType.Pdf,
        x: -camera.x / camera.zoom + 120,
        y: -camera.y / camera.zoom + 120,
        width: 640,
        height: 480,
        fill: { r: 255, g: 255, b: 255 },
        src: payload.src,
        name: payload.name,
      } as Layer)
    );
    storage.get("layerIds").push(id);
    setMyPresence({ selection: [id] }, { addToHistory: true });
  }, [camera]);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Choose a PDF file");
      return;
    }
    if (file.size > MAX_PDF_SIZE) {
      toast.error("PDFs must be smaller than 4 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") insertPdf({ src: reader.result, name: file.name });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return <div className="absolute right-4 top-28 z-20"><input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={onFileChange} /><button className="flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-xs shadow-sm hover:bg-neutral-50" onClick={() => inputRef.current?.click()}><FileUp className="h-4 w-4" /> Upload PDF</button></div>;
};