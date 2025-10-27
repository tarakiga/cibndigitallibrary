import psycopg2

try:
    conn = psycopg2.connect('postgresql://cibn_user:Valerian101!@localhost:5432/cibn_library')
    cursor = conn.cursor()
    
    # Check purchases for content ID 10
    cursor.execute("SELECT COUNT(*) FROM purchases WHERE content_id = 10")
    count = cursor.fetchone()[0]
    print(f"Purchases for content ID 10: {count}")
    
    if count > 0:
        cursor.execute("SELECT id, user_id, content_id, created_at FROM purchases WHERE content_id = 10")
        purchases = cursor.fetchall()
        print("\nPurchase details:")
        for p in purchases:
            print(f"  Purchase ID: {p[0]}, User ID: {p[1]}, Content ID: {p[2]}, Date: {p[3]}")
        
        print(f"\n⚠️ Content ID 10 has {count} purchases and cannot be deleted.")
        print("💡 Solution: Use the deactivate endpoint instead:")
        print("   PATCH /api/v1/content/10/deactivate")
    else:
        print("\n✓ Content ID 10 has no purchases and can be safely deleted.")
    
    conn.close()
except Exception as e:
    print(f"Error: {e}")
