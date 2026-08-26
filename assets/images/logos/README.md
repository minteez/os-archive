Put logo images here — one per OS **record** (release), not one per family.

Each Windows release, each macOS version, each Linux distro, etc. has its own
distinct logo in real life, so each entry needs its own file, named after that
record's unique `id` field in js/data.js.

Example:
  Windows 95    (id: "win-95")    -> assets/images/logos/win-95.png
  Windows XP    (id: "win-xp")    -> assets/images/logos/win-xp.png
  Windows 11    (id: "win-11")    -> assets/images/logos/win-11.png

See FILENAMES.md in this same folder for the exact filename every one of the
93 current records expects.

Recommended: square PNG, transparent background, ~256x256px.
If a file is missing, the site automatically falls back to a colored monogram
tile — nothing breaks, so you can add these gradually.
