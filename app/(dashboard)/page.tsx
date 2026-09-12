"use client"

import { useOrganization } from "@clerk/nextjs";
import { EmptyOrg } from "./_components/empty-org";
import { useSearchParams } from "next/navigation";
import { BoardList } from "./_components/board-list";
import { TemplateGallery } from "./_components/template-gallery";
import { ActivityPanel } from "./_components/activity-panel";
import { NotificationsPanel } from "./_components/notifications-panel";

interface DashboardSearchParams {
  search: string;
  favorites: string;
  sort: string;
}

const DashboardPage = () => {
  const { organization } = useOrganization();
  const searchParams = useSearchParams();

  const params: DashboardSearchParams = {
    search: searchParams.get("search") ?? "",
    favorites: searchParams.get("favorites") ?? "",
    sort: searchParams.get("sort") ?? "recent",
  };

  return (
    <div className="flex-1 h-[calc(100%-80px)] p-6">
            {!organization ? (
              <EmptyOrg />
            ) : (
             <>
               {!params.search && !params.favorites && <TemplateGallery orgId={organization.id} />}
               {!params.search && !params.favorites && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                   <ActivityPanel orgId={organization.id} />
                   <NotificationsPanel orgId={organization.id} />
                 </div>
               )}
               <BoardList orgId={organization.id} query={params} />
             </>
           )}    </div>
  );
};

export default DashboardPage;
