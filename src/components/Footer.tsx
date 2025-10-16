import { Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="glass border-t mt-20">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-foreground font-semibold">SkillSight AI Team</p>
            <p className="text-muted-foreground text-sm mt-1">
              Intelligent Workforce Role Optimizer
            </p>
          </div>
          
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 glass-hover px-4 py-2 rounded-lg"
          >
            <Github className="w-5 h-5" />
            <span>View on GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
