"use client";

import { useRef, useState } from "react";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

type Props = {
  value: string;
  online: boolean;
  onChange: (url: string) => void;
  onUploadingChange: (uploading: boolean) => void;
};

export default function AnnouncementImagePicker({ value, online, onChange, onUploadingChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const { startUpload, isUploading } = useUploadThing("fileUploader", {
    onUploadProgress: (next) => setProgress(Math.max(0, Math.min(100, Math.round(next)))),
    onClientUploadComplete: (files) => {
      onUploadingChange(false);
      const file = files?.[0];
      const url = file?.ufsUrl || file?.url;
      if (!url) {
        setMessage("Upload finished without a usable image URL. Your previous image is unchanged.");
        return;
      }
      onChange(url);
      setMessage("Announcement thumbnail uploaded and ready to publish.");
      setProgress(100);
      if (inputRef.current) inputRef.current.value = "";
    },
    onUploadError: (error) => {
      onUploadingChange(false);
      setProgress(0);
      setMessage(error.message || "Image upload failed. Your current thumbnail has been kept.");
    },
  });

  async function uploadSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!online || !navigator.onLine) {
      setMessage("Uploading needs an internet connection. Nothing was changed.");
      event.target.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      setMessage("Choose an image file.");
      event.target.value = "";
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setMessage("Choose an image smaller than 4 MB.");
      event.target.value = "";
      return;
    }
    onUploadingChange(true);
    setProgress(0);
    setMessage("Uploading image… keep this page open until UploadThing confirms it.");
    try {
      await startUpload([file]);
    } catch {
      onUploadingChange(false);
      setProgress(0);
      setMessage("Image upload failed. Check your connection and try again.");
    }
  }


  return (
    <fieldset className="sd-announcement-image-picker" disabled={isUploading}>
      <legend>Announcement thumbnail <span className="sd-optional">OPTIONAL</span></legend>
      <p className="sd-admin-help">Add a small, relevant image that helps customers recognise the update. Keep the subject clear when cropped.</p>
      <label className="sd-media-file-label" htmlFor="announcement-thumbnail-file">Upload an image · max 4 MB</label>
      <input ref={inputRef} id="announcement-thumbnail-file" type="file" accept="image/*" onChange={uploadSelected} />
      {!online && <small className="sd-media-offline">Offline: reconnect before uploading an image.</small>}
      <label className="sd-media-url-label" htmlFor="announcement-thumbnail-url">Or use an existing image URL</label>
      <input id="announcement-thumbnail-url" type="url" value={value} onChange={(event) => { onChange(event.target.value); setMessage(""); }} placeholder="https://…/image.jpg" />
      {isUploading && <div className="sd-media-progress" role="status" aria-live="polite"><div className="sd-media-progress-copy"><strong>Uploading thumbnail</strong><span>{progress}%</span></div><div className="sd-media-progress-track" role="progressbar" aria-label="Thumbnail upload progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: progress + "%" }} /></div></div>}
      {message && <p className="sd-media-status" role="status">{message}</p>}
      {value && <div className="sd-announcement-image-current"><img src={value} alt="Announcement thumbnail preview" onError={(event) => { event.currentTarget.style.display = "none"; }} /><button type="button" onClick={() => { onChange(""); setMessage("Thumbnail removed. Publish the announcement to apply the change."); }}>Remove thumbnail</button></div>}
    </fieldset>
  );
}
