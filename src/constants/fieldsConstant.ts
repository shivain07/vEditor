export const availableFormats = ["mp4", "webm", "avi", "ogg", "mov", "mp3"];
export const filterOptions = [
    { label: "None (Original)", value: "" },
    { label: "Grayscale", value: "hue=s=0" },
    {
        label: "Sepia (Alternative)",
        value: "eq=contrast=1.2:brightness=0.05:saturation=1.3,format=yuv420p",
    },
    { label: "Invert Colors", value: "negate,format=yuv420p" },
    { label: "Brightness + Light", value: "eq=brightness=0.06,format=yuv420p" },
    { label: "Contrast Increase", value: "eq=contrast=1.5,format=yuv420p" },
    {
        label: "Yellow Tint (Alternative)",
        value: "eq=gamma_r=1.2:gamma_g=1.2:gamma_b=0.8,format=yuv420p",
    },
    {
        label: "Blue Tint",
        value: "eq=gamma_r=0.8:gamma_g=0.8:gamma_b=1.5,format=yuv420p",
    },
    {
        label: "Green Tint",
        value: "eq=gamma_r=0.8:gamma_g=1.5:gamma_b=0.8,format=yuv420p",
    },
    {
        label: "Warm Glow",
        value: "eq=brightness=0.06:contrast=1.1:saturation=1.2,format=yuv420p",
    },
    {
        label: "Cool Tone",
        value: "eq=brightness=-0.02:contrast=1.1:saturation=0.8,format=yuv420p",
    },
];
export const fontOptions = ["arial", "henny", "kablamo"];
export const supportedFormatsToConvert = [
    "mp4",
    "webm",
    "avi",
    "mov",
    "mkv",
    "mp3",
    "wav",
    "flac",
    "aac",
    "opus",
    "ogg",
];

