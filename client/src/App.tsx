import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const App = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hls, setHls] = useState<Hls | null>(null);
  const [levels, setLevels] = useState<any[]>([]); // Temporarily using 'any' for levels
  const [selectedLevel, setSelectedLevel] = useState<number>(-1);

  useEffect(() => {
    if (videoRef.current) {
      const hlsInstance = new Hls();
      setHls(hlsInstance);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        setLevels(hlsInstance.levels); // Set available levels once manifest is loaded
      });

      hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        console.log(`Current resolution: ${hlsInstance.levels[data.level].height}p`);
      });

      hlsInstance.loadSource("http://localhost:3000/master.m3u8");
      hlsInstance.attachMedia(videoRef.current);

      return () => {
        hlsInstance.destroy(); // Cleanup on unmount
      };
    }
  }, []);

  const handlePlay = () => {
    videoRef.current?.play().catch((error) => {
      console.error("Failed to play:", error);
    });
  };

  const handleResolutionChange = (levelIndex: number) => {
    if (hls) {
      hls.currentLevel = levelIndex;
      setSelectedLevel(levelIndex);
    }
  };

  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <video
        ref={videoRef}
        controls
        onClick={handlePlay}
        style={{
          width: "100%",
          maxWidth: "360px",
          height: "640px",
          borderRadius: "10px",
          backgroundColor: "#000",
          objectFit: "fill",
        }}
      />

      {/* Resolution Selector Icon positioned in the top right corner */}
      <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 10 }}>
        <select
          value={selectedLevel}
          onChange={(e) => handleResolutionChange(parseInt(e.target.value))}
          style={{
            padding: "5px",
            background: "rgba(0, 0, 0, 0.5)",
            color: "white",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          <option value="-1">Auto</option>
          {levels.map((level, index) => (
            <option key={index} value={index}>
              {level.height}p
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default App;
