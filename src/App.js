import React, { useState, useRef } from "react";
import axios from "axios";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import Moon3D from "./Moon3D";

const Compass = ({ azimuth }) => {
  const rotation = typeof azimuth === "number" && !isNaN(azimuth) ? azimuth : 0;
  return (
    <div style={compassStyles.container}>
      <div style={compassStyles.compass}>
        <div style={{ ...compassStyles.direction, top: 8, left: "50%", transform: "translateX(-50%)" }}>N</div>
        <div style={{ ...compassStyles.direction, top: "50%", right: 8, transform: "translateY(-50%)" }}>E</div>
        <div style={{ ...compassStyles.direction, bottom: 8, left: "50%", transform: "translateX(-50%)" }}>S</div>
        <div style={{ ...compassStyles.direction, top: "50%", left: 8, transform: "translateY(-50%)" }}>W</div>
        <div
          style={{
            ...compassStyles.arrow,
            transform: `rotate(${rotation}deg) translateY(-40%)`,
          }}
        />
      </div>
      <p style={compassStyles.label}>Moon Direction: {rotation.toFixed(1)}°</p>
    </div>
  );
};

const compassStyles = {
  container: {
    userSelect: "none",
    marginTop: "1rem",
    textAlign: "center",
  },
  compass: {
    position: "relative",
    width: 160,
    height: 160,
    borderRadius: "50%",
    border: "4px solid #4caf50",
    backgroundColor: "#111",
    margin: "0 auto",
    boxShadow: "0 0 15px #4caf50",
  },
  direction: {
    position: "absolute",
    color: "#4caf50",
    fontWeight: "700",
    fontSize: 18,
    userSelect: "none",
  },
  arrow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 6,
    height: 70,
    backgroundColor: "#4caf50",
    transformOrigin: "bottom center",
    borderRadius: 3,
    boxShadow: "0 0 10px #4caf50",
  },
  label: {
    marginTop: 10,
    color: "#4caf50",
    fontWeight: "600",
  },
};

