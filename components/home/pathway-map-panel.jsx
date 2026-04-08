"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

const WORLD_ORIGINS = [
  { label: "Colombo, Sri Lanka", lat: 6.9271, lng: 79.8612 },
  { label: "Kandy, Sri Lanka", lat: 7.2906, lng: 80.6337 },
  { label: "Dubai, UAE", lat: 25.2048, lng: 55.2708 },
  { label: "Doha, Qatar", lat: 25.2854, lng: 51.531 },
  { label: "New Delhi, India", lat: 28.6139, lng: 77.209 },
  { label: "Mumbai, India", lat: 19.076, lng: 72.8777 },
  { label: "Singapore", lat: 1.3521, lng: 103.8198 },
  { label: "Kuala Lumpur, Malaysia", lat: 3.139, lng: 101.6869 },
  { label: "London, UK", lat: 51.5072, lng: -0.1276 },
  { label: "Toronto, Canada", lat: 43.6532, lng: -79.3832 },
  { label: "Auckland, New Zealand", lat: -36.8509, lng: 174.7645 },
  { label: "Nairobi, Kenya", lat: -1.2864, lng: 36.8172 },
  { label: "Lagos, Nigeria", lat: 6.5244, lng: 3.3792 },
  { label: "São Paulo, Brazil", lat: -23.5505, lng: -46.6333 },
  { label: "Berlin, Germany", lat: 52.52, lng: 13.405 },
];

const WORLD_DESTINATIONS = [
  {
    label: "University of Queensland (Brisbane)",
    lat: -27.4975,
    lng: 153.0137,
    detail: "Brisbane education pathway with strong student support ecosystems.",
  },
  {
    label: "University of Melbourne (Melbourne)",
    lat: -37.7963,
    lng: 144.9614,
    detail: "Melbourne route with major graduate and professional migration pipelines.",
  },
  {
    label: "UNSW Sydney (Sydney)",
    lat: -33.9173,
    lng: 151.2313,
    detail: "Sydney track for higher education and skilled career transitions.",
  },
  {
    label: "Monash University (Melbourne)",
    lat: -37.9105,
    lng: 145.1364,
    detail: "Major research university with diverse international intake pathways.",
  },
  {
    label: "University of Toronto (Toronto)",
    lat: 43.6629,
    lng: -79.3957,
    detail: "Canada destination for advanced study and long-term skilled planning.",
  },
  {
    label: "University of British Columbia (Vancouver)",
    lat: 49.2606,
    lng: -123.246,
    detail: "Strong west-coast study pathway with post-study planning potential.",
  },
  {
    label: "University of Auckland (Auckland)",
    lat: -36.8523,
    lng: 174.7682,
    detail: "New Zealand education route with structured study-to-work planning.",
  },
  {
    label: "University of Manchester (Manchester)",
    lat: 53.4668,
    lng: -2.2339,
    detail: "UK higher education option with diverse postgraduate pathways.",
  },
  {
    label: "University of California, Berkeley (California)",
    lat: 37.8719,
    lng: -122.2585,
    detail: "US destination often chosen for graduate and research-focused tracks.",
  },
  {
    label: "NUS (Singapore)",
    lat: 1.2966,
    lng: 103.7764,
    detail: "Singapore destination with strong regional career mobility outcomes.",
  },
  {
    label: "ETH Zurich (Zurich)",
    lat: 47.3763,
    lng: 8.548,
    detail: "European technical education destination for high-skill profiles.",
  },
  {
    label: "Adelaide Skilled Migration Pathway",
    city: "Adelaide",
    lat: -34.9285,
    lng: 138.6007,
    detail: "Regional-skilled focused pathway for long-term settlement planning.",
  },
  {
    label: "Toronto Skilled Migration Pathway",
    city: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    detail: "Ontario-focused skilled migration planning pathway.",
  },
  {
    label: "London Skilled Worker Pathway",
    city: "London",
    lat: 51.5072,
    lng: -0.1276,
    detail: "UK skilled worker route planning with sponsor readiness emphasis.",
  },
];

function haversineKm(from, to) {
  const R = 6371;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
}

