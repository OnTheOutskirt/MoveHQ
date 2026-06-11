"use client";

import { ProfilePhotoPlaceholder, UserAvatar } from "@/components/account/UserAvatar";
import { Button } from "@/components/ui/Button";
import { readSignatureImageFile } from "@/lib/session/signature-image";
import { Trash2 } from "lucide-react";

type ProfilePhotoPickerProps = {
  initials: string;
  imageDataUrl: string | null;
  onImageChange: (dataUrl: string | null) => void;
};

export function ProfilePhotoPicker({
  initials,
  imageDataUrl,
  onImageChange,
}: ProfilePhotoPickerProps) {
  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    readSignatureImageFile(
      file,
      (dataUrl) => onImageChange(dataUrl),
      (message) => window.alert(message),
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      {imageDataUrl ? (
        <UserAvatar initials={initials} imageDataUrl={imageDataUrl} size="lg" />
      ) : (
        <ProfilePhotoPlaceholder size="lg" />
      )}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-900">Profile photo</p>
        <p className="max-w-xs text-xs text-slate-500">
          Shown in the header and account menu. PNG, JPEG, or WebP under 256 KB.
        </p>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="sr-only"
              onChange={handleImagePick}
            />
            <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              {imageDataUrl ? "Replace photo" : "Upload photo"}
            </span>
          </label>
          {imageDataUrl ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => onImageChange(null)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
