export interface Task {
  id: string;
  name: string;
  description: string;
  videoUrl: string;
  requiredSkills: string[];
}

export interface Worker {
  id: string;
  name: string;
  skillMatch: number;
  performance: number;
  accuracy: number;
  speed: number;
  experience: number;
  availability: "available" | "busy" | "unavailable";
  xpPoints: number;
  badges: string[];
}

export interface Assignment {
  taskId: string;
  workerId: string;
  aiReason: string;
}

export const tasks: Task[] = [
  {
    id: "task1",
    name: "Engine Assembly",
    description: "Complex mechanical assembly requiring precision and attention to detail",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    requiredSkills: ["Mechanical Assembly", "Quality Control", "Blueprint Reading"]
  },
  {
    id: "task2",
    name: "Painting & Finishing",
    description: "Professional automotive painting with quality inspection",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    requiredSkills: ["Surface Preparation", "Spray Painting", "Quality Inspection"]
  },
  {
    id: "task3",
    name: "EV Battery Pack Assembly",
    description: "High-precision assembly of electric vehicle battery systems",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    requiredSkills: ["Electrical Systems", "Safety Protocols", "Technical Assembly"]
  },
  {
    id: "task4",
    name: "CKD Kit Packing / Kitting",
    description: "Completely Knocked Down kit organization and packaging",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    requiredSkills: ["Inventory Management", "Organization", "Logistics"]
  },
  {
    id: "task5",
    name: "Quality Inspection / End of Line Testing",
    description: "Final quality checks and testing before vehicle release",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    requiredSkills: ["Quality Control", "Testing Procedures", "Documentation"]
  }
];

export const workers: Worker[] = [
  {
    id: "w1",
    name: "Rajesh Kumar",
    skillMatch: 95,
    performance: 92,
    accuracy: 98,
    speed: 88,
    experience: 90,
    availability: "available",
    xpPoints: 2850,
    badges: ["Gold", "Master Assembler"]
  },
  {
    id: "w2",
    name: "Priya Sharma",
    skillMatch: 88,
    performance: 90,
    accuracy: 95,
    speed: 85,
    experience: 85,
    availability: "available",
    xpPoints: 2400,
    badges: ["Silver", "Quality Expert"]
  },
  {
    id: "w3",
    name: "Mohammed Ali",
    skillMatch: 92,
    performance: 94,
    accuracy: 90,
    speed: 92,
    experience: 88,
    availability: "busy",
    xpPoints: 2650,
    badges: ["Gold", "Speed Champion"]
  },
  {
    id: "w4",
    name: "Lakshmi Venkat",
    skillMatch: 85,
    performance: 87,
    accuracy: 92,
    speed: 80,
    experience: 82,
    availability: "available",
    xpPoints: 2100,
    badges: ["Silver", "Precision Pro"]
  },
  {
    id: "w5",
    name: "Arjun Singh",
    skillMatch: 90,
    performance: 88,
    accuracy: 88,
    speed: 90,
    experience: 85,
    availability: "available",
    xpPoints: 2300,
    badges: ["Bronze", "Rising Star"]
  }
];

export const assignments: Assignment[] = [
  {
    taskId: "task1",
    workerId: "w1",
    aiReason: "Rajesh has exceptional mechanical assembly experience (90%) and highest accuracy rate (98%). His past performance on similar tasks shows 92% efficiency with zero critical errors."
  },
  {
    taskId: "task2",
    workerId: "w2",
    aiReason: "Priya's quality control expertise (95% accuracy) and surface preparation skills make her ideal for painting tasks. Her attention to detail ensures consistent finish quality."
  },
  {
    taskId: "task3",
    workerId: "w3",
    aiReason: "Mohammed's technical assembly skills (92% match) and safety protocol adherence make him perfect for high-precision EV battery work. Despite being busy, his speed (92%) allows task completion within deadline."
  },
  {
    taskId: "task4",
    workerId: "w4",
    aiReason: "Lakshmi's organizational skills and logistics experience ensure accurate kit assembly. Her precision (92% accuracy) minimizes packaging errors and reduces rework."
  },
  {
    taskId: "task5",
    workerId: "w1",
    aiReason: "Rajesh's comprehensive experience and testing procedure knowledge (98% accuracy) make him the best choice for final quality inspection. His documentation skills ensure compliance."
  }
];

export const kpiData = {
  avgEfficiency: 89.5,
  topWorker: "Rajesh Kumar",
  skillGapPercent: 12,
  tasksCompleted: 247,
  avgCompletionTime: "4.2 hrs"
};
