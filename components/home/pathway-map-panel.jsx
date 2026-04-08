"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

const FEATURED_ORIGINS = [
  { label: "Colombo, Sri Lanka", country: "Sri Lanka", lat: 6.9271, lng: 79.8612 },
  { label: "Kandy, Sri Lanka", country: "Sri Lanka", lat: 7.2906, lng: 80.6337 },
  { label: "Dubai, United Arab Emirates", country: "United Arab Emirates", lat: 25.2048, lng: 55.2708 },
  { label: "London, United Kingdom", country: "United Kingdom", lat: 51.5072, lng: -0.1276 },
  { label: "Toronto, Canada", country: "Canada", lat: 43.6532, lng: -79.3832 },
];

const AUSTRALIA_UNIVERSITIES = [
  {
    label: "University of Queensland (Brisbane)",
    type: "University",
    country: "Australia",
    lat: -27.4975,
    lng: 153.0137,
    detail: "Brisbane education pathway with strong student support ecosystems.",
  },
  {
    label: "University of Melbourne (Melbourne)",
    type: "University",
    country: "Australia",
    lat: -37.7963,
    lng: 144.9614,
    detail: "Melbourne route with major graduate and professional migration pipelines.",
  },
  {
    label: "UNSW Sydney (Sydney)",
    type: "University",
    country: "Australia",
    lat: -33.9173,
    lng: 151.2313,
    detail: "Sydney track for higher education and skilled career transitions.",
  },
  {
    label: "Monash University (Melbourne)",
    type: "University",
    country: "Australia",
    lat: -37.9105,
    lng: 145.1364,
    detail: "Major research university with diverse international intake pathways.",
  },
  {
    label: "Australian National University (Canberra)",
    country: "Australia",
    type: "University",
    lat: -35.2777,
    lng: 149.1185,
    detail: "National university pathway in Canberra with broad research programs.",
  },
  {
    label: "University of Sydney (Sydney)",
    country: "Australia",
    type: "University",
    lat: -33.8886,
    lng: 151.1873,
    detail: "Sydney-based university with major international student pathways.",
  },
  {
    label: "University of New South Wales (Sydney)",
    country: "Australia",
    type: "University",
    lat: -33.9173,
    lng: 151.2313,
    detail: "Leading Sydney university for engineering, technology, and business.",
  },
  {
    label: "University of Adelaide (Adelaide)",
    country: "Australia",
    type: "University",
    lat: -34.9196,
    lng: 138.6051,
    detail: "South Australia university pathway with strong research and coursework options.",
  },
  {
    label: "University of Western Australia (Perth)",
    country: "Australia",
    type: "University",
    lat: -31.9803,
    lng: 115.8175,
    detail: "Perth-based university route for undergraduate and postgraduate programs.",
  },
  {
    label: "University of Technology Sydney (Sydney)",
    country: "Australia",
    type: "University",
    lat: -33.8837,
    lng: 151.2006,
    detail: "Applied and industry-linked study pathway in Sydney.",
  },
  {
    label: "RMIT University (Melbourne)",
    country: "Australia",
    type: "University",
    lat: -37.808,
    lng: 144.963,
    detail: "Melbourne urban-campus university with strong international enrolments.",
  },
  {
    label: "Queensland University of Technology (Brisbane)",
    country: "Australia",
    type: "University",
    lat: -27.4778,
    lng: 153.0281,
    detail: "Brisbane university pathway focused on practical and professional courses.",
  },
  {
    label: "Macquarie University (Sydney)",
    country: "Australia",
    type: "University",
    lat: -33.7751,
    lng: 151.1126,
    detail: "Sydney north corridor university with broad international programs.",
  },
  {
    label: "Deakin University (Melbourne)",
    country: "Australia",
    type: "University",
    lat: -37.8461,
    lng: 145.1142,
    detail: "Melbourne and regional Victoria university pathway options.",
  },
  {
    label: "Griffith University (Brisbane/Gold Coast)",
    country: "Australia",
    type: "University",
    lat: -27.9632,
    lng: 153.3854,
    detail: "Queensland university network across Brisbane and Gold Coast campuses.",
  },
  {
    label: "Curtin University (Perth)",
    country: "Australia",
    type: "University",
    lat: -32.0061,
    lng: 115.8949,
    detail: "Perth university with engineering, business, and health pathways.",
  },
  {
    label: "La Trobe University (Melbourne)",
    country: "Australia",
    type: "University",
    lat: -37.7205,
    lng: 145.0455,
    detail: "Melbourne-based university with multi-campus study options.",
  },
  {
    label: "University of Newcastle (Newcastle)",
    country: "Australia",
    type: "University",
    lat: -32.8936,
    lng: 151.7043,
    detail: "New South Wales regional-city university route.",
  },
  {
    label: "University of Wollongong (Wollongong)",
    country: "Australia",
    type: "University",
    lat: -34.405,
    lng: 150.8781,
    detail: "Coastal NSW university with international student programs.",
  },
  {
    label: "Western Sydney University (Sydney)",
    country: "Australia",
    type: "University",
    lat: -33.7522,
    lng: 150.6942,
    detail: "Greater Sydney multi-campus university pathway.",
  },
  {
    label: "Swinburne University of Technology (Melbourne)",
    country: "Australia",
    type: "University",
    lat: -37.822,
    lng: 145.0389,
    detail: "Technology-focused Melbourne university pathway.",
  },
  {
    label: "University of South Australia (Adelaide)",
    country: "Australia",
    type: "University",
    lat: -34.921,
    lng: 138.6062,
    detail: "Adelaide university route with practical and professional programs.",
  },
  {
    label: "Flinders University (Adelaide)",
    country: "Australia",
    type: "University",
    lat: -35.0224,
    lng: 138.5711,
    detail: "South Australia university with health and science pathways.",
  },
  {
    label: "James Cook University (Townsville)",
    country: "Australia",
    type: "University",
    lat: -19.3277,
    lng: 146.7576,
    detail: "North Queensland university with tropical-region specialisations.",
  },
  {
    label: "University of Tasmania (Hobart)",
    country: "Australia",
    type: "University",
    lat: -42.9038,
    lng: 147.3246,
    detail: "Tasmania university pathway with Hobart and Launceston options.",
  },
  {
    label: "Charles Darwin University (Darwin)",
    country: "Australia",
    type: "University",
    lat: -12.372,
    lng: 130.869,
    detail: "Northern Territory university route with regional study opportunities.",
  },
  {
    label: "University of Canberra (Canberra)",
    country: "Australia",
    type: "University",
    lat: -35.238,
    lng: 149.084,
    detail: "ACT university pathway in Canberra.",
  },
  {
    label: "Bond University (Gold Coast)",
    country: "Australia",
    type: "University",
    lat: -28.0765,
    lng: 153.4165,
    detail: "Private university pathway on the Gold Coast.",
  },
  {
    label: "University of the Sunshine Coast (Sunshine Coast)",
    country: "Australia",
    type: "University",
    lat: -26.715,
    lng: 153.06,
    detail: "Queensland university route for regional-coastal study planning.",
  },
  {
    label: "Southern Cross University (Gold Coast/Lismore)",
    country: "Australia",
    type: "University",
    lat: -28.1656,
    lng: 153.5051,
    detail: "Cross-border NSW/QLD university pathway options.",
  },
  {
    label: "Victoria University (Melbourne)",
    country: "Australia",
    type: "University",
    lat: -37.7936,
    lng: 144.8979,
    detail: "Melbourne west university route with broad applied programs.",
  },
  {
    label: "Murdoch University (Perth)",
    country: "Australia",
    type: "University",
    lat: -32.0667,
    lng: 115.834,
    detail: "Perth university pathway with international student options.",
  },
  {
    label: "Edith Cowan University (Perth)",
    country: "Australia",
    type: "University",
    lat: -31.8944,
    lng: 115.8944,
    detail: "Western Australia university route for practical and professional fields.",
  },
  {
    label: "University of Notre Dame Australia (Fremantle/Sydney)",
    country: "Australia",
    type: "University",
    lat: -32.0555,
    lng: 115.7459,
    detail: "Private Australian university pathway with multiple campuses.",
  },
  {
    label: "Australian Catholic University (Melbourne)",
    country: "Australia",
    type: "University",
    lat: -37.7941,
    lng: 144.9597,
    detail: "National private university with campuses across Australia.",
  },
  {
    label: "Federation University Australia (Ballarat)",
    country: "Australia",
    type: "University",
    lat: -37.6289,
    lng: 143.8869,
    detail: "Regional Victoria university pathway with practical study routes.",
  },
  {
    label: "Charles Sturt University (Bathurst)",
    country: "Australia",
    type: "University",
    lat: -33.4154,
    lng: 149.5335,
    detail: "Regional NSW university with distributed campus options.",
  },
  {
    label: "University of New England (Armidale)",
    country: "Australia",
    type: "University",
    lat: -30.4866,
    lng: 151.6395,
    detail: "Regional university route in northern New South Wales.",
  },
  {
    label: "CQUniversity (Rockhampton)",
    country: "Australia",
    type: "University",
    lat: -23.3803,
    lng: 150.5059,
    detail: "Multi-campus central Queensland university pathway.",
  },
  {
    label: "University of Southern Queensland (Toowoomba)",
    country: "Australia",
    type: "University",
    lat: -27.56,
    lng: 151.95,
    detail: "Regional Queensland university route with flexible study options.",
  },
  {
    label: "Avondale University (Cooranbong)",
    country: "Australia",
    type: "University",
    lat: -33.0791,
    lng: 151.457,
    detail: "Private university pathway in New South Wales.",
  },
  {
    label: "Torrens University Australia (Adelaide/Sydney/Melbourne)",
    country: "Australia",
    type: "University",
    lat: -34.9228,
    lng: 138.5999,
    detail: "Private multi-city university pathway in Australia.",
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

function normalizeGoalQuery(raw) {
  return String(raw || "")
    .split(" — ")[0]
    .trim()
    .toLowerCase();
}

export function PathwayMapPanel() {
  const [fromQuery, setFromQuery] = useState("Kandy, Sri Lanka");
  const [goalQuery, setGoalQuery] = useState("University of Queensland (Brisbane)");
  const [fromOpen, setFromOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [fromActiveIndex, setFromActiveIndex] = useState(-1);
  const [goalActiveIndex, setGoalActiveIndex] = useState(-1);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [originSuggestions, setOriginSuggestions] = useState(FEATURED_ORIGINS);
  const [originLoading, setOriginLoading] = useState(false);
  const [originFetchError, setOriginFetchError] = useState("");
  const mapRef = useRef(null);
  const mapNodeRef = useRef(null);
  const overlaysRef = useRef({ fromMarker: null, toMarker: null, line: null });

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const city = originSuggestions[0] || FEATURED_ORIGINS[0];
  const goalSearch = normalizeGoalQuery(goalQuery);
  const goal =
    AUSTRALIA_UNIVERSITIES.find((item) => item.label.toLowerCase() === goalSearch) ||
    AUSTRALIA_UNIVERSITIES.find((item) => item.label.toLowerCase().includes(goalSearch)) ||
    AUSTRALIA_UNIVERSITIES[0];
  const goalHint = `${goal.type} · ${goal.country}`;
  const fromFiltered = originSuggestions;
  const goalFiltered = useMemo(() => {
    const q = normalizeGoalQuery(goalQuery);
    if (!q) return AUSTRALIA_UNIVERSITIES.slice(0, 8);
    return AUSTRALIA_UNIVERSITIES.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.country.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [goalQuery]);

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

  useEffect(() => {
    setFromActiveIndex(fromFiltered.length ? 0 : -1);
  }, [fromFiltered.length, fromOpen]);

  useEffect(() => {
    setGoalActiveIndex(goalFiltered.length ? 0 : -1);
  }, [goalFiltered.length, goalOpen]);

  useEffect(() => {
    const query = fromQuery.trim();
    if (query.length < 2) {
      setOriginFetchError("");
      setOriginLoading(false);
      setOriginSuggestions(FEATURED_ORIGINS);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setOriginLoading(true);
      setOriginFetchError("");
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&addressdetails=1&q=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("city_search_failed");
        const data = await response.json();
        const cities = (Array.isArray(data) ? data : [])
          .map((item) => {
            const address = item.address || {};
            const country = String(address.country || "").trim();
            const name =
              address.city ||
              address.town ||
              address.village ||
              address.municipality ||
              address.county ||
              String(item.name || "").trim();
            if (!name || !country) return null;
            const lat = Number(item.lat);
            const lng = Number(item.lon);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
            return {
              label: `${name}, ${country}`,
              country,
              lat,
              lng,
            };
          })
          .filter(Boolean);

        const deduped = cities.filter(
          (item, index) => cities.findIndex((x) => x.label.toLowerCase() === item.label.toLowerCase()) === index
        );
        setOriginSuggestions(deduped.length ? deduped : []);
      } catch {
        if (!controller.signal.aborted) {
          setOriginSuggestions([]);
          setOriginFetchError("Could not load global city suggestions. Try another search term.");
        }
      } finally {
        if (!controller.signal.aborted) setOriginLoading(false);
      }
    }, 260);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [fromQuery]);

  function chooseFrom(item) {
    setFromQuery(item.label);
    setOriginSuggestions([item, ...FEATURED_ORIGINS].slice(0, 8));
    setFromOpen(false);
  }

  function chooseGoal(item) {
    setGoalQuery(item.label);
    setGoalOpen(false);
  }

  function handleFromKeyDown(event) {
    if (!fromOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setFromOpen(true);
      return;
    }
    if (!fromOpen) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFromActiveIndex((current) => (fromFiltered.length ? (current + 1) % fromFiltered.length : -1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFromActiveIndex((current) =>
        fromFiltered.length ? (current - 1 + fromFiltered.length) % fromFiltered.length : -1
      );
    } else if (event.key === "Enter") {
      if (fromActiveIndex >= 0 && fromFiltered[fromActiveIndex]) {
        event.preventDefault();
        chooseFrom(fromFiltered[fromActiveIndex]);
      }
    } else if (event.key === "Escape") {
      setFromOpen(false);
    }
  }

  function handleGoalKeyDown(event) {
    if (!goalOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setGoalOpen(true);
      return;
    }
    if (!goalOpen) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setGoalActiveIndex((current) => (goalFiltered.length ? (current + 1) % goalFiltered.length : -1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setGoalActiveIndex((current) =>
        goalFiltered.length ? (current - 1 + goalFiltered.length) % goalFiltered.length : -1
      );
    } else if (event.key === "Enter") {
      if (goalActiveIndex >= 0 && goalFiltered[goalActiveIndex]) {
        event.preventDefault();
        chooseGoal(goalFiltered[goalActiveIndex]);
      }
    } else if (event.key === "Escape") {
      setGoalOpen(false);
    }
  }

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
              value={fromQuery}
              onChange={(e) => {
                setFromQuery(e.target.value);
                setFromOpen(true);
              }}
              onFocus={() => setFromOpen(true)}
              onBlur={() => setTimeout(() => setFromOpen(false), 120)}
              onKeyDown={handleFromKeyDown}
              placeholder="Search any city worldwide"
              aria-label="Search worldwide start city"
              aria-expanded={fromOpen ? "true" : "false"}
            />
            {fromOpen && fromFiltered.length ? (
              <div className="pathway-map__suggestions" role="listbox" aria-label="Start city suggestions">
                {fromFiltered.map((item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    className={`pathway-map__suggestion ${index === fromActiveIndex ? "is-active" : ""}`}
                    onMouseDown={() => chooseFrom(item)}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.country}</span>
                  </button>
                ))}
              </div>
            ) : null}
            {fromOpen && originLoading ? (
              <p className="pathway-map__no-match" role="status">
                Searching worldwide cities...
              </p>
            ) : null}
            {fromOpen && fromQuery.trim() && !fromFiltered.length ? (
              <p className="pathway-map__no-match" role="status">
                No match found for start city. Try city or country name.
              </p>
            ) : null}
            {fromOpen && originFetchError ? (
              <p className="pathway-map__no-match" role="status">
                {originFetchError}
              </p>
            ) : null}
          </label>
          <label>
            Destination (Australian universities only)
            <input
              type="search"
              value={goalQuery}
              onChange={(e) => {
                setGoalQuery(e.target.value);
                setGoalOpen(true);
              }}
              onFocus={() => setGoalOpen(true)}
              onBlur={() => setTimeout(() => setGoalOpen(false), 120)}
              onKeyDown={handleGoalKeyDown}
              placeholder="Search Australian university"
              aria-label="Search Australian university destination"
              aria-expanded={goalOpen ? "true" : "false"}
            />
            {goalOpen && goalFiltered.length ? (
              <div className="pathway-map__suggestions" role="listbox" aria-label="Destination suggestions">
                {goalFiltered.map((item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    className={`pathway-map__suggestion ${index === goalActiveIndex ? "is-active" : ""}`}
                    onMouseDown={() => chooseGoal(item)}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.country}</span>
                  </button>
                ))}
              </div>
            ) : null}
            {goalOpen && goalQuery.trim() && !goalFiltered.length ? (
              <p className="pathway-map__no-match" role="status">
                No match found. Try university, college, pathway type, city, or country.
              </p>
            ) : null}
          </label>
          <p>
            Selected destination type: <strong>{goalHint}</strong>
          </p>
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
