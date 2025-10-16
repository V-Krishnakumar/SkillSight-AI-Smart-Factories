import { Task } from '@/types/database'

// Define the 5 main tasks for automated assignment
export const TASK_DEFINITIONS: Task[] = [
  {
    id: 'engine-assembly',
    name: 'Engine Assembly',
    description: 'Assemble automotive engines following precise specifications and quality standards. Includes component installation, torque specifications, and final inspection.',
    category: 'Assembly',
    duration: '6-8 hours',
    difficulty: 'Hard',
    toolsRequired: ['Torque Wrench', 'Assembly Stand', 'Measuring Tools', 'Safety Equipment'],
    precautions: ['Follow torque specifications exactly', 'Wear safety glasses', 'Check component alignment', 'Verify part numbers'],
    requiredSkills: ['Engine Assembly', 'Mechanical Skills', 'Quality Control'],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    skillRequirements: {
      skill_engine_assembly: 0.9,
      skill_quality_inspection: 0.8,
      task_complexity: 0.9,
      duration_hours: 7
    }
  },
  {
    id: 'painting-finishing',
    name: 'Painting & Finishing',
    description: 'Apply paint coatings and finishing treatments to vehicle surfaces. Includes surface preparation, paint application, and quality inspection.',
    category: 'Quality',
    duration: '4-6 hours',
    difficulty: 'Medium',
    toolsRequired: ['Paint Gun', 'Sandpaper', 'Masking Tape', 'Primer', 'Clear Coat'],
    precautions: ['Ensure proper ventilation', 'Wear respirator', 'Check paint mixing ratios', 'Maintain clean environment'],
    requiredSkills: ['Painting', 'Surface Preparation', 'Quality Control'],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    skillRequirements: {
      skill_painting_finishing: 0.9,
      skill_quality_inspection: 0.7,
      task_complexity: 0.6,
      duration_hours: 5
    }
  },
  {
    id: 'ev-battery-assembly',
    name: 'EV Battery Pack Assembly',
    description: 'Assemble electric vehicle battery packs including cell installation, wiring, and safety systems. Requires electrical knowledge and precision.',
    category: 'Technical',
    duration: '8-10 hours',
    difficulty: 'Hard',
    toolsRequired: ['Multimeter', 'Insulation Tools', 'Safety Equipment', 'Battery Management System'],
    precautions: ['Follow electrical safety protocols', 'Check insulation', 'Verify voltage ratings', 'Test connections'],
    requiredSkills: ['Electrical Assembly', 'Battery Technology', 'Safety Protocols'],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    skillRequirements: {
      skill_ev_battery_assembly: 0.95,
      skill_quality_inspection: 0.9,
      task_complexity: 0.95,
      duration_hours: 9
    }
  },
  {
    id: 'ckd-kitting',
    name: 'CKD Kit Packing / Kitting',
    description: 'Pack and organize Complete Knock Down (CKD) kits for assembly. Includes inventory management, packaging, and quality verification.',
    category: 'Logistics',
    duration: '3-5 hours',
    difficulty: 'Easy',
    toolsRequired: ['Packaging Materials', 'Inventory Scanner', 'Quality Checklist', 'Storage Containers'],
    precautions: ['Verify part quantities', 'Check packaging integrity', 'Follow storage guidelines', 'Update inventory'],
    requiredSkills: ['Inventory Management', 'Packaging', 'Quality Control'],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    skillRequirements: {
      skill_ckd_kitting: 0.8,
      skill_quality_inspection: 0.6,
      task_complexity: 0.3,
      duration_hours: 4
    }
  },
  {
    id: 'quality-inspection',
    name: 'Quality Inspection',
    description: 'Perform comprehensive quality inspections on completed assemblies. Includes dimensional checks, functional testing, and documentation.',
    category: 'Quality',
    duration: '2-4 hours',
    difficulty: 'Medium',
    toolsRequired: ['Measuring Instruments', 'Test Equipment', 'Documentation Tools', 'Quality Standards'],
    precautions: ['Follow inspection procedures', 'Document all findings', 'Use calibrated instruments', 'Report non-conformities'],
    requiredSkills: ['Quality Control', 'Measurement', 'Documentation'],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    skillRequirements: {
      skill_quality_inspection: 0.9,
      task_complexity: 0.5,
      duration_hours: 3
    }
  }
]

// Helper function to get task by ID
export function getTaskById(taskId: string): Task | undefined {
  return TASK_DEFINITIONS.find(task => task.id === taskId)
}

// Helper function to get task by name
export function getTaskByName(taskName: string): Task | undefined {
  return TASK_DEFINITIONS.find(task => task.name === taskName)
}