export function PathwayMapPanel() {
  const [fromQuery, setFromQuery] = useState("Kandy, Sri Lanka");
  const [goalQuery, setGoalQuery] = useState("University of Queensland (Brisbane)");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const mapRef = useRef(null);
  const mapNodeRef = useRef(null);
  const overlaysRef = useRef({ fromMarker: null, toMarker: null, line: null });

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const city =
    WORLD_ORIGINS.find((item) => item.label.toLowerCase() === fromQuery.trim().toLowerCase()) ||
    WORLD_ORIGINS.find((item) => item.label.toLowerCase().includes(fromQuery.trim().toLowerCase())) ||
    WORLD_ORIGINS[0];
  const goal =
    WORLD_DESTINATIONS.find((item) => item.label.toLowerCase() === goalQuery.trim().toLowerCase()) ||
    WORLD_DESTINATIONS.find((item) => item.label.toLowerCase().includes(goalQuery.trim().toLowerCase())) ||
    WORLD_DESTINATIONS[0];

  const distanceKm = useMemo(() => haversineKm(city, goal), [city, goal]);
  const estFlightHours = useMemo(() => Math.max(9, Math.round(distanceKm / 850)), [distanceKm]);

  useEffect(() => {
    if (!mapsKey) {
      setError("Map preview is unavailable right now.");
      return;
    }
    if (window.google?.maps) {
      setReady(true);
      return;
    }
    const id = "minrosh-google-maps-script";
    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(mapsKey)}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    const onLoad = () => setReady(true);
    const onError = () => setError("Could not load pathway map.");
    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);
    return () => {
      script?.removeEventListener("load", onLoad);
      script?.removeEventListener("error", onError);
    };
  }, [mapsKey]);

  useEffect(() => {
    if (!ready || !mapNodeRef.current || !window.google?.maps) return;
    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(mapNodeRef.current, {
        center: { lat: 0, lng: 112 },
        zoom: 3,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
    }
    const map = mapRef.current;
    const from = { lat: city.lat, lng: city.lng };
    const to = { lat: goal.lat, lng: goal.lng };

    overlaysRef.current.fromMarker?.setMap(null);
    overlaysRef.current.toMarker?.setMap(null);
    overlaysRef.current.line?.setMap(null);

    overlaysRef.current.fromMarker = new window.google.maps.Marker({
      position: from,
      map,
      title: city.label,
    });
    overlaysRef.current.toMarker = new window.google.maps.Marker({
      position: to,
      map,
      title: goal.label,
    });
    overlaysRef.current.line = new window.google.maps.Polyline({
      path: [from, to],
      geodesic: true,
      strokeColor: "#5b2a4a",
      strokeOpacity: 0.9,
      strokeWeight: 3,
      map,
    });

    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(from);
    bounds.extend(to);
    map.fitBounds(bounds, 120);
  }, [ready, city, goal]);

  return (
    <section className="pathway-map editorial-section editorial-section--compact">
      <div className="section-head">
        <div>
          <p className="section-label">Global Pathway Map</p>
          <h2>Make your migration pathway feel real before you lodge.</h2>
        </div>
      </div>
      <div className="pathway-map__grid">
        <div className="pathway-map__panel bento-hover">
          <label>
            Start city (worldwide)
            <input
              type="search"
              list="pathway-from-cities"
              value={fromQuery}
              onChange={(e) => setFromQuery(e.target.value)}
              placeholder="Search city (e.g. Colombo, Dubai, London)"
            />
            <datalist id="pathway-from-cities">
              {WORLD_ORIGINS.map((item) => (
                <option key={item.label} value={item.label} />
              ))}
            </datalist>
          </label>
          <label>
            Destination (universities, colleges, and skilled pathways)
            <input
              type="search"
              list="pathway-goals"
              value={goalQuery}
              onChange={(e) => setGoalQuery(e.target.value)}
              placeholder="Search destination or institution"
            />
            <datalist id="pathway-goals">
              {WORLD_DESTINATIONS.map((item) => (
                <option key={item.label} value={item.label} />
              ))}
            </datalist>
          </label>
          <p>
            Approx route distance: <strong>{distanceKm.toLocaleString()} km</strong>
          </p>
          <p>
            Typical total flight duration: <strong>{estFlightHours} to {estFlightHours + 3} hours</strong>
          </p>
          <p>{goal.detail}</p>
          <Link
            href={`/book-consultation?fromCity=${encodeURIComponent(city.label)}&pathwayGoal=${encodeURIComponent(goal.label)}`}
            className="btn btn-primary"
          >
            Book a consultation for this pathway
          </Link>
        </div>
        <div className="pathway-map__canvas bento-hover">
          {error ? <p className="pathway-map__fallback">{error}</p> : <div ref={mapNodeRef} className="pathway-map__map" />}
        </div>
      </div>
    </section>
  );
}
