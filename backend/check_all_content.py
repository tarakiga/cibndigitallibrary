import psycopg2

try:
    conn = psycopg2.connect('postgresql://cibn_user:Valerian101!@localhost:5432/cibn_library')
    cursor = conn.cursor()
    
    # Get all content
    cursor.execute("SELECT id, title, content_type FROM contents ORDER BY id")
    contents = cursor.fetchall()
    
    print("="*60)
    print("ALL CONTENT AND THEIR PURCHASE COUNTS")
    print("="*60)
    
    for content_id, title, content_type in contents:
        # Count purchases
        cursor.execute("SELECT COUNT(*) FROM purchases WHERE content_id = %s", (content_id,))
        purchase_count = cursor.fetchone()[0]
        
        can_delete = "✓ CAN DELETE" if purchase_count == 0 else f"✗ CANNOT DELETE ({purchase_count} purchases)"
        
        print(f"\nID: {content_id}")
        print(f"Title: {title}")
        print(f"Type: {content_type}")
        print(f"Purchases: {purchase_count}")
        print(f"Status: {can_delete}")
        print("-" * 60)
    
    # Summary
    cursor.execute("SELECT COUNT(*) FROM contents WHERE id NOT IN (SELECT DISTINCT content_id FROM purchases)")
    deletable_count = cursor.fetchone()[0]
    
    print(f"\n{'='*60}")
    print(f"SUMMARY: {deletable_count} content items can be safely deleted")
    print(f"{'='*60}")
    
    if deletable_count == 0:
        print("\n⚠️  ALL content has purchases!")
        print("\n💡 Solutions:")
        print("   1. Delete test purchases first:")
        print("      DELETE FROM purchases;")
        print("   2. Use deactivate instead of delete:")
        print("      PATCH /api/v1/content/{id}/deactivate")
        print("   3. Create new test content without purchases")
    
    conn.close()
except Exception as e:
    print(f"Error: {e}")
