"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
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
    label: "UNSW Brisbane (Brisbane)",
    type: "University",
    country: "Australia",
    lat: -33.9173,
    lng: 151.2313,
    detail: "Brisbane track for higher education and skilled career transitions.",
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
    label: "University of Brisbane (Brisbane)",
    country: "Australia",
    type: "University",
    lat: -33.8886,
    lng: 151.1873,
    detail: "Brisbane-based university with major international student pathways.",
  },
  {
    label: "University of New South Wales (Brisbane)",
    country: "Australia",
    type: "University",
    lat: -33.9173,
    lng: 151.2313,
    detail: "Leading Brisbane university for engineering, technology, and business.",
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
    label: "University of Technology Brisbane (Brisbane)",
    country: "Australia",
    type: "University",
    lat: -33.8837,
    lng: 151.2006,
    detail: "Applied and industry-linked study pathway in Brisbane.",
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
    label: "Macquarie University (Brisbane)",
    country: "Australia",
    type: "University",
    lat: -33.7751,
    lng: 151.1126,
    detail: "Brisbane north corridor university with broad international programs.",
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
    label: "Western Brisbane University (Brisbane)",
    country: "Australia",
    type: "University",
    lat: -33.7522,
    lng: 150.6942,
    detail: "Greater Brisbane multi-campus university pathway.",
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
    label: "University of Notre Dame Australia (Fremantle/Brisbane)",
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
    label: "Torrens University Australia (Adelaide/Brisbane/Melbourne)",
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

/** Light map skin aligned with MinRosh cream / plum. */
const PATHWAY_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#fbf8f4" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5f5560" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#fbf8f4" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#e6d9d9" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#dbeafe" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#e6d9d9" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e8f0e4" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

const PATHWAY_INTENTS = [
  { id: "explore", label: "Explore", hint: "Full destination list" },
  { id: "student", label: "Student", hint: "Study-led destinations" },
  { id: "skilled", label: "Skilled", hint: "Major hubs & careers" },
  { id: "partner", label: "Partner", hint: "Capital & regional cities" },
  { id: "employer", label: "Employer", hint: "Large employment centres" },
];

const ROUTE_SCENARIOS = [
  {
    id: "student-pr",
    label: "Student → PR",
    nodes: ["Visa 500", "Graduate stage", "Skilled/nomination", "PR lodge"],
  },
  {
    id: "skilled-direct",
    label: "Skilled direct",
    nodes: ["Skills assessment", "EOI", "Invitation", "Visa grant"],
  },
  {
    id: "employer-pr",
    label: "Employer → PR",
    nodes: ["Sponsor role", "SID stream", "Work stage", "PR conversion"],
  },
];

function universitiesForIntent(intentId) {
  if (intentId === "explore" || intentId === "student") return AUSTRALIA_UNIVERSITIES;
  const metro = /(Brisbane|Melbourne|Perth|Adelaide|Canberra)/i;
  if (intentId === "employer") {
    return AUSTRALIA_UNIVERSITIES.filter((u) => metro.test(u.label));
  }
  if (intentId === "skilled") {
    return AUSTRALIA_UNIVERSITIES.filter(
      (u) => metro.test(u.label) || /technology|engineering|business|RMIT|UNSW|UTS|Swinburne|QUT/i.test(u.label)
    );
  }
  if (intentId === "partner") {
    return AUSTRALIA_UNIVERSITIES.filter(
      (u) =>
        metro.test(u.label) ||
        /(Gold Coast|Newcastle|Wollongong|Darwin|Hobart|Townsville|Sunshine Coast|Toowoomba|Ballarat)/i.test(
          u.label
        )
    );
  }
  return AUSTRALIA_UNIVERSITIES;
}

const FROM_PRESETS = FEATURED_ORIGINS.slice(0, 4);
const GOAL_PRESETS = [
  AUSTRALIA_UNIVERSITIES[0],
  AUSTRALIA_UNIVERSITIES[1],
  AUSTRALIA_UNIVERSITIES[2],
  AUSTRALIA_UNIVERSITIES[5],
  AUSTRALIA_UNIVERSITIES[7],
  AUSTRALIA_UNIVERSITIES[8],
];

export function PathwayMapPanel() {
  const fromListboxId = useId();
  const goalListboxId = useId();
  const sectionRef = useRef(null);
  const [fromQuery, setFromQuery] = useState("Kandy, Sri Lanka");
  const [goalQuery, setGoalQuery] = useState("University of Queensland (Brisbane)");
  const [pathwayIntent, setPathwayIntent] = useState("explore");
  const [mapSectionInView, setMapSectionInView] = useState(false);
  const [fromOpen, setFromOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [scenarioId, setScenarioId] = useState(ROUTE_SCENARIOS[0].id);
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

  const intentPool = useMemo(() => universitiesForIntent(pathwayIntent), [pathwayIntent]);

  const resolvedOrigin = useMemo(() => {
    const trimmed = fromQuery.trim();
    if (!trimmed) return FEATURED_ORIGINS[0];
    const pool = [...originSuggestions, ...FEATURED_ORIGINS];
    const exact = pool.find((x) => x.label === trimmed);
    if (exact) return exact;
    const ci = pool.find((x) => x.label.toLowerCase() === trimmed.toLowerCase());
    if (ci) return ci;
    return originSuggestions[0] || FEATURED_ORIGINS[0];
  }, [fromQuery, originSuggestions]);

  const goalSearch = normalizeGoalQuery(goalQuery);
  const goal =
    intentPool.find((item) => item.label.toLowerCase() === goalSearch) ||
    intentPool.find((item) => item.label.toLowerCase().includes(goalSearch)) ||
    intentPool[0] ||
    AUSTRALIA_UNIVERSITIES[0];
  const goalHint = `${goal.type} · ${goal.country}`;
  const fromFiltered = originSuggestions;
  const goalFiltered = useMemo(() => {
    const q = normalizeGoalQuery(goalQuery);
    if (!q) return intentPool.slice(0, 8);
    return intentPool
      .filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.country.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [goalQuery, intentPool]);

  const visibleGoalPresets = useMemo(
    () => GOAL_PRESETS.filter((g) => intentPool.some((p) => p.label === g.label)),
    [intentPool]
  );

  const distanceKm = useMemo(() => haversineKm(resolvedOrigin, goal), [resolvedOrigin, goal]);
  const estFlightHours = useMemo(() => Math.max(9, Math.round(distanceKm / 850)), [distanceKm]);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root || typeof IntersectionObserver === "undefined") {
      setMapSectionInView(true);
      return;
    }
    if (typeof window !== "undefined") {
      const rect = root.getBoundingClientRect();
      if (rect.top < window.innerHeight + 240) setMapSectionInView(true);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setMapSectionInView(true);
      },
      { rootMargin: "240px 0px", threshold: 0.02 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!mapsKey) {
      setError("Map preview is unavailable right now.");
      return;
    }
    if (!mapSectionInView) return;
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
  }, [mapsKey, mapSectionInView]);

  useEffect(() => {
    if (!intentPool.length) return;
    setGoalQuery((current) => {
      const t = current.trim();
      if (intentPool.some((u) => u.label === t)) return current;
      return intentPool[0].label;
    });
  }, [pathwayIntent, intentPool]);

  useEffect(() => {
    if (!ready || !mapNodeRef.current || !window.google?.maps) return;
    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(mapNodeRef.current, {
        center: { lat: 0, lng: 112 },
        zoom: 3,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: PATHWAY_MAP_STYLE,
        backgroundColor: "#fbf8f4",
      });
    }
    const map = mapRef.current;
    map.setOptions({ styles: PATHWAY_MAP_STYLE });
    const from = { lat: resolvedOrigin.lat, lng: resolvedOrigin.lng };
    const to = { lat: goal.lat, lng: goal.lng };

    const g = window.google.maps;
    const pin = (fill) => ({
      path: g.SymbolPath.CIRCLE,
      scale: 9,
      fillColor: fill,
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    });

    overlaysRef.current.fromMarker?.setMap(null);
    overlaysRef.current.toMarker?.setMap(null);
    overlaysRef.current.line?.setMap(null);

    overlaysRef.current.fromMarker = new g.Marker({
      position: from,
      map,
      title: resolvedOrigin.label,
      icon: pin("#5b2a4a"),
    });
    overlaysRef.current.toMarker = new g.Marker({
      position: to,
      map,
      title: goal.label,
      icon: pin("#9b4a6c"),
    });
    overlaysRef.current.line = new g.Polyline({
      path: [from, to],
      geodesic: true,
      strokeColor: "#caa64d",
      strokeOpacity: 0.92,
      strokeWeight: 3,
      map,
    });

    const bounds = new g.LatLngBounds();
    bounds.extend(from);
    bounds.extend(to);
    map.fitBounds(bounds, 120);
  }, [ready, resolvedOrigin, goal]);

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
        const rawText = await response.text();
        let data = [];
        try {
          data = rawText ? JSON.parse(rawText) : [];
        } catch {
          throw new Error("city_search_failed");
        }
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

  const consultHref = `/book-consultation?fromCity=${encodeURIComponent(resolvedOrigin.label)}&pathwayGoal=${encodeURIComponent(goal.label)}&pathwayFocus=${encodeURIComponent(pathwayIntent)}`;
  const activeScenario = ROUTE_SCENARIOS.find((item) => item.id === scenarioId) || ROUTE_SCENARIOS[0];

  return (
    <section ref={sectionRef} className="pathway-map editorial-section editorial-section--compact">
      <div className="section-head">
        <div>
          <p className="section-label">Global Pathway Map</p>
          <h2>Make your migration pathway feel real before you lodge.</h2>
          <p className="pathway-map__lede">
            Orientation only: pick where you are today and an illustrative Australian destination. A registered
            migration agent still needs your full facts before any visa strategy.
          </p>
        </div>
      </div>

      <details className="rounded-2xl border border-brand-plum/15 bg-brand-cream/40 px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-brand-plum">Show advanced filters and guidance</summary>
        <ol className="pathway-map__stepper mt-3" aria-label="How to use this map">
          <li className="pathway-map__step">
            <span className="pathway-map__step-num" aria-hidden>
              1
            </span>
            <span>
              <strong>Where you are</strong> — your current city (worldwide search).
            </span>
          </li>
          <li className="pathway-map__step">
            <span className="pathway-map__step-num" aria-hidden>
              2
            </span>
            <span>
              <strong>What you are exploring</strong> — intent + destination shortlist (not visa advice).
            </span>
          </li>
          <li className="pathway-map__step">
            <span className="pathway-map__step-num" aria-hidden>
              3
            </span>
            <span>
              <strong>Next step with MinRosh</strong> — book a consultation when you are ready for tailored guidance.
            </span>
          </li>
        </ol>

        <p className="pathway-map__disclaimer">
          Route distance and flight times are rough illustrations. City search uses{" "}
          <a href="https://nominatim.openstreetmap.org/" target="_blank" rel="noreferrer">
            OpenStreetMap Nominatim
          </a>
          ; the map uses Google Maps when an API key is configured.
        </p>

        <div className="pathway-map__intent-row" role="group" aria-label="Pathway focus">
          {PATHWAY_INTENTS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`pathway-map__intent ${pathwayIntent === item.id ? "is-active" : ""}`}
              aria-pressed={pathwayIntent === item.id}
              title={item.hint}
              onClick={() => setPathwayIntent(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </details>

      <div className="pathway-map__grid">
        <div className="pathway-map__panel bento-hover">
          <div className="rounded-2xl border border-brand-plum/10 bg-white p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-rose">Future pacing route</p>
            <div className="mb-3 flex flex-wrap gap-2">
              {ROUTE_SCENARIOS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    item.id === scenarioId
                      ? "border-brand-rose bg-brand-rose text-white"
                      : "border-brand-plum/20 bg-white text-brand-plum"
                  }`}
                  onMouseEnter={() => setScenarioId(item.id)}
                  onFocus={() => setScenarioId(item.id)}
                  onClick={() => setScenarioId(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {activeScenario.nodes.map((node, index) => (
                <div key={`${activeScenario.id}-${node}`} className="rounded-xl bg-brand-cream/50 px-3 py-2 text-sm text-brand-plum">
                  <strong className="mr-2 text-brand-rose">{index + 1}.</strong>
                  {node}
                </div>
              ))}
            </div>
          </div>

          <div className="pathway-map__presets" aria-label="Quick pick start cities">
            <span className="pathway-map__preset-label">Quick start</span>
            <div className="pathway-map__preset-chips">
              {FROM_PRESETS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="pathway-map__preset"
                  onClick={() => chooseFrom(item)}
                >
                  {item.label.split(",")[0]}
                </button>
              ))}
            </div>
          </div>
          <label>
            Start city (worldwide)
            <input
              type="search"
              role="combobox"
              aria-controls={fromListboxId}
              aria-autocomplete="list"
              aria-haspopup="listbox"
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
              aria-expanded={fromOpen}
            />
            <div
              id={fromListboxId}
              className="pathway-map__suggestions"
              role="listbox"
              aria-label="Start city suggestions"
              hidden={!fromOpen || !fromFiltered.length}
            >
              {fromFiltered.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  role="option"
                  aria-selected={index === fromActiveIndex}
                  className={`pathway-map__suggestion ${index === fromActiveIndex ? "is-active" : ""}`}
                  onMouseDown={() => chooseFrom(item)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.country}</span>
                </button>
              ))}
            </div>
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

          <div className="pathway-map__presets" aria-label="Popular Australian destinations">
            <span className="pathway-map__preset-label">Popular destinations</span>
            <div className="pathway-map__preset-chips">
              {visibleGoalPresets.map((item) => (
                <button key={item.label} type="button" className="pathway-map__preset" onClick={() => chooseGoal(item)}>
                  {item.label.replace(/\s*\([^)]+\)\s*$/, "")}
                </button>
              ))}
            </div>
          </div>

          <label>
            Destination (Australian universities only)
            <input
              type="search"
              role="combobox"
              aria-controls={goalListboxId}
              aria-autocomplete="list"
              aria-haspopup="listbox"
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
              aria-expanded={goalOpen}
            />
            <div
              id={goalListboxId}
              className="pathway-map__suggestions"
              role="listbox"
              aria-label="Destination suggestions"
              hidden={!goalOpen || !goalFiltered.length}
            >
              {goalFiltered.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  role="option"
                  aria-selected={index === goalActiveIndex}
                  className={`pathway-map__suggestion ${index === goalActiveIndex ? "is-active" : ""}`}
                  onMouseDown={() => chooseGoal(item)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.country}</span>
                </button>
              ))}
            </div>
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
          <p className="pathway-map__not-sure">
            Not sure which pathway fits?{" "}
            <Link href="/#quiz" className="pathway-map__inline-link">
              Try the Smart Navigator
            </Link>{" "}
            or{" "}
            <Link href="/assessment" className="pathway-map__inline-link">
              free assessment
            </Link>
            .
          </p>
          <Link href={consultHref} className="btn btn-primary">
            Book a consultation for this pathway
          </Link>
        </div>
        <div className="pathway-map__canvas bento-hover">
          {error ? (
            <p className="pathway-map__fallback">{error}</p>
          ) : !mapSectionInView ? (
            <p className="pathway-map__placeholder" role="status">
              Map loads when this section is in view — scroll a little to preview your route (saves data until
              then).
            </p>
          ) : !ready && mapsKey ? (
            <p className="pathway-map__placeholder" role="status">
              Loading map…
            </p>
          ) : (
            <div ref={mapNodeRef} className="pathway-map__map" />
          )}
        </div>
      </div>
    </section>
  );
}
