# SkillSight AI - Intelligent Workforce Role Optimizer

A modern, futuristic AI-powered workforce optimization platform built with React, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- **AI Task Assignment**: Intelligent worker-task matching using machine learning algorithms
- **Predictive Analytics**: Forecast productivity and identify potential bottlenecks
- **Skill Growth Recommender**: Personalized training paths for continuous improvement
- **Demo Videos**: Interactive task tutorials with step-by-step guidance
- **Multilingual Support**: Available in English and Tamil
- **Gamified Learning**: XP points, badges, and leaderboards to boost engagement
- **Real-time Performance Tracking**: Monitor efficiency and optimize continuously

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Charts**: Recharts
- **UI Components**: ShadCN UI
- **Routing**: React Router
- **Build Tool**: Vite

## Design System

- **Colors**: Dark navy backgrounds (#0a0e27) with electric cyan (#00d4ff) accents
- **Style**: Glass morphism panels with glowing borders
- **Animations**: Smooth transitions, floating elements, and hover effects
- **Typography**: Modern sans-serif with gradient text effects

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd skillsight-ai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # ShadCN UI components
│   ├── ChatbotWidget.tsx
│   ├── Footer.tsx
│   └── Navbar.tsx
├── pages/              # Page components
│   ├── Explainability.tsx
│   ├── Index.tsx
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── ManagerDashboard.tsx
│   ├── NotFound.tsx
│   └── WorkerDashboard.tsx
├── data/               # Demo data and constants
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── main.tsx           # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.