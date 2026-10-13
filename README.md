# ⚡ Phantom Classrooms — Campus Energy Intelligence
> **Synesis 26 Innovation Project**  
> An intelligent campus energy monitoring dashboard that detects probable energy waste by synthesizing simulated camera-based occupancy estimates, PIR motion sensor telemetry, academic class timetables, equipment states, and commercial energy tariffs.

---

## 🌟 Overview & Product Vision

Educational institutions consume vast amounts of electrical energy keeping high-draw HVAC and lighting operational in empty or concluded classrooms. **Phantom Classrooms** solves this without intrusive surveillance or invasive automation by combining non-invasive multi-modal signals into a transparent, explainable decision engine.

### 🎯 Key Design & Engineering Features
- **Commercial SaaS Aesthetic**: Inspired directly by high-end BMS and smart campus telemetry interfaces:
  - Deep Navy navigation dock (`#0F172A`)
  - Crisp cool-gray workspace canvas (`#F8FAFC`)
  - Elevated metric cards with subtle borders & soft shadows
  - Electric-blue brand accents with status pill badges (Critical, Warning, Normal, Override)
- **Interactive 2D Campus Blueprint & Zone Map**: Real-time architectural schematic visualizing room occupancy zones, live thermal/CO₂ readings, and avoidable waste status.
- **Simulated CCTV HUD Preview**: Stylized security camera feed HUD with bounding boxes, computer vision confidence tags, timestamp, scanlines, and prominent `SIMULATED DATA` badge.
- **Zero Cloud & Zero Hardware Dependency**: Runs 100% locally with instant startup, typed mock datasets, and `localStorage` persistence.

---

## 🧠 Decision Engine & Heuristics

The decision engine separates heuristic evaluation cleanly from UI rendering in [`src/utils/decisionEngine.ts`](src/utils/decisionEngine.ts).

### Heuristic Scoring Formula:
$$\text{emptyConfidence} = 0.40 \times \text{timetableEnded} + 0.40 \times \text{cameraReportsZeroPeople} + 0.20 \times \text{noRecentMotion}$$

Where inputs are binary (0 or 1):
- `timetableEnded`: $1$ if scheduled session has concluded, $0$ if session is active.
- `cameraReportsZeroPeople`: $1$ if simulated CV detects 0 occupants, $0$ if occupants $> 0$.
- `noRecentMotion`: $1$ if PIR motion sensor is idle for $\ge 15$ minutes, $0$ if active.

### Waste Score Calculation:
$$\text{wasteScore} = 100 \times \text{emptyConfidence} \times \text{equipmentWasteFactor}$$

Where $\text{equipmentWasteFactor} \in [0.0, 1.0]$ represents the proportion of connected electrical load currently active (Lights: 0.4 kW, Inverter AC: 2.2 kW, Laser Projector: 0.35 kW, Workstations: 1.5 kW).

---

## 🛡️ The Kindness Rule & Sensor Conflict Policy

1. **Discrepancy / Conflict Handling**:
   - If simulated camera detects occupants ($>0$) while the PIR motion sensor reports zero recent movement (e.g., quiet students reading or studying with laptops), the system **never issues an automated shutoff**.
   - Instead, it flags a `VERIFICATION_REQUIRED` alert so campus staff can perform physical confirmation without disturbing students.
2. **Active Human Overrides**:
   - Authorized operators and faculty can apply temporary or recurring overrides (e.g., oral exam preparations, faculty reviews).
   - An active human override **always takes precedence**, suppressing shutoff alerts and zeroing out the waste score.
3. **Safety Guarantee**:
   - The system is an advisory intelligence platform. It provides explainable recommendations and never controls live high-voltage switchgear automatically.

---

## 🚀 Interactive Hackathon Demo Scenarios

Judges can toggle demo scenarios instantly using the header dropdown:
1. **Normal Routine (Mixed)**: Standard afternoon state with some sessions in progress, some idle rooms, and baseline telemetry.
2. **Ghost Classrooms (High Waste)**: Lecture Hall LH-101 and Tutorial Room TR-301 left with AC and lights running 38+ minutes after class ended.
3. **Sensor Conflict (Kindness Verification)**: AI Lab CS-204 camera sees 2 silent students reading with 0 motion for 22 mins, triggering the human verification workflow.
4. **Full Session (Zero Waste)**: Campus is bustling with ongoing keynote lectures; all equipment is legitimately required.
5. **Overnight Idle (Unattended Equipment)**: Late-night condition showing after-hours forgotten air conditioning units.

