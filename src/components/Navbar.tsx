import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent glow">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">SkillSight AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/manager">
              <Button
                variant={isActive("/manager") ? "default" : "ghost"}
                className="glass-hover"
              >
                Manager
              </Button>
            </Link>
            <Link to="/worker">
              <Button
                variant={isActive("/worker") ? "default" : "ghost"}
                className="glass-hover"
              >
                Worker
              </Button>
            </Link>
            <Link to="/explainability">
              <Button
                variant={isActive("/explainability") ? "default" : "ghost"}
                className="glass-hover"
              >
                Explainability
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="default" className="glow">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
