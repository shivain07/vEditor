# 🎥 Video Editor & Converter Web App

A powerful web-based video editing and conversion tool built using
**React**, **FFmpeg.wasm**, and **Flowbite React**.

------------------------------------------------------------------------

## 🚀 Project Overview

This project allows users to: - Upload videos in various formats (MP4,
WebM, AVI). - Trim videos with an interactive range slider. - Add text
overlays with customizable color, position, and font. - Apply filters
like sepia, grayscale, and color tints. - Convert videos to multiple
formats (MP4, WebM, AVI). - Download processed videos directly from the
browser.

------------------------------------------------------------------------

## ⚡ Key Features

-   ✅ Fast video trimming (using keyframe-aligned seeking).
-   ✅ Text overlay with font and color selection.
-   ✅ Apply visual filters (sepia, blue tint, grayscale alternative).
-   ✅ Supports multiple export formats: MP4, WebM, AVI.
-   ✅ Download processed video or automatic download after processing.
-   ✅ Displays real-time processing progress with a spinner and
    progress bar.
-   ✅ Error handling modal popup when process fails or gets stuck.
-   🌟 Planned Features:
    -   Live preview while seeking through the video timeline.
    -   Crop video dynamically.
    -   Insert graphics or images.
    -   Improved polished error handling.

------------------------------------------------------------------------

## 🧱 Tech Stack

-   React
-   FFmpeg.wasm (FFmpeg compiled to WebAssembly for in-browser video
    processing)
-   Tailwind CSS + Flowbite React for UI components
-   React Hook Form for form management

------------------------------------------------------------------------

## ⚙️ How It Works

1.  User uploads a video file.
2.  User chooses the target format and applies editing options:
    -   Text overlay, filters, trimming range, etc.
3.  FFmpeg.wasm runs in the browser to process video without any server.
4.  Progress bar shows real-time progress.
5.  Download link appears after successful processing.

------------------------------------------------------------------------

## 🚧 Why Web-Based?

-   No backend needed → Everything runs in-browser.
-   User data privacy → Files are processed locally.
-   Cross-platform → Works on any modern browser.

------------------------------------------------------------------------

## 📦 Supported Formats

  Input Formats    Output Formats
  ---------------- ----------------
  MP4, WebM, AVI   MP4, WebM, AVI

------------------------------------------------------------------------

## 🚀 Run Locally

\`\`\`bash \# Install dependencies npm install

# Run development server

npm run dev \`\`\`

------------------------------------------------------------------------

## 🔔 Notes

-   For best browser playback, prefer MP4 or WebM.
-   AVI files can be downloaded but may not play in browser.
-   Processing large files may be slow due to in-browser limitations.

------------------------------------------------------------------------

Built with ❤️ by Shivain Gusain
