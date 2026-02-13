Place your ranked emblem PNG files in this folder using the naming convention `emblem-<tier>.png`.

Examples:
- emblem-iron.png
- emblem-bronze.png
- emblem-silver.png
- emblem-gold.png
- emblem-platinum.png
- emblem-diamond.png
- emblem-master.png
- emblem-grandmaster.png
- emblem-challenger.png

The frontend will try to load `/ranked-emblems/emblem-<tier>.png` first and fall back to the CDN if the local file is not present.
