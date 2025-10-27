"""
Tests for content endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.models import ContentType, ContentCategory


@pytest.mark.content
@pytest.mark.integration
class TestListContent:
    """Tests for listing content."""
    
    def test_list_content_public_only_no_auth(self, client: TestClient, test_content_public, test_content_exclusive):
        """Test that unauthenticated users cannot access content."""
        response = client.get("/api/v1/content")
        
        assert response.status_code == 403
    
    def test_list_content_subscriber_only_public(self, client: TestClient, user_token, test_content_public, test_content_exclusive):
        """Test that regular subscribers only see public content."""
        response = client.get(
            "/api/v1/content",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1  # Only public content
    
    def test_list_content_cibn_member_sees_all(self, client: TestClient, cibn_token, test_content_public, test_content_exclusive):
        """Test that CIBN members see all content including exclusive."""
        response = client.get(
            "/api/v1/content",
            headers={"Authorization": f"Bearer {cibn_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2  # Both public and exclusive
        titles = [item["title"] for item in data["items"]]
        assert test_content_public.title in titles
        assert test_content_exclusive.title in titles
    
    def test_list_content_with_pagination(self, client: TestClient, db, user_token):
        """Test content listing with pagination."""
        # Create multiple content items
        from app.models import Content
        for i in range(15):
            content = Content(
                title=f"Document {i}",
                description=f"Description {i}",
                content_type=ContentType.DOCUMENT,
                category=ContentCategory.RESEARCH_PAPER,
                price=1000.0 + i,
                is_exclusive=False,
                is_active=True,
                file_url=f"/uploads/doc{i}.pdf"
            )
            db.add(content)
        db.commit()
        
        # Test first page
        response = client.get(
            "/api/v1/content?page=1&page_size=10",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["page_size"] == 10
        assert len(data["items"]) == 10
        assert data["total"] == 15
        
        # Test second page
        response = client.get(
            "/api/v1/content?page=2&page_size=10",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 5
    
    def test_list_content_filter_by_type(self, client: TestClient, db, user_token):
        """Test filtering content by type."""
        from app.models import Content
        
        # Create different content types
        doc = Content(
            title="Document",
            content_type=ContentType.DOCUMENT,
            category=ContentCategory.RESEARCH_PAPER,
            price=1000.0,
            is_active=True,
            file_url="/doc.pdf"
        )
        video = Content(
            title="Video",
            content_type=ContentType.VIDEO,
            category=ContentCategory.EXAM_TEXT,
            price=2000.0,
            is_active=True,
            file_url="/video.mp4"
        )
        db.add_all([doc, video])
        db.commit()
        
        # Filter for documents only
        response = client.get(
            "/api/v1/content?content_type=document",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["content_type"] == "document"
    
    def test_list_content_filter_by_price_range(self, client: TestClient, db, user_token):
        """Test filtering content by price range."""
        from app.models import Content
        
        # Create content with different prices
        for price in [500, 1500, 3000, 5000]:
            content = Content(
                title=f"Content {price}",
                content_type=ContentType.DOCUMENT,
                category=ContentCategory.RESEARCH_PAPER,
                price=float(price),
                is_active=True,
                file_url=f"/doc{price}.pdf"
            )
            db.add(content)
        db.commit()
        
        # Filter for prices between 1000 and 4000
        response = client.get(
            "/api/v1/content?min_price=1000&max_price=4000",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        prices = [item["price"] for item in data["items"]]
        assert all(1000 <= p <= 4000 for p in prices)
    
    def test_list_content_search(self, client: TestClient, db, user_token):
        """Test searching content by title."""
        from app.models import Content
        
        content1 = Content(
            title="Python Programming Guide",
            content_type=ContentType.DOCUMENT,
            category=ContentCategory.RESEARCH_PAPER,
            price=1000.0,
            is_active=True,
            file_url="/python.pdf"
        )
        content2 = Content(
            title="JavaScript Fundamentals",
            content_type=ContentType.DOCUMENT,
            category=ContentCategory.RESEARCH_PAPER,
            price=1000.0,
            is_active=True,
            file_url="/js.pdf"
        )
        db.add_all([content1, content2])
        db.commit()
        
        # Search for "python"
        response = client.get(
            "/api/v1/content?search=python",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert "Python" in data["items"][0]["title"]


@pytest.mark.content
@pytest.mark.integration
class TestGetContent:
    """Tests for getting single content item."""
    
    def test_get_public_content_no_auth(self, client: TestClient, test_content_public):
        """Test getting public content without authentication fails."""
        response = client.get(f"/api/v1/content/{test_content_public.id}")
        
        assert response.status_code == 403
    
    def test_get_exclusive_content_no_auth(self, client: TestClient, test_content_exclusive):
        """Test that exclusive content is forbidden without auth."""
        response = client.get(f"/api/v1/content/{test_content_exclusive.id}")
        
        assert response.status_code == 403
        assert "not authenticated" in response.json()["detail"].lower()
    
    def test_get_exclusive_content_subscriber(self, client: TestClient, user_token, test_content_exclusive):
        """Test that regular subscribers cannot access exclusive content."""
        response = client.get(
            f"/api/v1/content/{test_content_exclusive.id}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 403
    
    def test_get_exclusive_content_cibn_member(self, client: TestClient, cibn_token, test_content_exclusive):
        """Test that CIBN members can access exclusive content."""
        response = client.get(
            f"/api/v1/content/{test_content_exclusive.id}",
            headers={"Authorization": f"Bearer {cibn_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_content_exclusive.id
        assert data["is_exclusive"] is True
    
    def test_get_nonexistent_content(self, client: TestClient):
        """Test getting nonexistent content returns 404."""
        response = client.get("/api/v1/content/99999")
        
        assert response.status_code == 403


@pytest.mark.content
@pytest.mark.integration
class TestCreateContent:
    """Tests for creating content (admin only)."""
    
    def test_create_content_as_admin(self, client: TestClient, admin_token):
        """Test creating content as admin."""
        response = client.post(
            "/api/v1/content",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "title": "New Document",
                "description": "A new document",
                "content_type": "document",
                "category": "research_paper",
                "price": 2500.0,
                "is_exclusive": False,
                "file_url": "/uploads/new-doc.pdf",
                "thumbnail_url": "/uploads/new-thumb.jpg"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New Document"
        assert data["price"] == 2500.0
        assert "id" in data
    
    def test_create_content_as_subscriber(self, client: TestClient, user_token):
        """Test that regular users cannot create content."""
        response = client.post(
            "/api/v1/content",
            headers={"Authorization": f"Bearer {user_token}"},
            json={
                "title": "Unauthorized Content",
                "content_type": "document",
                "category": "research_paper",
                "price": 1000.0
            }
        )
        
        assert response.status_code == 403
    
    def test_create_content_no_auth(self, client: TestClient):
        """Test that unauthenticated users cannot create content."""
        response = client.post(
            "/api/v1/content",
            json={
                "title": "Unauthorized Content",
                "content_type": "document",
                "category": "research_paper",
                "price": 1000.0
            }
        )
        
        assert response.status_code == 403


@pytest.mark.content
@pytest.mark.integration
class TestUpdateContent:
    """Tests for updating content (admin only)."""
    
    def test_update_content_as_admin(self, client: TestClient, admin_token, test_content_public):
        """Test updating content as admin."""
        response = client.patch(
            f"/api/v1/content/{test_content_public.id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "title": "Updated Title",
                "price": 1500.0
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["price"] == 1500.0
    
    def test_update_content_as_subscriber(self, client: TestClient, user_token, test_content_public):
        """Test that regular users cannot update content."""
        response = client.patch(
            f"/api/v1/content/{test_content_public.id}",
            headers={"Authorization": f"Bearer {user_token}"},
            json={"title": "Hacked Title"}
        )
        
        assert response.status_code == 403
    
    def test_update_nonexistent_content(self, client: TestClient, admin_token):
        """Test updating nonexistent content returns 404."""
        response = client.patch(
            "/api/v1/content/99999",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"title": "New Title"}
        )
        
        assert response.status_code == 404


@pytest.mark.content
@pytest.mark.integration
class TestDeleteContent:
    """Tests for deleting content (admin only)."""
    
    def test_delete_content_as_admin(self, client: TestClient, admin_token, test_content_public):
        """Test deleting content as admin."""
        content_id = test_content_public.id
        
        response = client.delete(
            f"/api/v1/content/{content_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 204
        
        # Verify content is deleted
        response = client.get(
            f"/api/v1/content/{content_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404
    
    def test_delete_content_as_subscriber(self, client: TestClient, user_token, test_content_public):
        """Test that regular users cannot delete content."""
        response = client.delete(
            f"/api/v1/content/{test_content_public.id}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 403
    
    def test_delete_nonexistent_content(self, client: TestClient, admin_token):
        """Test deleting nonexistent content returns 404."""
        response = client.delete(
            "/api/v1/content/99999",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 404
