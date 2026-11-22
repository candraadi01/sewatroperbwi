export const gallerySectionType = "gallery_photo";

export type GalleryPhoto = {
  id: string;
  title: string;
  caption: string;
  image: string;
};

export function isGalleryImage(value: unknown): value is string {
  return typeof value === "string" && value.length <= 500 && (
    (/^\/images\/[a-zA-Z0-9._/-]+$/.test(value) && !value.split("/").includes("..")) ||
    /^https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9_-]+\/image\/upload\/[^\s\\]+$/.test(value)
  );
}

export const sampleGallery: GalleryPhoto[] = [
  { id: "baluran", title: "Menyusuri savana Baluran", caption: "Taman Nasional Baluran", image: "/images/landing/tour-trooper-baluran-savana.jpg" },
  { id: "ijen", title: "Jeep di jalur pegunungan Ijen", caption: "Kawah Ijen", image: "/images/landing/tour-trooper-kawah-ijen.jpg" },
  { id: "sukamade", title: "Perjalanan ke Pantai Sukamade", caption: "Taman Nasional Meru Betiri", image: "/images/landing/tour-sukamade.jpg" },
];