function App() {
  const [location, setLocation] = useState("");
  const [moonData, setMoonData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef(null);

  const fetchMoonData = async () => {
    if (!location.trim()) {
      setError("Please enter a city.");
      setMoonData(null);
      return;
    }

    setLoading(true);
    setError("");
    setMoonData(null);

    const API_KEY = "";
    const url = `https://api.ipgeolocation.io/astronomy?apiKey=${API_KEY}&location=${encodeURIComponent(location)}`;

    try {
      const response = await axios.get(url);
      setMoonData(response.data);
    } catch (err) {
      setError("Could not fetch moon data. Please check the location and try again.");
      setMoonData(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Pause music when unmounting or hiding 3D moon
  React.useEffect(() => {
    if (!show3D && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [show3D]);

  const moonAzimuth = moonData && moonData.moon_azimuth ? parseFloat(moonData.moon_azimuth) : 0;

  return (
    <div
      style={{
        ...styles.container,
        backgroundImage: `url(${process.env.PUBLIC_URL + "/bg.jpg"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Small music button at top right */}
      <button onClick={handlePlayPause} style={styles.musicButton}>
        {isPlaying ? "⏸" : "▶"}
      </button>
      <audio ref={audioRef} src={process.env.PUBLIC_URL + "/moon.mp3"} loop />

      <h1 style={styles.title}>🌙 Personalized Moon Viewing</h1>

      <div style={styles.searchBox}>
        <input
          type="text"
          placeholder="Enter city (e.g., New York)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={styles.input}
          onKeyDown={(e) => e.key === "Enter" && fetchMoonData()}
          disabled={loading}
        />
        <button onClick={fetchMoonData} style={styles.button} disabled={loading}>
          {loading ? "Loading..." : "View Moon Info"}
        </button>
        <button onClick={() => setShow3D(!show3D)} style={styles.button} disabled={loading}>
          {show3D ? "Hide 3D Moon" : "View 3D Moon"}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {moonData && (
        <div style={styles.resultsContainer}>
          <div style={styles.card}>
            <h2 style={styles.locationTitle}>
              {location}
            </h2>
            <ul style={styles.list}>
              <li>🌘 Moonrise: {moonData.moonrise || "N/A"}</li>
              <li>🌒 Moonset: {moonData.moonset || "N/A"}</li>
              <li>🌗 Moon Phase: {moonData.moon_phase || "N/A"}</li>
              <li>📍 Moon Altitude: {moonData.moon_altitude ? `${moonData.moon_altitude}°` : "N/A"}</li>
              <li>🧭 Moon Azimuth: {moonData.moon_azimuth ? `${moonData.moon_azimuth}°` : "N/A"}</li>
            </ul>
          </div>
          <Compass azimuth={moonAzimuth} />
        </div>
      )}

      {show3D && (
        <>
          <div style={{ width: "100%", height: 400, marginTop: 30 }}>
            <Canvas style={{ background: "#000" }}>
              <ambientLight intensity={1.0} />
              <directionalLight position={[5, 5, 5]} intensity={1.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />
              <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
              <Moon3D />
              <OrbitControls enableZoom={true} />
            </Canvas>
          </div>
          <p
            style={{
              color: '#fff',
              textAlign: 'center',
              marginTop: 10,
              fontSize: '1.3rem',
              fontWeight: 700,
              textShadow: '0 0 10px #4caf50, 0 0 2px #fff',
              background: 'rgba(0,0,0,0.45)',
              borderRadius: 8,
              padding: '8px 24px',
              display: 'inline-block',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            "The moon is beautiful, isn't it ?" - 1 18 25 1
          </p>
        </>
      )}

      <footer style={styles.footer}>
        Data from <a href="https://ipgeolocation.io/" target="_blank" rel="noreferrer" style={styles.link}>IP Geolocation Astronomy API</a>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#fff",
    minHeight: "100vh",
    padding: "2rem 1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    // background will be overridden inline
  },
  title: {
    fontWeight: "800",
    fontSize: "2.5rem",
    marginBottom: "1rem",
    textShadow: "0 0 10px #4caf50",
  },
  searchBox: {
    display: "flex",
    gap: 12,
    marginBottom: "1rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  input: {
    padding: "12px 16px",
    fontSize: "1.1rem",
    borderRadius: 8,
    border: "2px solid #4caf50",
    outline: "none",
    width: 280,
    backgroundColor: "#1f1f2f",
    color: "#fff",
  },
  button: {
    padding: "12px 24px",
    backgroundColor: "#4caf50",
    border: "none",
    borderRadius: 8,
    fontWeight: "700",
    fontSize: "1.1rem",
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 4px 12px #4caf50aa",
  },
  error: {
    color: "#ff5252",
    fontWeight: "600",
    marginTop: 10,
  },
  resultsContainer: {
    marginTop: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 40,
    width: "100%",
    maxWidth: 900,
  },
  card: {
    backgroundColor: "#212134",
    borderRadius: 14,
    padding: 24,
    boxShadow: "0 0 20px #4caf5055",
    flex: 1,
    minWidth: 280,
    color: "#b2b2cc",
  },
  locationTitle: {
    color: "#4caf50",
    fontWeight: "700",
    marginBottom: 12,
    fontSize: "1.8rem",
  },
  list: {
    listStyle: "none",
    paddingLeft: 0,
    fontSize: "1.1rem",
    lineHeight: 1.7,
    color: "#d6d6e7",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 30,
    fontSize: 14,
    color: "#666",
  },
  link: {
    color: "#4caf50",
    textDecoration: "none",
  },
  musicButton: {
    position: "fixed",
    top: 18,
    right: 18,
    zIndex: 1000,
    padding: "6px 12px",
    fontSize: "0.8rem",
    borderRadius: "50px",
    backgroundColor: "#232946",
    color: "#7fffbe",
    border: "2px solid #4caf50",
    boxShadow: "0 2px 8px #4caf5077",
    cursor: "pointer",
    fontWeight: 700,
    transition: "background 0.2s, color 0.2s",
    minWidth: 0,
    minHeight: 0,
    lineHeight: 1.1,
  },
};

export default App;
