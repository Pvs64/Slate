// page.tsx
import { Canvas } from "./_components/canvas";
import { Room } from "@/components/room";
import {Loading} from "./_components/loading"

interface BoardIdPageProps {
  params: Promise<{
    boardId?: string | string[];
  }>;
  searchParams?: Promise<{
    token?: string;
    role?: string;
  }>;
}

const BoardIdPage = async ({ params, searchParams }: BoardIdPageProps) => {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const rawId = resolvedParams?.boardId;
  const boardId = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!boardId) {
    throw new Error("Missing required route parameter: boardId");
  }

  return (
    <Room
      roomId={String(boardId)}
      fallback={<Loading />}
      token={resolvedSearchParams?.token}
      role={resolvedSearchParams?.role}
    >
      <Canvas boardId={String(boardId)} />
    </Room>
  );
};

export default BoardIdPage;