import os
from pathlib import Path

uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

print("Creating better sample files...")

# 1. Create a simple PDF-like file (HTML that browsers can render)
pdf_content = """<!DOCTYPE html>
<html>
<head>
    <title>Sample Banking Document</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #002366; }
        p { line-height: 1.6; }
    </style>
</head>
<body>
    <h1>Banking Industry Guidelines</h1>
    <h2>Chapter 1: Introduction</h2>
    <p>This document outlines the fundamental principles and guidelines for banking professionals in Nigeria.</p>
    
    <h2>Key Points</h2>
    <ul>
        <li>Ethical banking practices</li>
        <li>Customer service excellence</li>
        <li>Risk management protocols</li>
        <li>Regulatory compliance</li>
    </ul>
    
    <h2>Professional Standards</h2>
    <p>All banking professionals must adhere to the highest standards of integrity and professionalism...</p>
    
    <p style="margin-top: 50px; text-align: center; color: #666;">
        © 2024 CIBN Digital Library - Sample Document
    </p>
</body>
</html>"""

with open(uploads_dir / "sample_document.pdf", "w", encoding="utf-8") as f:
    f.write(pdf_content)

print("✓ Created sample_document.pdf")

# 2. Create a simple HTML video player (since we can't create actual video)
video_content = """<!DOCTYPE html>
<html>
<head>
    <title>Sample Banking Video</title>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            background: linear-gradient(135deg, #002366 0%, #059669 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            color: white;
            font-family: Arial, sans-serif;
        }
        .content {
            text-align: center;
            padding: 40px;
        }
        h1 { font-size: 48px; margin-bottom: 20px; }
        p { font-size: 24px; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="content">
        <h1>🎥 Banking Tutorial Video</h1>
        <p>Introduction to Modern Banking Practices</p>
        <p style="margin-top: 40px; font-size: 18px;">Duration: 15:30</p>
        <p style="font-size: 16px; opacity: 0.7;">Sample video content for testing</p>
    </div>
</body>
</html>"""

with open(uploads_dir / "sample_video.mp4", "w", encoding="utf-8") as f:
    f.write(video_content)

print("✓ Created sample_video.mp4")

# 3. Create sample audio HTML (since we can't create actual audio)
audio_content = """<!DOCTYPE html>
<html>
<head>
    <title>Sample Banking Audio</title>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            background: linear-gradient(135deg, #059669 0%, #002366 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            color: white;
            font-family: Arial, sans-serif;
        }
        .content {
            text-align: center;
            padding: 40px;
        }
        h1 { font-size: 48px; margin-bottom: 20px; }
        .pulse {
            width: 100px;
            height: 100px;
            background: rgba(255,255,255,0.3);
            border-radius: 50%;
            margin: 20px auto;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
        }
    </style>
</head>
<body>
    <div class="content">
        <div class="pulse">🎵</div>
        <h1>Banking Podcast</h1>
        <p>Financial Literacy Series - Episode 1</p>
        <p style="margin-top: 40px; font-size: 18px;">Duration: 25:45</p>
        <p style="font-size: 16px; opacity: 0.7;">Sample audio content for testing</p>
    </div>
</body>
</html>"""

with open(uploads_dir / "sample_audio1.mp3", "w", encoding="utf-8") as f:
    f.write(audio_content)

audio_content2 = audio_content.replace("Episode 1", "Episode 2").replace("25:45", "18:30")
with open(uploads_dir / "sample_audio2.mp3", "w", encoding="utf-8") as f:
    f.write(audio_content2)

print("✓ Created sample_audio1.mp3")
print("✓ Created sample_audio2.mp3")

print("\n" + "="*50)
print("Sample files created successfully!")
print("\nThese are HTML files that will display nicely in the viewers.")
print("For production, replace with actual PDF/MP4/MP3 files.")
print("="*50)
