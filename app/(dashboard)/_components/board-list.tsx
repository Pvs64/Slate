"use client";

import { InkLoader } from "@/components/ink-loader";
import { useQuery } from "convex/react";
import { EmptyBoards } from "./empty-boards";
import { EmptyFavorites } from "./empty-favorites";
import { EmptySearch } from "./empty-search";
import { api } from "@/convex/_generated/api";
import { BoardCard } from "./board-card";
import { NewBoardButton } from "./new-board-button";
import { Id } from "@/convex/_generated/dataModel";

interface BoardListProps{
    orgId: string;
    query:{
        search? : string;
        favorites? : string;
      sort? : string;
    };
}

export const BoardList = ({
    orgId, 
    query,
}: BoardListProps) => {

    const data = useQuery(api.boards.get, {
        orgId,
        search: query.search,
        favorites: query.favorites,
    });

    const sortedData = data ? [...data].sort((first, second) => {
      if (query.sort === "title") return first.title.localeCompare(second.title);
      if (query.sort === "favorites") return Number(second.isFavorite) - Number(first.isFavorite);
      return second._creationTime - first._creationTime;
    }) : data;

if (data === undefined) {
  return (
    <div className="relative min-h-[400px] pt-6 border-t border-neutral-200/80 mt-2 pb-16">
      <h2 className="text-2xl font-semibold text-neutral-900">
        {query.favorites ? "Favorite boards" : "Team boards"}
      </h2>

      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <InkLoader variant="compact" message="Loading boards..." />
      </div>

      <div
        className="
          grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
          lg:grid-cols-5 xl:grid-cols-6
          gap-5 mt-8 pb-10 opacity-50
        "
      >
        {!query.favorites && (
         <NewBoardButton orgId={orgId} disabled/>
        )}

        {Array.from({ length: 5 }).map((_, i) => (
          <BoardCard.Skeleton key={i} />
        ))}
      </div>
    </div>
  );
}




    if(!data?.length && query.search){
        return(
           <EmptySearch/>
        )
    }

    if(!data?.length && query.favorites){
        return <EmptyFavorites/>;
    }

    if(!data?.length ){
        return <EmptyBoards/>
    }

    return(
        <div className="pt-6 border-t border-neutral-200/80 mt-2 pb-16">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-neutral-900">
                 {query.favorites ? "Favorite boards" : "Team boards"}
              </h2>
              <select
                className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm"
                value={query.sort || "recent"}
                onChange={(event) => {
                  const params = new URLSearchParams(window.location.search);
                  params.set("sort", event.target.value);
                  window.history.pushState({}, "", `/?${params.toString()}`);
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
                aria-label="Sort boards"
              >
                <option value="recent">Last edited</option>
                <option value="title">Title</option>
                <option value="favorites">Favorites first</option>
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 mt-8 pb-10">
                {!query.favorites && (
                 <NewBoardButton orgId={orgId} disabled={false}  />
                )}
                {sortedData?.map((board: {
                    _id: Id<"boards">;
                    title: string;
                    authorName: string;
                    authorId: string;
                    _creationTime: number;
                    imageUrl: string;
                    orgId: string;
                    isFavorite: boolean;
                })=>(
                    <BoardCard
                     key={board._id}
                     id={board._id}
                     title={board.title}
                     imageUrl={board.imageUrl}
                     authorId={board.authorId}
                     orgId={board.orgId}
                     authorName={board.authorName}
                     createdAt={board._creationTime}
                     isFavorite={board.isFavorite}
                    />
                ))}
            </div> 
        </div>
    )
}
