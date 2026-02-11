import L from "leaflet";
import { api } from "./api.js";
import {
  createIcons,
  MapPin,
  Building2,
  HelpCircle,
  CircleHelp,
  List,
  Monitor,
  BookOpen,
  Utensils,
  Dumbbell,
  Settings,
  Leaf,
  Search,
  Map as MapIcon,
  Info,
  X,
  Navigation,
  Share2,
  Shield,
  Bed,
  GraduationCap,
  Check,
  ChevronDown,
  User,
  LogOut,
  AlertTriangle,
  Pencil,
  Trash2,
} from "lucide";

// Global icons configuration
const iconConfig = {
  icons: {
    MapPin,
    Building2,
    "building-2": Building2,
    HelpCircle,
    "help-circle": HelpCircle,
    CircleHelp,
    "circle-help": CircleHelp || HelpCircle,
    List,
    list: List,
    Monitor,
    BookOpen,
    Utensils,
    Dumbbell,
    Settings,
    Leaf,
    Search,
    Map: MapIcon,
    map: MapIcon,
    Info,
    X,
    Navigation,
    Share2,
    Shield,
    Bed,
    GraduationCap,
    Check,
    ChevronDown,
    User,
    LogOut,
    AlertTriangle,
    "alert-triangle": AlertTriangle,
    Pencil,
    pencil: Pencil,
    Trash2,
    "trash-2": Trash2,
  },
};

// Initialize static icons
createIcons(iconConfig);

// CPSU Main Campus (Brgy. Camingawan) Coordinates
const CAMPUS_CENTER = [9.8512, 122.8902];
const INITIAL_ZOOM = 17.5;

// Building Data (Now dynamically fetched via centralized API)
let buildings = [];
const markers = {};

async function fetchBuildings() {
  try {
    const data = await api.buildings.getAll();

    // Map backend decimal strings to floats and format for frontend
    buildings = data.map((b) => ({
      ...b,
      latitude: parseFloat(b.latitude),
      longitude: parseFloat(b.longitude),
      coords: [parseFloat(b.latitude), parseFloat(b.longitude)],
    }));

    initMarkers();
    renderBuildingList(""); // Refresh list if search was active
    if (directoryGrid) renderDirectory();

    console.log("CampusHelper: Buildings fetched via API Module.");
  } catch (err) {
    console.error("Error fetching buildings:", err);
  }
}

function initMarkers() {
  buildings.forEach((b) => {
    const marker = L.marker(b.coords, {
      icon: createCustomIcon(b.icon),
      interactive: true,
    }).addTo(map);

    marker.on("click", (e) => {
      if (e.originalEvent) {
        L.DomEvent.stopPropagation(e.originalEvent);
      }
      showBuildingInfo(b);
    });

    markers[b.id] = marker;
  });
  createIcons(iconConfig);
}

// Initialize Map
const map = L.map("map", {
  zoomControl: false,
  attributionControl: false,
  minZoom: 16, // Slightly more zoom out allowed
  maxBounds: [
    [9.842, 122.875], // Expanded South-West corner for centering room
    [9.86, 122.905], // Expanded North-East corner for centering room
  ],
  maxBoundsViscosity: 0.1, // Softer bounce, allows centering edge markers better
}).setView(CAMPUS_CENTER, INITIAL_ZOOM);

// Add Tile Layer (No Labels version for a cleaner look)
L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
  {
    maxZoom: 20,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
  },
).addTo(map);

// Ensure icons in popups are rendered when they open
map.on("popupopen", () => {
  createIcons(iconConfig);
});

