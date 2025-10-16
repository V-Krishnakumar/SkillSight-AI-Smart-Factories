import { useState } from "react";
import Navbar from "@/components/Navbar";
import ChatbotWidget from "@/components/ChatbotWidget";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tasks, workers, assignments, kpiData } from "@/data/demoData";
import { motion } from "framer-motion";
import { Info, TrendingUp, Users, Target, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ManagerDashboard = () => {
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);

  const getWorkerById = (id: string) => workers.find(w => w.id === id);
  const getTaskById = (id: string) => tasks.find(t => t.id === id);
  const getAssignment = (taskId: string) => assignments.find(a => a.taskId === taskId);

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2">
            Manager <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            AI-powered workforce optimization and task management
          </p>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: TrendingUp, label: "Avg Efficiency", value: `${kpiData.avgEfficiency}%`, color: "from-primary to-accent" },
              { icon: Users, label: "Top Worker", value: kpiData.topWorker, color: "from-accent to-primary" },
              { icon: Target, label: "Skill Gap", value: `${kpiData.skillGapPercent}%`, color: "from-primary to-accent" },
              { icon: Clock, label: "Avg Time", value: kpiData.avgCompletionTime, color: "from-accent to-primary" }
            ].map((kpi, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-hover p-6 rounded-xl"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-3`}>
                  <kpi.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="text-2xl font-bold text-gradient mb-1">{kpi.value}</div>
                <div className="text-sm text-muted-foreground">{kpi.label}</div>
              </motion.div>
            ))}
          </div>

          <Tabs defaultValue="assignment" className="space-y-6">
            <TabsList className="glass">
              <TabsTrigger value="assignment">Task Assignment</TabsTrigger>
              <TabsTrigger value="simulation">Simulation</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="assignment" className="space-y-4">
              <div className="glass p-6 rounded-xl">
                <h2 className="text-2xl font-semibold mb-4">AI Task Assignment Panel</h2>
                <p className="text-muted-foreground mb-6">
                  Optimized worker assignments based on skills, performance, and availability
                </p>

                <div className="space-y-4">
                  {tasks.map((task, idx) => {
                    const assignment = getAssignment(task.id);
                    const worker = assignment ? getWorkerById(assignment.workerId) : null;

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-hover p-4 rounded-lg"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{task.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {task.requiredSkills.map(skill => (
                                <span key={skill} className="text-xs px-2 py-1 rounded-full glass">
                                  {skill}
                                </span>
                              ))}
                            </div>
                            {worker && (
                              <div className="flex items-center gap-3 mt-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                    <span className="text-xs font-bold text-primary-foreground">
                                      {worker.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium">{worker.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {worker.skillMatch}% match • {worker.availability}
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
                            )}
                          </div>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="glass-hover">
                                <Info className="w-4 h-4 mr-2" />
                                Explain
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="glass max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-gradient">AI Assignment Reasoning</DialogTitle>
                                <DialogDescription>
                                  Why {worker?.name} was selected for {task.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div className="glass p-4 rounded-lg">
                                  <h4 className="font-semibold mb-2">AI Analysis</h4>
                                  <p className="text-muted-foreground">{assignment?.aiReason}</p>
                                </div>
                                {worker && (
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="glass p-4 rounded-lg">
                                      <div className="text-sm text-muted-foreground mb-1">Skill Match</div>
                                      <div className="text-2xl font-bold text-gradient">{worker.skillMatch}%</div>
                                    </div>
                                    <div className="glass p-4 rounded-lg">
                                      <div className="text-sm text-muted-foreground mb-1">Performance</div>
                                      <div className="text-2xl font-bold text-gradient">{worker.performance}%</div>
                                    </div>
                                    <div className="glass p-4 rounded-lg">
                                      <div className="text-sm text-muted-foreground mb-1">Accuracy</div>
                                      <div className="text-2xl font-bold text-gradient">{worker.accuracy}%</div>
                                    </div>
                                    <div className="glass p-4 rounded-lg">
                                      <div className="text-sm text-muted-foreground mb-1">Speed</div>
                                      <div className="text-2xl font-bold text-gradient">{worker.speed}%</div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="simulation" className="space-y-4">
              <div className="glass p-6 rounded-xl">
                <h2 className="text-2xl font-semibold mb-4">What-If Simulation</h2>
                <p className="text-muted-foreground mb-6">
                  Analyze productivity impact when workers are unavailable
                </p>

                <div className="space-y-4">
                  <select
                    onChange={(e) => setSelectedWorker(e.target.value)}
                    className="w-full glass px-4 py-2 rounded-lg"
                  >
                    <option value="">Select a worker...</option>
                    {workers.map(worker => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name}
                      </option>
                    ))}
                  </select>

                  {selectedWorker && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass p-6 rounded-lg space-y-4"
                    >
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gradient mb-2">-18%</div>
                        <div className="text-muted-foreground">Estimated Productivity Impact</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-destructive">+2.5h</div>
                          <div className="text-sm text-muted-foreground">Task Duration</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">3</div>
                          <div className="text-sm text-muted-foreground">Tasks Affected</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-accent">High</div>
                          <div className="text-sm text-muted-foreground">Priority</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="glass p-6 rounded-xl">
                <h2 className="text-2xl font-semibold mb-6">Performance Dashboard</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {workers.map((worker, idx) => (
                    <motion.div
                      key={worker.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass-hover p-4 rounded-lg"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow">
                          <span className="font-bold text-primary-foreground">
                            {worker.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold">{worker.name}</div>
                          <div className="text-sm text-muted-foreground">{worker.xpPoints} XP</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Performance</span>
                          <span className="font-medium">{worker.performance}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full glass overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${worker.performance}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        {worker.badges.map(badge => (
                          <span
                            key={badge}
                            className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <ChatbotWidget />
    </div>
  );
};

export default ManagerDashboard;
