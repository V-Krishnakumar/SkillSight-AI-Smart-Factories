import Navbar from "@/components/Navbar";
import { tasks, workers, assignments } from "@/data/demoData";
import { motion } from "framer-motion";
import { Brain, Shield, TrendingUp } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend
} from "recharts";

const Explainability = () => {
  const getWorkerById = (id: string) => workers.find(w => w.id === id);
  const getTaskById = (id: string) => tasks.find(t => t.id === id);

  const getRadarData = (workerId: string) => {
    const worker = getWorkerById(workerId);
    if (!worker) return [];
    
    return [
      { subject: "Skill", value: worker.skillMatch },
      { subject: "Experience", value: worker.experience },
      { subject: "Accuracy", value: worker.accuracy },
      { subject: "Speed", value: worker.speed },
      { subject: "Performance", value: worker.performance },
    ];
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2">
            AI <span className="text-gradient">Explainability</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Transparent and interpretable AI decision-making process
          </p>

          {/* Key Principles */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Brain,
                title: "Transparent Logic",
                description: "Every assignment decision is backed by clear reasoning and data"
              },
              {
                icon: Shield,
                title: "Fair & Unbiased",
                description: "Algorithm ensures equitable task distribution across all workers"
              },
              {
                icon: TrendingUp,
                title: "Continuous Learning",
                description: "System improves accuracy based on feedback and outcomes"
              }
            ].map((principle, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-hover p-6 rounded-xl"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 glow">
                  <principle.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">{principle.title}</h3>
                <p className="text-sm text-muted-foreground">{principle.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Task-by-Task Breakdown */}
          <div className="space-y-8">
            {assignments.map((assignment, idx) => {
              const task = getTaskById(assignment.taskId);
              const worker = getWorkerById(assignment.workerId);
              if (!task || !worker) return null;

              return (
                <motion.div
                  key={assignment.taskId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className="glass p-6 rounded-xl"
                >
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{task.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {task.requiredSkills.map(skill => (
                              <span
                                key={skill}
                                className="text-xs px-2 py-1 rounded-full glass"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="glass-hover p-4 rounded-lg mb-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow">
                            <span className="text-sm font-bold text-primary-foreground">
                              {worker.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold">{worker.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Assigned Worker
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {worker.badges.map(badge => (
                            <span
                              key={badge}
                              className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="glass-hover p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-primary" />
                          AI Reasoning
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {assignment.aiReason}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-4 text-center">Skill Assessment Radar</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={getRadarData(worker.id)}>
                          <PolarGrid strokeOpacity={0.2} />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                          />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                          <Radar
                            name={worker.name}
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.3}
                          />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>

                      <div className="grid grid-cols-2 gap-3 mt-6">
                        <div className="glass-hover p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-gradient">{worker.skillMatch}%</div>
                          <div className="text-xs text-muted-foreground">Skill Match</div>
                        </div>
                        <div className="glass-hover p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-gradient">{worker.performance}%</div>
                          <div className="text-xs text-muted-foreground">Performance</div>
                        </div>
                        <div className="glass-hover p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-gradient">{worker.accuracy}%</div>
                          <div className="text-xs text-muted-foreground">Accuracy</div>
                        </div>
                        <div className="glass-hover p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-gradient">{worker.speed}%</div>
                          <div className="text-xs text-muted-foreground">Speed</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Fairness Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass p-6 rounded-xl mt-12"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              Fairness & <span className="text-gradient">Transparency Metrics</span>
            </h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { label: "Task Distribution Equity", value: "94%", desc: "Fair workload across team" },
                { label: "Bias-Free Decisions", value: "100%", desc: "No demographic bias detected" },
                { label: "Worker Satisfaction", value: "88%", desc: "Based on feedback surveys" },
                { label: "Decision Accuracy", value: "92%", desc: "Validated against outcomes" }
              ].map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-hover p-4 rounded-lg text-center"
                >
                  <div className="text-3xl font-bold text-gradient mb-2">{metric.value}</div>
                  <div className="font-medium mb-1">{metric.label}</div>
                  <div className="text-xs text-muted-foreground">{metric.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Explainability;
