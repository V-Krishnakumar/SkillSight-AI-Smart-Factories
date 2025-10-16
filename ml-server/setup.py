#!/usr/bin/env python3
"""
Setup script for the SkillSight AI ML Prediction Server
"""

import os
import sys
import subprocess

def install_requirements():
    """Install Python requirements"""
    print("Installing Python requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        return False

def check_model_file():
    """Check if model file exists"""
    pkl_files = [f for f in os.listdir('.') if f.endswith('.pkl')]
    
    if not pkl_files:
        print("⚠️  No .pkl files found in the ml-server directory.")
        print("Please copy your trained model (.pkl file) to this directory.")
        print("Example: cp /path/to/your/model.pkl ./")
        return False
    else:
        print(f"✅ Found model file(s): {', '.join(pkl_files)}")
        return True

def main():
    print("🚀 Setting up SkillSight AI ML Prediction Server")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('app.py'):
        print("❌ Please run this script from the ml-server directory")
        return
    
    # Install requirements
    if not install_requirements():
        return
    
    # Check for model file
    model_exists = check_model_file()
    
    print("\n" + "=" * 50)
    if model_exists:
        print("✅ Setup complete! You can now start the server with:")
        print("   python app.py")
        print("\nThe server will be available at: http://localhost:8000")
    else:
        print("⚠️  Setup complete, but you need to add your .pkl model file.")
        print("Once you add it, start the server with:")
        print("   python app.py")

if __name__ == "__main__":
    main()
