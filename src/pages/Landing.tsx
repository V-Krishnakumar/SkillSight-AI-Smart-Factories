import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  Target,
  Video,
  MessageSquare,
  Trophy,
  ChevronRight,
  Sparkles,
  Users,
  BarChart3
} from "lucide-react";

const Landing = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Task Assignment",
      description: "Intelligent worker-task matching using machine learning algorithms"
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Forecast productivity and identify potential bottlenecks"
    },
    {
      icon: Target,
      title: "Skill Growth Recommender",
      description: "Personalized training paths for continuous improvement"
    },
    {
      icon: Video,
      title: "Demo Videos",
      description: "Interactive task tutorials with step-by-step guidance"
    },
    {
      icon: MessageSquare,
      title: "Multilingual Chatbots",
      description: "24/7 support in English, Tamil, and more languages"
    },
    {
      icon: Trophy,
      title: "Gamified Learning",
      description: "XP points, badges, and leaderboards to boost engagement"
    }
  ];

  const timeline = [
    {
      step: "1",
      title: "Upload Workforce Data",
      description: "Import employee skills, experience, and performance metrics"
    },
    {
      step: "2",
      title: "AI Analyzes & Matches",
      description: "Our algorithms find optimal worker-task combinations"
    },
    {
      step: "3",
      title: "Track & Optimize",
      description: "Monitor real-time performance and continuous improvements"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-background opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm">Powered by Advanced AI</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gradient">SkillSight AI</span>
              <br />
              <span className="text-foreground">Intelligent Workforce</span>
              <br />
              <span className="text-foreground">Role Optimizer</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Revolutionize your workforce management with AI-powered task assignment,
              predictive analytics, and personalized skill development.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/manager">
                <Button size="lg" className="glow group">
                  Try Demo
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/manager">
                <Button size="lg" variant="secondary" className="glass-hover">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto"
          >
            {[
              { icon: Users, label: "Active Workers", value: "500+" },
              { icon: BarChart3, label: "Efficiency Boost", value: "35%" },
              { icon: Trophy, label: "Tasks Completed", value: "10K+" }
            ].map((stat, idx) => (
              <div key={idx} className="glass-hover p-6 rounded-2xl text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful <span className="text-gradient">Features</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to optimize your workforce
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-hover p-6 rounded-2xl group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 glow group-hover:glow-strong transition-all">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Timeline */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to workforce optimization
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {timeline.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="flex gap-6 mb-12 last:mb-0"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold glow">
                    {item.step}
                  </div>
                </div>
                <div className="glass-hover p-6 rounded-2xl flex-1">
                  <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {idx < timeline.length - 1 && (
                  <div className="w-0.5 bg-gradient-to-b from-primary to-accent ml-8 -mb-12" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