---

## 💻 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Charts & Telemetry**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Persistence**: Browser `localStorage`

---

## 🛠️ Getting Started Locally

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 4. Build for Production
```bash
npm run build
```

---

---

## 🤖 Roboflow Workflows Integration — Room Occupancy Monitor

The platform integrates directly with the serverless Roboflow Workflow **Room Occupancy Monitor** for real-time computer vision inference.

### ⚙️ Workflow Specification
- **Workspace Slug**: `santhosh-skandha-s-workspace`
- **Workflow Slug**: `room-occupancy-monitor`
- **Endpoint**: `POST https://serverless.roboflow.com/santhosh-skandha-s-workspace/workflows/room-occupancy-monitor`
- **Declared Inputs**: `image` (`url` or `base64`)
- **Declared Parameters**: `confidence` (number), `iou_threshold` (number), `class_agnostic_nms` (boolean), `max_detections` (number)
- **Authentication**: `Authorization: Bearer <ROBOFLOW_API_KEY>` header

### 🔑 Configuration
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set your Roboflow API key:
   ```env
   VITE_ROBOFLOW_API_KEY=your_roboflow_api_key_here
   ROBOFLOW_API_KEY=your_roboflow_api_key_here
   ```
   *(Alternatively, you can configure your API key dynamically in the dashboard's **Settings** panel without restarting the server).*

### 🧪 Running the Smoke Test
```bash
npm run test:roboflow
```
With an active key:
```bash
ROBOFLOW_API_KEY=your_key npm run test:roboflow
```

### 🎯 Live Inference in Dashboard
1. Navigate to **Rooms** or click **Inspect Room** on any monitored space.
2. In the CCTV feed HUD, click the **"Run Roboflow"** button.
3. The client calls the serverless workflow, displays live detected bounding boxes, latency in ms, and immediately feeds the genuine occupancy count into the **Decision Engine** heuristic.

---

## 📂 Project Structure

```
phantom-class-room/
├── scripts/
│   └── test-roboflow.mjs     # Roboflow serverless workflow smoke test
├── src/
│   ├── services/
│   │   └── roboflowWorkflowClient.ts # Official Roboflow client with retries & defensive parsing
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Dark navy dock navigation
│   │   │   └── Header.tsx            # Scenario switcher & status bar
│   │   ├── overview/
│   │   │   ├── OverviewView.tsx      # Main dashboard container
│   │   │   ├── KpiCards.tsx          # Real-time metrics matching Image 2
│   │   │   ├── CampusFloorplan.tsx   # 2D Zone map blueprint matching Image 3
│   │   │   ├── WasteDistributionChart.tsx # Recharts energy breakdown
│   │   │   ├── RoomStatusTable.tsx   # High-density room table with toggles
│   │   │   └── PriorityAlertsBanner.tsx   # Urgent alert notification
│   │   ├── rooms/
│   │   │   ├── RoomsList.tsx         # Spaces directory
│   │   │   ├── RoomDetailsView.tsx   # Comprehensive room inspection
│   │   │   └── SimulatedCameraHud.tsx# CCTV HUD with live Roboflow trigger & bounding boxes
│   │   ├── analytics/
│   │   │   └── AnalyticsView.tsx     # Trends, radar, problem room rankings
│   │   ├── alerts/
│   │   │   └── AlertsView.tsx        # Alarm stream & condition trigger inspector (Image 1)
│   │   └── settings/
│   │       └── SettingsView.tsx      # Tariff, Roboflow API Key, & Kindness Rule manager
│   ├── context/
│   │   └── AppContext.tsx            # Global state with scenario & localStorage sync
│   ├── data/
│   │   └── mockData.ts               # Diverse room dataset (LH-101, CS-204, etc.)
│   ├── types/
│   │   └── index.ts                  # Clean TypeScript definitions
│   ├── utils/
│   │   └── decisionEngine.ts         # Pure starter heuristic & Kindness rule logic
│   ├── App.tsx                       # Main page router
│   ├── index.css                     # Tailwind CSS v4 styling & animations
│   └── main.tsx                      # Vite React entry point
├── .env.example                      # Template for Roboflow API keys
└── package.json
```

---

Built for **Synesis 26** Campus Innovation Hackathon.