// Custom Icons for Leaflet
const createCustomIcon = (iconName) =>
  L.divIcon({
    html: `<div class="custom-marker"><i data-lucide="${iconName}" style="width: 16px; height: 16px;"></i></div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

// UI Elements
const buildingListEl = document.getElementById("building-list");
const infoCard = document.getElementById("info-card");
const cardName = document.getElementById("card-name");
const cardDesc = document.getElementById("card-desc");
const closeCardBtn = document.getElementById("close-card");
const searchInput = document.getElementById("search-input");
const btnDirections = document.getElementById("btn-directions");
const btnShare = document.getElementById("btn-share");

// State
let currentBuilding = null;
let activeTooltip = null;
let reportMode = false;
let tempReportMarker = null;
let campusReports = [];

// Clear the active building label tooltip
function clearActiveTooltip() {
  if (activeTooltip) {
    activeTooltip.remove();
    activeTooltip = null;
  }
}

// Global UI Modal Helpers
window.showAlert = (title, message, type = "success") => {
  const modal = document.getElementById("alert-modal");
  const iconContainer = document.getElementById("alert-icon-container");
  const icon = document.getElementById("alert-icon");
  const titleEl = document.getElementById("alert-title");
  const msgEl = document.getElementById("alert-msg");
  const okBtn = document.getElementById("btn-alert-ok");
  const confirmActions = document.getElementById("confirm-actions");

  titleEl.textContent = title;
  msgEl.textContent = message;

  // Set type styles
  if (type === "error") {
    iconContainer.className =
      "w-16 h-16 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6";
    icon.setAttribute("data-lucide", "alert-triangle");
  } else if (type === "warning") {
    iconContainer.className =
      "w-16 h-16 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-6";
    icon.setAttribute("data-lucide", "alert-triangle");
  } else {
    iconContainer.className =
      "w-16 h-16 rounded-3xl bg-emerald-50 text-brand-primary flex items-center justify-center mx-auto mb-6";
    icon.setAttribute("data-lucide", "check");
  }

  okBtn.classList.remove("hidden");
  confirmActions.classList.add("hidden");
  confirmActions.style.display = "none";

  modal.classList.remove("hidden");
  createIcons(iconConfig);

  return new Promise((resolve) => {
    okBtn.onclick = () => {
      modal.classList.add("hidden");
      resolve();
    };
  });
};

window.showConfirm = (title, message) => {
  const modal = document.getElementById("alert-modal");
  const iconContainer = document.getElementById("alert-icon-container");
  const icon = document.getElementById("alert-icon");
  const titleEl = document.getElementById("alert-title");
  const msgEl = document.getElementById("alert-msg");
  const okBtn = document.getElementById("btn-alert-ok");
  const confirmActions = document.getElementById("confirm-actions");
  const yesBtn = document.getElementById("btn-confirm-yes");
  const noBtn = document.getElementById("btn-confirm-no");

  titleEl.textContent = title;
  msgEl.textContent = message;

  iconContainer.className =
    "w-16 h-16 rounded-3xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-6";
  icon.setAttribute("data-lucide", "help-circle");

  okBtn.classList.add("hidden");
  confirmActions.classList.remove("hidden");
  confirmActions.style.display = "flex";

  modal.classList.remove("hidden");
  createIcons(iconConfig);

  return new Promise((resolve) => {
    yesBtn.onclick = () => {
      modal.classList.add("hidden");
      resolve(true);
    };
    noBtn.onclick = () => {
      modal.classList.add("hidden");
      resolve(false);
    };
  });
};

// Functions
let reportMarkers = [];

async function fetchReports() {
  try {
    campusReports = await api.reports.getAll();
    renderReports();
  } catch (err) {
    console.error("Error fetching reports:", err);
  }
}

function renderReports() {
  // Clear old markers
  reportMarkers.forEach((m) => map.removeLayer(m));
  reportMarkers = [];

  campusReports.forEach((report) => {
    const icon = L.divIcon({
      html: `
        <div class="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
          <i data-lucide="alert-triangle" class="text-white w-3 h-3"></i>
        </div>
      `,
      className: "",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const marker = L.marker([report.latitude, report.longitude], {
      icon,
    }).addTo(map);

    marker.bindPopup(`
      <div class="p-2 min-w-[160px]">
        <div class="mb-3">
          <h4 class="font-black text-slate-900 text-sm mb-1">${report.title}</h4>
          <p class="text-[11px] text-slate-500 leading-relaxed">${report.description}</p>
        </div>
        <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <span class="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">${report.category}</span>
          <div class="flex items-center gap-1">
            <button onclick="window.editReport(${report.id})" class="p-1.5 text-slate-400 hover:text-brand-primary transition-colors" title="Edit">
              <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="window.deleteReport(${report.id})" class="p-1.5 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </div>
    `);
    reportMarkers.push(marker);
  });
  createIcons(iconConfig);
}

window.editReport = (id) => {
  const report = campusReports.find((r) => r.id === id);
  if (!report) return;

  // Fill modal
  document.getElementById("report-id").value = report.id;
  document.getElementById("report-title").value = report.title;
  document.getElementById("report-desc").value = report.description;
  document.getElementById("report-category").value = report.category;
  document.getElementById("report-lat").value = report.latitude;
  document.getElementById("report-lng").value = report.longitude;

  // Update Modal UI
  document.getElementById("report-modal-title").textContent = "Edit Report";
  document.getElementById("btn-report-submit").textContent = "Update Report";

  // Show
  document.getElementById("report-modal").classList.remove("hidden");
  map.closePopup();
  createIcons(iconConfig);
};

window.deleteReport = async (id) => {
  const confirmed = await showConfirm(
    "Delete Report",
    "Are you sure you want to permanently remove this report?",
  );
  if (!confirmed) return;

  try {
    await api.reports.delete(id);
    await fetchReports();
    showAlert(
      "Deleted",
      "The report has been successfully removed.",
      "success",
    );
  } catch (err) {
    showAlert("Delete Failed", err.message, "error");
  }
};

function enterReportMode() {
  reportMode = true;
  document.getElementById("report-id").value = ""; // Clear existing ID
  document.getElementById("report-modal-title").textContent =
    "New Campus Report";
  document.getElementById("btn-report-submit").textContent = "Submit Report";

  document.getElementById("pinpoint-hint").classList.remove("hidden");
  document
    .getElementById("btn-report-init")
    .classList.add("bg-brand-primary", "text-white");

  // Close any open info cards
  infoCard.classList.add("hidden");
  clearActiveTooltip();
}

function exitReportMode() {
  reportMode = false;
  document.getElementById("pinpoint-hint").classList.add("hidden");
  document
    .getElementById("btn-report-init")
    .classList.remove("bg-brand-primary", "text-white");

  if (tempReportMarker) {
    map.removeLayer(tempReportMarker);
    tempReportMarker = null;
  }
}

// Map Click Handler for Report Mode
map.on("click", (e) => {
  if (!reportMode) return;

  const { lat, lng } = e.latlng;

  // Update hidden inputs
  document.getElementById("report-lat").value = lat;
  document.getElementById("report-lng").value = lng;

  // Visual marker
  if (tempReportMarker) map.removeLayer(tempReportMarker);

  tempReportMarker = L.marker([lat, lng], {
    icon: L.divIcon({
      html: `<div class="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center border-2 border-brand-primary shadow-2xl animate-bounce">
              <i data-lucide="map-pin" class="text-brand-primary w-5 h-5"></i>
             </div>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  }).addTo(map);

  createIcons(iconConfig);

  // Show Modal
  document.getElementById("report-modal").classList.remove("hidden");
});

