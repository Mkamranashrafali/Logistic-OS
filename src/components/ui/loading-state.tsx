import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  text?: string;
}

export function LoadingState({ text = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-10 h-full w-full min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
    </div>
  );
}
