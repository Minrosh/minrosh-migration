"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

const SRI_LANKA_CITIES = [
  { label: "Colombo", lat: 6.9271, lng: 79.8612 },
  { label: "Kandy", lat: 7.2906, lng: 80.6337 },
  { label: "Galle", lat: 6.0535, lng: 80.221 },
  { label: "Jaffna", lat: 9.6615, lng: 80.0255 },
  { label: "Kurunegala", lat: 7.4863, lng: 80.3623 },
];

const AUSTRALIA_GOALS = [
  {
    label: "University of Queensland (Brisbane)",
    city: "Brisbane",
    lat: -27.4975,
    lng: 153.0137,
    community: "Sunnybank, Mount Gravatt, and Eight Mile Plains have active Sri Lankan communities.",
  },
  {
    label: "University of Melbourne (Melbourne)",
    city: "Melbourne",
    lat: -37.7963,
    lng: 144.9614,
    community: "Point Cook, Glen Waverley, and Dandenong connect many Sri Lankan families and students.",
  },
  {
    label: "UNSW Sydney (Sydney)",
    city: "Sydney",
    lat: -33.9173,
    lng: 151.2313,
    community: "Parramatta, Toongabbie, and Homebush host vibrant Sri Lankan community networks.",
  },
  {
    label: "Adelaide Skilled Migration Pathway",
    city: "Adelaide",
    lat: -34.9285,
    lng: 138.6007,
    community: "Mawson Lakes and Salisbury are common hubs for new migrant families.",
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
  const [cityIndex, setCityIndex] = useState(1);
  const [goalIndex, setGoalIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const mapRef = useRef(null);
  const mapNodeRef = useRef(null);
  const overlaysRef = useRef({ fromMarker: null, toMarker: null, line: null });

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const city = SRI_LANKA_CITIES[cityIndex] || SRI_LANKA_CITIES[0];
  const goal = AUSTRALIA_GOALS[goalIndex] || AUSTRALIA_GOALS[0];

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
      title: `${city.label}, Sri Lanka`,
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
          <p className="section-label">Sri Lanka to Australia Pathway Map</p>
          <h2>Make your migration pathway feel real before you lodge.</h2>
        </div>
      </div>
      <div className="pathway-map__grid">
        <div className="pathway-map__panel bento-hover">
          <label>
            Start city in Sri Lanka
            <select value={cityIndex} onChange={(e) => setCityIndex(Number(e.target.value))}>
              {SRI_LANKA_CITIES.map((item, i) => (
                <option key={item.label} value={i}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Goal in Australia
            <select value={goalIndex} onChange={(e) => setGoalIndex(Number(e.target.value))}>
              {AUSTRALIA_GOALS.map((item, i) => (
                <option key={item.label} value={i}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <p>
            Approx route distance: <strong>{distanceKm.toLocaleString()} km</strong>
          </p>
          <p>
            Typical total flight duration: <strong>{estFlightHours} to {estFlightHours + 3} hours</strong>
          </p>
          <p>{goal.community}</p>
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
