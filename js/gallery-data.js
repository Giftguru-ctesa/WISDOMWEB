/* ==========================================================================
   WISDOM ACADEMY — ACTIVITIES GALLERY

   This file is only a local fallback. The live website reads
   data/gallery.json, which is managed from the browser at /admin/.

   HOW TO ADD PHOTOS
   -----------------
   Once the site is hosted on Vercel:
   1. Open https://YOUR-SITE.vercel.app/admin/ and log in.
   2. Open "Activities Gallery" > "Gallery Photos".
   3. Add a photo, then fill in the title, category, description and date.
   4. Publish. The live gallery updates after Vercel finishes rebuilding.

   MANUAL FALLBACK
   ---------------
   If you edit files by hand instead, copy photos into assets/gallery/,
   update data/gallery.json, and keep the entries below in sync for local
   file:// previews. Use landscape photos around 1600 x 1200 pixels and keep
   each file under about 500KB.
   ========================================================================== */

window.GALLERY_ITEMS = [
  {
    src: "assets/gallery/learning.svg",
    alt: "Placeholder for a classroom learning activity photo",
    title: "Learning in action",
    category: "Learning",
    date: ""
  },
  {
    src: "assets/gallery/sports.svg",
    alt: "Placeholder for a school sports activity photo",
    title: "Sports and teamwork",
    category: "Sports",
    date: ""
  },
  {
    src: "assets/gallery/arts.svg",
    alt: "Placeholder for an arts and culture activity photo",
    title: "Creative arts and culture",
    category: "Arts & culture",
    date: ""
  },
  {
    src: "assets/gallery/environment.svg",
    alt: "Placeholder for an environment activity photo",
    title: "Caring for our environment",
    category: "Environment",
    date: ""
  },
  {
    src: "assets/gallery/community.svg",
    alt: "Placeholder for a school community activity photo",
    title: "Community and celebration",
    category: "Community",
    date: ""
  },
  {
    src: "assets/gallery/faith.svg",
    alt: "Placeholder for a faith and character activity photo",
    title: "Faith and character",
    category: "Faith",
    date: ""
  }
];
