import { InkLoader } from "@/components/ink-loader";

export const Loading = () => {
    return (
        <div className="h-full w-full flex flex-col justify-center items-center bg-slate-50/50">
            <InkLoader message="Signing in" submessage="Authenticating your session..." />
        </div>
    );
};