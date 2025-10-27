"""
Seed script to add sample content to the database for testing
"""
import sys
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine, Base
from app.models import Content, ContentType, ContentCategory

# Sample content data
SAMPLE_CONTENT = [
    {
        "title": "Banking Fundamentals Course",
        "description": "Comprehensive guide to modern banking practices and principles. Perfect for beginners and professionals looking to refresh their knowledge.",
        "content_type": ContentType.VIDEO,
        "category": ContentCategory.EXAM_TEXT,
        "price": 15000.0,
        "is_exclusive": False,
        "is_active": True,
        "file_url": "/uploads/banking-fundamentals.mp4",
        "thumbnail_url": "/uploads/thumbnails/banking-fundamentals.jpg",
    },
    {
        "title": "CIBN Professional Certification Study Guide",
        "description": "Official CIBN certification study materials with practice questions and detailed explanations.",
        "content_type": ContentType.DOCUMENT,
        "category": ContentCategory.CIBN_PUBLICATION,
        "price": 25000.0,
        "is_exclusive": True,
        "is_active": True,
        "file_url": "/uploads/cibn-cert-guide.pdf",
        "thumbnail_url": "/uploads/thumbnails/cibn-cert.jpg",
    },
    {
        "title": "Financial Risk Management Research Paper",
        "description": "In-depth analysis of risk management strategies in modern banking institutions.",
        "content_type": ContentType.DOCUMENT,
        "category": ContentCategory.RESEARCH_PAPER,
        "price": 8000.0,
        "is_exclusive": False,
        "is_active": True,
        "file_url": "/uploads/risk-management.pdf",
        "thumbnail_url": "/uploads/thumbnails/risk-mgmt.jpg",
    },
    {
        "title": "Digital Banking Podcast Series",
        "description": "Expert interviews and discussions on the future of digital banking in Nigeria.",
        "content_type": ContentType.AUDIO,
        "category": ContentCategory.OTHER,
        "price": 5000.0,
        "is_exclusive": False,
        "is_active": True,
        "file_url": "/uploads/digital-banking-podcast.mp3",
        "thumbnail_url": "/uploads/thumbnails/podcast.jpg",
        "duration": 3600,  # 1 hour
    },
    {
        "title": "CIBN Exam Preparation Textbook (2024)",
        "description": "Latest edition of the official CIBN exam preparation textbook. Physical hardcover book.",
        "content_type": ContentType.PHYSICAL,
        "category": ContentCategory.EXAM_TEXT,
        "price": 12000.0,
        "is_exclusive": False,
        "is_active": True,
        "thumbnail_url": "/uploads/thumbnails/exam-textbook.jpg",
        "stock_quantity": 50,
    },
    {
        "title": "Corporate Finance Masterclass",
        "description": "Advanced video course covering corporate finance strategies, valuation, and financial modeling.",
        "content_type": ContentType.VIDEO,
        "category": ContentCategory.EXAM_TEXT,
        "price": 35000.0,
        "is_exclusive": False,
        "is_active": True,
        "file_url": "/uploads/corporate-finance.mp4",
        "thumbnail_url": "/uploads/thumbnails/corp-finance.jpg",
    },
    {
        "title": "Nigerian Banking Regulations Handbook",
        "description": "Complete guide to CBN regulations and compliance requirements for Nigerian banks.",
        "content_type": ContentType.DOCUMENT,
        "category": ContentCategory.CIBN_PUBLICATION,
        "price": 18000.0,
        "is_exclusive": True,
        "is_active": True,
        "file_url": "/uploads/banking-regulations.pdf",
        "thumbnail_url": "/uploads/thumbnails/regulations.jpg",
    },
    {
        "title": "CIBN Branded Notebook Set",
        "description": "Premium quality notebooks with CIBN branding. Set of 3 notebooks.",
        "content_type": ContentType.PHYSICAL,
        "category": ContentCategory.STATIONERY,
        "price": 3500.0,
        "is_exclusive": False,
        "is_active": True,
        "thumbnail_url": "/uploads/thumbnails/notebooks.jpg",
        "stock_quantity": 100,
    },
    {
        "title": "Fintech Innovation Audio Course",
        "description": "Explore the latest fintech innovations and their impact on traditional banking.",
        "content_type": ContentType.AUDIO,
        "category": ContentCategory.OTHER,
        "price": 10000.0,
        "is_exclusive": False,
        "is_active": True,
        "file_url": "/uploads/fintech-innovation.mp3",
        "thumbnail_url": "/uploads/thumbnails/fintech.jpg",
        "duration": 7200,  # 2 hours
    },
    {
        "title": "CIBN 2024 Annual Souvenir",
        "description": "Commemorative souvenir from the 2024 CIBN Annual Bankers Dinner.",
        "content_type": ContentType.PHYSICAL,
        "category": ContentCategory.SOUVENIR,
        "price": 5000.0,
        "is_exclusive": True,
        "is_active": True,
        "thumbnail_url": "/uploads/thumbnails/souvenir.jpg",
        "stock_quantity": 25,
    },
]


def seed_content():
    """Add sample content to database"""
    print("🌱 Starting content seeding...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    try:
        # Check if content already exists
        existing_count = db.query(Content).count()
        
        if existing_count > 0:
            print(f"⚠️  Database already has {existing_count} content items")
            response = input("Do you want to add more content anyway? (y/n): ")
            if response.lower() != 'y':
                print("❌ Seeding cancelled")
                return
        
        # Add sample content
        added = 0
        for content_data in SAMPLE_CONTENT:
            # Check if content with same title exists
            existing = db.query(Content).filter(Content.title == content_data["title"]).first()
            
            if existing:
                print(f"⏭️  Skipping '{content_data['title']}' - already exists")
                continue
            
            content = Content(**content_data)
            db.add(content)
            added += 1
            print(f"✅ Added: {content_data['title']}")
        
        db.commit()
        
        total = db.query(Content).count()
        print(f"\n✨ Content seeding complete!")
        print(f"📊 Added {added} new items")
        print(f"📚 Total content in database: {total}")
        
    except Exception as e:
        print(f"❌ Error seeding content: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed_content()
