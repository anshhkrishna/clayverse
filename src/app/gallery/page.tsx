import * as React from "react";
import { GalleryClient } from "./GalleryClient";

export const metadata = {
  title: "Gallery — Clayverse",
  description: "Explore ceramic artworks created by the Clayverse community.",
};

export default function GalleryPage() {
  return <GalleryClient />;
}
