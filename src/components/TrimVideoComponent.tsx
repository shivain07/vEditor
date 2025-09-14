import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import "./Rangeslider.css";

import { Badge, Label } from "flowbite-react";
import { FaScissors } from "react-icons/fa6";
export default function TrimVideoComponent({
  trimRange,
  setTrimRange,
  videoDuration,
}: {
  trimRange: [number, number];
  setTrimRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  videoDuration: number;
}) {
  return (
    <>
      <div className="my-4 flex flex-col justify-center items-center">
        <Label htmlFor="range-slider" className="flex items-center gap-1 p-1">
          <Badge color="purple">Trim Video</Badge>
          <FaScissors size={12} color="red" />
        </Label>
        <RangeSlider
          id="range-slider"
          min={0}
          max={videoDuration}
          value={trimRange}
          rangeSlideDisabled={false}
          onInput={(e) => {
            setTrimRange(e);
          }}
        />
        <div className="flex gap-2">
          <Badge color="purple" size="sm">
            Start: {trimRange[0].toFixed(2)}s
          </Badge>
          <Badge color="purple" size="sm">
            End: {trimRange[1].toFixed(2)}s
          </Badge>
        </div>
      </div>
    </>
  );
}