// Report Form Submission
document.getElementById("report-form").onsubmit = async (e) => {
  e.preventDefault();
  const btn = document.getElementById("btn-report-submit");
  const originalText = btn.innerText;

  const reportId = document.getElementById("report-id").value;
  const reportData = {
    title: document.getElementById("report-title").value,
    description: document.getElementById("report-desc").value,
    category: document.getElementById("report-category").value,
    latitude: parseFloat(document.getElementById("report-lat").value),
    longitude: parseFloat(document.getElementById("report-lng").value),
  };

  btn.innerHTML = `<span class="animate-pulse">${reportId ? "Updating..." : "Submitting..."}</span>`;
  btn.disabled = true;

  try {
    if (reportId) {
      await api.reports.update(reportId, reportData);
      showAlert(
        "Updated",
        "Your report has been successfully updated!",
        "success",
      );
    } else {
      await api.reports.create(reportData);
      showAlert(
        "Submitted",
        "Thank you! Your report has been submitted to the campus team.",
        "success",
      );
    }

    // Reset and close
    document.getElementById("report-modal").classList.add("hidden");
    document.getElementById("report-form").reset();
    exitReportMode();
    fetchReports(); // Refresh markers
  } catch (err) {
    showAlert("Submission Failed", err.message, "error");
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
};

document.getElementById("btn-report-init").onclick = () => {
  if (reportMode) exitReportMode();
  else enterReportMode();
};

document.getElementById("btn-report-close").onclick = () => {
  document.getElementById("report-modal").classList.add("hidden");
};

// Profile Modal Logic
window.openProfileModal = () => {
  const user = JSON.parse(localStorage.getItem("campus_user") || "{}");
  if (!user || !user.id) {
    // If no user logic found, maybe redirect or just show empty
    return;
  }

  document.getElementById("profile-student-id").value = user.studentId || "N/A";
  document.getElementById("profile-fullname").value = user.fullName || "";
  document.getElementById("profile-password").value = "";

  document.getElementById("profile-modal").classList.remove("hidden");
  createIcons(iconConfig);
};

document.getElementById("btn-profile-close").onclick = () => {
  document.getElementById("profile-modal").classList.add("hidden");
};

document.getElementById("profile-form").onsubmit = async (e) => {
  e.preventDefault();
  const btn = document.getElementById("btn-profile-submit");
  const originalText = btn.innerText;

  const user = JSON.parse(localStorage.getItem("campus_user") || "{}");
  if (!user.id) return;

  const fullName = document.getElementById("profile-fullname").value;
  const password = document.getElementById("profile-password").value;

  const updates = { fullName };
  if (password) updates.password = password;

  btn.innerHTML = `<span class="animate-pulse">Saving...</span>`;
  btn.disabled = true;

  try {
    const updatedUser = await api.users.update(user.id, updates);

    // Update local storage
    if (updatedUser.fullName) user.fullName = updatedUser.fullName;
    // Don't store password
    localStorage.setItem("campus_user", JSON.stringify(user));

    showAlert(
      "Profile Updated",
      "Your information has been successfully updated.",
      "success",
    );
    document.getElementById("profile-modal").classList.add("hidden");
  } catch (err) {
    showAlert("Update Failed", err.message, "error");
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
};

// Initial Load for Reports
fetchReports();

// Functions
function showBuildingInfo(building) {
  const isSameBuilding = currentBuilding && currentBuilding.id === building.id;
  const hasRoute = routeLine !== null;

  // If a route for THIS building is already active, just show the card as-is
  if (isSameBuilding && hasRoute) {
    infoCard.classList.remove("hidden");
    map.setView(building.coords, 18);
    buildingListEl.classList.add("hidden");
    return;
  }

  // Otherwise, if switching to a new building, clear previous route
  if (!isSameBuilding) {
    clearRoute();
  }

  // Clear previous tooltip label
  clearActiveTooltip();

  currentBuilding = building;
  cardName.textContent = building.name;
  cardDesc.innerHTML = `<p class="text-slate-500 text-sm">${building.description}</p>`;
  infoCard.classList.remove("hidden");
  infoCard.classList.remove("minimized");

  // Zoom to the building (use setView to avoid flyTo animation race)
  map.invalidateSize();
  map.setView(building.coords, 18);

  // Show building name label above the marker
  const marker = markers[building.id];
  if (marker) {
    activeTooltip = L.tooltip({
      permanent: true,
      direction: "top",
      offset: [0, -36],
      className: "building-label",
    })
      .setContent(building.name)
      .setLatLng(building.coords)
      .addTo(map);
  }

  // Hide search results after selection
  buildingListEl.classList.add("hidden");

  // Reset directions button state for new inspection
  btnDirections.innerHTML = `<i data-lucide="navigation" class="w-5 h-5"></i> Get Directions`;
  btnDirections.onclick = directionsClickHandler;
  createIcons(iconConfig);
}

// Extract directions handler for easier restoration
async function directionsClickHandler() {
  if (!currentBuilding) return;

  const btn = btnDirections;
  const originalHTML = btn.innerHTML;

  // Loading state
  btn.innerHTML = `<span class="animate-pulse">Locating you...</span>`;
  btn.disabled = true;

  try {
    // Step 1: Get user's GPS
    userCoords = await getUserLocation();
    placeUserMarker(userCoords);

    btn.innerHTML = `<span class="animate-pulse">Finding route...</span>`;

    // Step 2: Fetch walking route from user to building
    const route = await fetchRoute(userCoords, currentBuilding.coords);

    // Step 3: Draw route on map
    drawRoute(route);

    // Step 4: Update info card with route info
    updateCardWithRoute(route);

    btn.innerHTML = `<i data-lucide="check" class="w-5 h-5"></i> Located`;
    createIcons(iconConfig);
  } catch (err) {
    console.error("Directions error:", err);
    showAlert("Directions Error", err.message, "error");
    btn.innerHTML = originalHTML;
    createIcons(iconConfig);
  } finally {
    btn.disabled = false;
  }
}

function renderBuildingList(filter = "") {
  buildingListEl.innerHTML = "";

  // Only show results if there's a search term
  if (!filter.trim()) {
    buildingListEl.classList.add("hidden");
    return;
  }

  const filtered = buildings.filter(
    (b) =>
      b.name.toLowerCase().includes(filter.toLowerCase()) ||
      b.category.toLowerCase().includes(filter.toLowerCase()),
  );

  if (filtered.length === 0) {
    buildingListEl.classList.add("hidden");
    return;
  }

  buildingListEl.classList.remove("hidden");

  filtered.forEach((b) => {
    const item = document.createElement("div");
    item.className =
      "p-3 rounded-xl bg-white/80 lg:border lg:border-slate-100 hover:border-brand-primary/30 transition-all cursor-pointer group lg:shadow-sm lg:p-4 lg:rounded-2xl";
    item.innerHTML = `
            <div class="flex items-center gap-2 pointer-events-none lg:gap-3">
                <div class="w-7 h-7 rounded-lg bg-emerald-100 text-brand-primary flex items-center justify-center lg:w-8 lg:h-8">
                    <i data-lucide="${b.icon}" class="w-3.5 h-3.5 lg:w-4 lg:h-4"></i>
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 group-hover:text-brand-primary transition-colors text-xs lg:text-sm">${b.name}</h3>
                    <p class="text-[9px] text-slate-400 uppercase font-bold tracking-tight lg:text-[10px]">${b.category}</p>
                </div>
            </div>
        `;
    item.onclick = () => showBuildingInfo(b);
    buildingListEl.appendChild(item);
  });

  // Re-initialize icons for dynamic content
  createIcons(iconConfig);
}

// Add Markers (Re-run after fetch)
fetchBuildings();

// Bottom Info Card Actions
document.getElementById("minimize-card").onclick = () => {
  infoCard.classList.toggle("minimized");
  createIcons(iconConfig);
};

closeCardBtn.onclick = () => {
  infoCard.classList.add("hidden");
  infoCard.classList.remove("minimized");
  clearActiveTooltip();
};

// Route drawing state
let routeLine = null;
let userMarker = null;
let userCoords = null;

function clearRoute() {
  if (routeLine) {
    map.removeLayer(routeLine);
    routeLine = null;
  }
}

// Get user location (returns a Promise)
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve([latitude, longitude]);
      },
      (error) => {
        let msg = "Could not get your location.";
        if (error.code === 1)
          msg = "Please enable location permissions to use this feature.";
        if (error.code === 2) msg = "Location unavailable. Please try again.";
        if (error.code === 3)
          msg = "Location request timed out. Please try again.";
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  });
}

