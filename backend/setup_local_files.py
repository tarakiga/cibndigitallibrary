import psycopg2
import os

# Create sample files in uploads directory
uploads_dir = "uploads"
os.makedirs(uploads_dir, exist_ok=True)

print("Creating sample files...")

# Create sample document (text file as placeholder)
with open(os.path.join(uploads_dir, "sample_document.pdf"), "w") as f:
    f.write("Sample PDF document for testing")

# Create sample video (text file as placeholder)
with open(os.path.join(uploads_dir, "sample_video.mp4"), "w") as f:
    f.write("Sample video file for testing")

# Create sample audio files (text files as placeholders)
with open(os.path.join(uploads_dir, "sample_audio1.mp3"), "w") as f:
    f.write("Sample audio file 1 for testing")

with open(os.path.join(uploads_dir, "sample_audio2.mp3"), "w") as f:
    f.write("Sample audio file 2 for testing")

print("Sample files created!")

# Update database URLs
try:
    conn = psycopg2.connect('postgresql://cibn_user:Valerian101!@localhost:5432/cibn_library')
    cursor = conn.cursor()
    
    # Get current content
    cursor.execute("SELECT id, title, content_type, file_url FROM contents")
    contents = cursor.fetchall()
    
    print("\nUpdating database URLs...")
    
    # Map content to sample files
    file_mapping = {
        'DOCUMENT': 'sample_document.pdf',
        'VIDEO': 'sample_video.mp4',
        'AUDIO': 'sample_audio1.mp3'
    }
    
    for content_id, title, content_type, old_url in contents:
        # Determine filename based on content type
        if content_type in file_mapping:
            if content_type == 'AUDIO' and 'audio2' in title.lower():
                filename = 'sample_audio2.mp3'
            else:
                filename = file_mapping[content_type]
            
            # Create new URL pointing to local backend
            new_url = f"http://localhost:8000/uploads/{filename}"
            
            # Update database
            cursor.execute(
                "UPDATE contents SET file_url = %s WHERE id = %s",
                (new_url, content_id)
            )
            
            print(f"Updated content ID {content_id} ({title}):")
            print(f"  Old: {old_url}")
            print(f"  New: {new_url}")
    
    conn.commit()
    print("\n✓ Database updated successfully!")
    
    # Verify updates
    cursor.execute("SELECT id, title, content_type, file_url FROM contents")
    updated_contents = cursor.fetchall()
    
    print("\n=== Updated Content ===")
    for content_id, title, content_type, file_url in updated_contents:
        print(f"\nID: {content_id}")
        print(f"Title: {title}")
        print(f"Type: {content_type}")
        print(f"File URL: {file_url}")
    
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50)
print("Setup complete!")
print("\nNext steps:")
print("1. Make sure the backend API serves files from /uploads")
print("2. Test accessing: http://localhost:8000/uploads/sample_document.pdf")
print("="*50)
