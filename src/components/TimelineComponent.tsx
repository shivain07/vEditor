import {
  Button,
  Timeline,
  TimelineBody,
  TimelineContent,
  TimelineItem,
  TimelinePoint,
  TimelineTime,
  TimelineTitle,
} from "flowbite-react";
import { HiArrowNarrowRight } from "react-icons/hi";

export default function TimelineComponent() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🚀 Video Editor Project Roadmap
      </h2>

      <Timeline>
        <TimelineItem>
          <TimelinePoint />
          <TimelineContent>
            <TimelineTime>Current</TimelineTime>
            <TimelineTitle>Video Editor Feature</TimelineTitle>
            <TimelineBody>
              Convert videos to MP4, WebM, AVI format with text overlay, Basic
              filters, trimming, and download support.
            </TimelineBody>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelinePoint />
          <TimelineContent>
            <TimelineTime>Current</TimelineTime>
            <TimelineTitle>Video Converter Feature</TimelineTitle>
            <TimelineBody>
              Convert videos to "mp4", "webm", "avi", "mov", "mkv", "mp3",
              "wav", "flac", "aac", "opus", "ogg", format
            </TimelineBody>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem>
          <TimelinePoint />
          <TimelineContent>
            <TimelineTime>Future</TimelineTime>
            <TimelineTitle>Live Preview While Editing</TimelineTitle>
            <TimelineBody>
              Implement real-time video preview while seeking through the
              timeline, showing video thumbnails during scrubbing.
            </TimelineBody>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem>
          <TimelinePoint />
          <TimelineContent>
            <TimelineTime>Future</TimelineTime>
            <TimelineTitle>Crop Video Feature</TimelineTitle>
            <TimelineBody>
              Enable dynamic cropping of the video area during editing to allow
              users to select the portion of video they want.
            </TimelineBody>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem>
          <TimelinePoint />
          <TimelineContent>
            <TimelineTime>Future</TimelineTime>
            <TimelineTitle>Insert Graphics & Images</TimelineTitle>
            <TimelineBody>
              Add ability to overlay images, shapes, or custom graphics onto the
              video as part of the editing process.
            </TimelineBody>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem>
          <TimelinePoint />
          <TimelineContent>
            <TimelineTime>Future</TimelineTime>
            <TimelineTitle>Polished Error Handling</TimelineTitle>
            <TimelineBody>
              Build user-friendly error modals, auto-retry logic, clear error
              messages, and robust process monitoring.
            </TimelineBody>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  );
}