// Place or update user marker on the map
function placeUserMarker(coords) {
  if (userMarker) {
    map.removeLayer(userMarker);
  }
  userMarker = L.marker(coords, {
    icon: L.divIcon({
      className: "user-location-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    }),
    zIndexOffset: 1000,
  }).addTo(map);

  userMarker.bindPopup("<b>You are here</b>");
}

// Fetch walking route from OSRM
async function fetchRoute(from, to) {
  // OSRM uses [lng, lat] order
  const url = `https://router.project-osrm.org/route/v1/foot/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
    throw new Error("Could not find a route.");
  }

  return data.routes[0];
}

// Draw route on map
function drawRoute(routeGeoJSON) {
  clearRoute();

  // OSRM GeoJSON coordinates are [lng, lat], Leaflet needs [lat, lng]
  const coords = routeGeoJSON.geometry.coordinates.map((c) => [c[1], c[0]]);

  routeLine = L.polyline(coords, {
    color: "#10b981",
    weight: 5,
    opacity: 0.85,
    lineCap: "round",
    lineJoin: "round",
    dashArray: null,
  }).addTo(map);

  // Fit map to show entire route
  map.fitBounds(routeLine.getBounds(), { padding: [60, 60] });
}

// Update info card with distance
function updateCardWithRoute(route) {
  const distanceKm = (route.distance / 1000).toFixed(2);
  const durationMin = Math.ceil(route.duration / 60);
  cardDesc.innerHTML = `
    <div class="flex items-center gap-4 mb-2">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold">
        <i data-lucide="map-pin" class="w-3 h-3"></i> ${distanceKm} km
      </span>
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
        🚶 ~${durationMin} min walk
      </span>
    </div>
    <p class="text-slate-500 text-sm">${currentBuilding.description}</p>
  `;
  createIcons(iconConfig);
}

// Main Directions Handler
btnDirections.onclick = directionsClickHandler;

btnShare.onclick = async () => {
  if (currentBuilding) {
    const shareData = {
      title: `CampusHelper: ${currentBuilding.name}`,
      text: `Find the ${currentBuilding.name} at CPSU Kabankalan.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showAlert(
          "Link Copied",
          "The campus map link has been copied to your clipboard.",
          "success",
        );
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  }
};

searchInput.oninput = (e) => renderBuildingList(e.target.value);

// Locate Me Button
document.getElementById("btn-location").onclick = async () => {
  const locBtn = document.getElementById("btn-location");
  locBtn.classList.add("bg-brand-primary", "text-white");

  try {
    userCoords = await getUserLocation();
    placeUserMarker(userCoords);
    userMarker.openPopup();
    map.flyTo(userCoords, 18);
  } catch (err) {
    showAlert("Location Error", err.message, "error");
  } finally {
    locBtn.classList.remove("bg-brand-primary", "text-white");
  }
};
// UI Overlays
const listOverlay = document.getElementById("list-overlay");
const helpOverlay = document.getElementById("help-overlay");
let directoryGrid = null;

// Dynamic View Loading
async function initViews() {
  try {
    const [listRes, helpRes] = await Promise.all([
      fetch("/views/list-view.html"),
      fetch("/views/help-view.html"),
    ]);

    listOverlay.innerHTML = await listRes.text();
    helpOverlay.innerHTML = await helpRes.text();

    directoryGrid = document.getElementById("directory-grid");

    // Refresh icons for new content
    createIcons(iconConfig);
    console.log("CampusHelper: Views loaded.");
  } catch (err) {
    console.error("Error loading views:", err);
  }
}

// Initial Load
initViews().then(() => {
  console.log("CampusHelper: System Ready.");
});

// Navigation Switches (Exposed to window for dynamic HTML click handlers)
window.showMap = function () {
  console.log("Navigation: showMap");
  listOverlay.classList.add("hidden");
  helpOverlay.classList.add("hidden");
  setActiveNav("map");
  updateDesktopNav("map");
};

window.showList = async function () {
  console.log("Navigation: showList");
  if (!directoryGrid) await initViews();
  if (directoryGrid) renderDirectory();

  listOverlay.classList.remove("hidden");
  helpOverlay.classList.add("hidden");
  setActiveNav("list");
  updateDesktopNav("list");
  if (infoCard) infoCard.classList.add("hidden");
};

window.showHelp = async function () {
  console.log("Navigation: showHelp");
  if (!directoryGrid) await initViews();

  helpOverlay.classList.remove("hidden");
  listOverlay.classList.add("hidden");
  setActiveNav("help");
  updateDesktopNav("help");
  if (infoCard) infoCard.classList.add("hidden");
};

// Aliases for local script use
const showMap = window.showMap;
const showList = window.showList;
const showHelp = window.showHelp;

function updateDesktopNav(activeKey) {
  const desktopBtns = {
    map: document.getElementById("btn-nav-map"),
    list: document.getElementById("btn-nav-list"),
    help: document.getElementById("btn-nav-help"),
  };

  Object.entries(desktopBtns).forEach(([key, btn]) => {
    if (!btn) return;
    if (key === activeKey) {
      btn.setAttribute("data-active", "true");
    } else {
      btn.removeAttribute("data-active");
    }
  });
}

function renderDirectory() {
  if (!directoryGrid) return;
  directoryGrid.innerHTML = "";

  const categories = [...new Set(buildings.map((b) => b.category))];

  categories.forEach((cat) => {
    const section = document.createElement("div");
    section.innerHTML = `<h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">${cat}</h3>`;

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 md:grid-cols-2 gap-4";

    const items = buildings.filter((b) => b.category === cat);
    items.forEach((b) => {
      const card = document.createElement("div");
      card.className =
        "bg-white p-5 rounded-3xl border border-slate-100 hover:border-brand-primary/30 transition-all cursor-pointer group shadow-sm flex items-center gap-4";
      card.innerHTML = `
        <div class="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-brand-primary/10 group-hover:text-brand-primary flex items-center justify-center transition-colors">
          <i data-lucide="${b.icon}" class="w-6 h-6"></i>
        </div>
        <div class="grow">
          <h4 class="font-bold text-slate-900 group-hover:text-brand-primary transition-colors">${b.name}</h4>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">${b.category}</p>
        </div>
        <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand-primary group-hover:text-white transition-all">
          <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </div>
      `;
      card.onclick = () => {
        showMap();
        // Delay to let overlay hide and map resize settle
        setTimeout(() => {
          map.invalidateSize();
          showBuildingInfo(b);
        }, 100);
      };
      grid.appendChild(card);
    });

    section.appendChild(grid);
    directoryGrid.appendChild(section);
  });

  createIcons(iconConfig);
}

// Mobile Navigation Elements
const navButtons = {
  map: document.getElementById("nav-map"),
  list: document.getElementById("nav-list"),
  help: document.getElementById("nav-help"),
};

// Main Navigation Handlers
const mapBtn = document.getElementById("btn-nav-map");
const listBtn = document.getElementById("btn-nav-list");
const helpBtn = document.getElementById("btn-nav-help");

if (mapBtn) mapBtn.onclick = showMap;
if (listBtn) listBtn.onclick = showList;
if (helpBtn) helpBtn.onclick = showHelp;

if (navButtons.map) navButtons.map.onclick = showMap;
if (navButtons.list) navButtons.list.onclick = showList;
if (navButtons.help) navButtons.help.onclick = showHelp;

// Mobile Navigation Logic (Updated)
function setActiveNav(activeKey) {
  Object.entries(navButtons).forEach(([key, btn]) => {
    if (!btn) return;
    if (key === activeKey) {
      btn.setAttribute("data-active", "true");
    } else {
      btn.removeAttribute("data-active");
    }
  });
}

console.log("CampusHelper: Logic initialized with multi-view navigation.");
