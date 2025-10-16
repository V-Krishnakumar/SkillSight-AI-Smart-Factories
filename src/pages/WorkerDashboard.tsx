import { useState } from "react";
import Navbar from "@/components/Navbar";
import ChatbotWidget from "@/components/ChatbotWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tasks, workers } from "@/data/demoData";
import { motion } from "framer-motion";
import { Trophy, Star, Send, Globe } from "lucide-react";

const WorkerDashboard = () => {
  const [language, setLanguage] = useState<"en" | "ta">("en");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const currentWorker = workers[0];
  const assignedTask = tasks[0];

  const handleAskQuestion = () => {
    setAnswer(
      language === "en"
        ? "To assemble the engine, first ensure all parts are clean and organized. Follow the assembly manual step by step, starting with the base components. Always wear safety gear and double-check torque specifications."
        : "இயந்திரத்தை சேர்க்க, முதலில் அனைத்து பாகங்களும் சுத்தமாகவும் ஒழுங்காகவும் உள்ளதை உறுதிப்படுத்தவும். அடிப்படை கூறுகளுடன் தொடங்கி, படிப்படியாக அசெம்பிள் கையேட்டைப் பின்பற்றவும்."
    );
    setQuestion("");
  };

  const text = {
    en: {
      title: "Worker Dashboard",
      subtitle: "Your personalized workspace and learning hub",
      todaysTask: "Today's Assignment",
      taskVideo: "Task Demo Video",
      performance: "Your Performance",
      xpPoints: "XP Points",
      badges: "Badges Earned",
      askDoubt: "Ask a Question",
      askPlaceholder: "How do I perform this task?",
      switchLang: "Switch to Tamil"
    },
    ta: {
      title: "பணியாளர் டாஷ்போர்ட்",
      subtitle: "உங்கள் தனிப்பயனாக்கப்பட்ட பணியிடம் மற்றும் கற்றல் மையம்",
      todaysTask: "இன்றைய பணி",
      taskVideo: "பணி செய்முறை வீடியோ",
      performance: "உங்கள் செயல்திறன்",
      xpPoints: "XP புள்ளிகள்",
      badges: "பெற்ற பேட்ஜ்கள்",
      askDoubt: "கேள்வி கேளுங்கள்",
      askPlaceholder: "இந்த பணியை எப்படி செய்வது?",
      switchLang: "Switch to English"
    }
  };

  const t = text[language];

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {t.title.split(' ')[0]} <span className="text-gradient">{t.title.split(' ')[1]}</span>
              </h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
            
            <Button
              onClick={() => setLanguage(lang => lang === "en" ? "ta" : "en")}
              className="glass-hover"
            >
              <Globe className="w-4 h-4 mr-2" />
              {t.switchLang}
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Performance Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-6 rounded-xl"
            >
              <h3 className="font-semibold mb-4">{t.performance}</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow">
                    <span className="font-bold text-primary-foreground">
                      {currentWorker.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{currentWorker.name}</div>
                    <div className="text-sm text-muted-foreground">{currentWorker.availability}</div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{t.xpPoints}</span>
                    <span className="font-bold text-gradient">{currentWorker.xpPoints}</span>
                  </div>
                  <div className="w-full h-3 rounded-full glass overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent glow"
                      style={{ width: `${(currentWorker.xpPoints / 3000) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">{t.badges}</div>
                  <div className="flex gap-2 flex-wrap">
                    {currentWorker.badges.map(badge => (
                      <div
                        key={badge}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
                      >
                        <Trophy className="w-3 h-3" />
                        <span className="text-xs font-medium">{badge}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gradient">{currentWorker.performance}%</div>
                    <div className="text-xs text-muted-foreground">Performance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gradient">{currentWorker.accuracy}%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Today's Task */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="glass p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{t.todaysTask}</h3>
                </div>
                
                <div className="glass-hover p-4 rounded-lg mb-4">
                  <h4 className="text-xl font-bold mb-2">{assignedTask.name}</h4>
                  <p className="text-muted-foreground mb-3">{assignedTask.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {assignedTask.requiredSkills.map(skill => (
                      <span
                        key={skill}
                        className="text-xs px-2 py-1 rounded-full glass"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="glass-hover p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">{t.taskVideo}</h4>
                  <div className="aspect-video rounded-lg overflow-hidden glass">
                    <iframe
                      src={assignedTask.videoUrl}
                      title={assignedTask.name}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>

              {/* Ask Question Section */}
              <div className="glass p-6 rounded-xl">
                <h3 className="font-semibold mb-4">{t.askDoubt}</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder={t.askPlaceholder}
                      className="glass"
                      onKeyPress={(e) => e.key === "Enter" && handleAskQuestion()}
                    />
                    <Button onClick={handleAskQuestion} className="glow">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  {answer && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-hover p-4 rounded-lg"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                          <span className="text-xs">AI</span>
                        </div>
                        <p className="text-sm">{answer}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <ChatbotWidget />
    </div>
  );
};

export default WorkerDashboard;
