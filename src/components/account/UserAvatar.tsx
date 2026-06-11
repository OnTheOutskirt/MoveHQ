"use client";

import { cn } from "@/lib/utils";
import { ImagePlus } from "lucide-react";
import Image from "next/image";

type UserAvatarProps = {
  initials: string;
  imageDataUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-9 w-9 text-sm",
  md: "h-10 w-10 text-sm",
  lg: "h-24 w-24 text-xl",
};

export function UserAvatar({
  initials,
  imageDataUrl,
  size = "md",
  className,
}: UserAvatarProps) {
  const dim = sizeClasses[size];

  if (imageDataUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full bg-slate-100",
          dim,
          className,
        )}
      >
        <Image
          src={imageDataUrl}
          alt=""
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700",
        dim,
        className,
      )}
    >
      {initials}
    </div>
  );
}

export function ProfilePhotoPlaceholder({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const dim = sizeClasses[size];
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-50",
        dim,
      )}
    >
      <ImagePlus className={cn(size === "lg" ? "h-8 w-8" : "h-5 w-5", "text-slate-300")} />
    </div>
  );
}
