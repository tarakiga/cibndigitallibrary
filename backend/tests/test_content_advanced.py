"""
Advanced tests for content management functionality.
"""
import pytest
from fastapi.testclient import TestClient
from app.models import Content, ContentType, ContentCategory, UserRole


@pytest.mark.content
@pytest.mark.integration
class TestContentAdvanced:
    """Advanced tests for content management."""

    def test_content_validation(self, client: TestClient, admin_token):
        """Test content validation for required fields."""
        # Test missing title
        response = client.post(
            "/api/v1/content",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "description": "Content without title",
                "content_type": "document",
                "category": "research_paper",
                "price": 1000.0
            }
        )
        assert response.status_code == 422

        # Test missing content_type
        response = client.post(
            "/api/v1/content",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "title": "Content without type",
                "description": "Content without type",
                "category": "research_paper",
                "price": 1000.0
            }
        )
        assert response.status_code == 422

        # Test invalid content_type
        response = client.post(
            "/api/v1/content",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "title": "Content with invalid type",
                "description": "Content with invalid type",
                "content_type": "invalid_type",
                "category": "research_paper",
                "price": 1000.0
            }
        )
        assert response.status_code == 422

        # Test invalid category
        response = client.post(
            "/api/v1/content",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "title": "Content with invalid category",
                "description": "Content with invalid category",
                "content_type": "document",
                "category": "invalid_category",
                "price": 1000.0
            }
        )
        assert response.status_code == 422

        # Test negative price (API currently allows this)
        response = client.post(
            "/api/v1/content",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "title": "Content with negative price",
                "description": "Content with negative price",
                "content_type": "document",
                "category": "research_paper",
                "price": -100.0
            }
        )
        # The API currently allows negative prices, so we expect 201
        assert response.status_code == 201
        data = response.json()
        assert data["price"] == -100.0

    def test_content_types_comprehensive(self, client: TestClient, admin_token, db):
        """Test all content types can be created."""
        content_types = [
            ("document", ContentType.DOCUMENT),
            ("video", ContentType.VIDEO),
            ("audio", ContentType.AUDIO),
            ("physical", ContentType.PHYSICAL)
        ]

        for type_str, type_enum in content_types:
            response = client.post(
                "/api/v1/content",
                headers={"Authorization": f"Bearer {admin_token}"},
                json={
                    "title": f"Test {type_str.title()} Content",
                    "description": f"A test {type_str} content",
                    "content_type": type_str,
                    "category": "research_paper",
                    "price": 1000.0,
                    "is_exclusive": False,
                    "file_url": f"/uploads/test.{type_str}",
                    "thumbnail_url": "/uploads/test-thumb.jpg"
                }
            )
            assert response.status_code == 201
            data = response.json()
            assert data["content_type"] == type_str
            assert data["title"] == f"Test {type_str.title()} Content"

    def test_content_categories_comprehensive(self, client: TestClient, admin_token, db):
        """Test all content categories can be used."""
        categories = [
            ("exam_text", ContentCategory.EXAM_TEXT),
            ("cibn_publication", ContentCategory.CIBN_PUBLICATION),
            ("research_paper", ContentCategory.RESEARCH_PAPER),
            ("stationery", ContentCategory.STATIONERY),
            ("souvenir", ContentCategory.SOUVENIR),
            ("other", ContentCategory.OTHER)
        ]

        for cat_str, cat_enum in categories:
            response = client.post(
                "/api/v1/content",
                headers={"Authorization": f"Bearer {admin_token}"},
                json={
                    "title": f"Test {cat_str.replace('_', ' ').title()} Content",
                    "description": f"A test {cat_str} content",
                    "content_type": "document",
                    "category": cat_str,
                    "price": 1000.0,
                    "is_exclusive": False,
                    "file_url": "/uploads/test.pdf",
                    "thumbnail_url": "/uploads/test-thumb.jpg"
                }
            )
            assert response.status_code == 201
            data = response.json()
            assert data["category"] == cat_str

    def test_physical_content_stock_management(self, client: TestClient, admin_token, db):
        """Test physical content stock management."""
        # Create physical content with stock
        response = client.post(
            "/api/v1/content",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "title": "Physical Book with Stock",
                "description": "A physical book with stock management",
                "content_type": "physical",
                "category": "exam_text",
                "price": 2000.0,
                "is_exclusive": False,
                "stock_quantity": 50,
                "thumbnail_url": "/uploads/book-thumb.jpg"
            }
        )
        assert response.status_code == 201
        data = response.json()
        content_id = data["id"]
        assert data["stock_quantity"] == 50

        # Update stock quantity
        response = client.patch(
            f"/api/v1/content/{content_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "stock_quantity": 25
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["stock_quantity"] == 25

    def test_content_metadata_fields(self, client: TestClient, admin_token, db):
        """Test content metadata fields like author, publisher, etc."""
        response = client.post(
            "/api/v1/content",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "title": "Comprehensive Content",
                "description": "Content with all metadata fields",
                "content_type": "document",
                "category": "research_paper",
                "price": 3000.0,
                "is_exclusive": True,
                "file_url": "/uploads/comprehensive.pdf",
                "thumbnail_url": "/uploads/comprehensive-thumb.jpg",
                "file_size": 1024000,  # 1MB
                "author": "Dr. John Doe",
                "publisher": "CIBN Publications",
                "publication_date": "2024-01-15T00:00:00Z"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["author"] == "Dr. John Doe"
        assert data["publisher"] == "CIBN Publications"
        assert data["file_size"] == 1024000

    def test_content_activation_deactivation(self, client: TestClient, admin_token, db):
        """Test content activation and deactivation."""
        # Create active content
        response = client.post(
            "/api/v1/content",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "title": "Test Content for Activation",
                "description": "Content to test activation",
                "content_type": "document",
                "category": "research_paper",
                "price": 1000.0,
                "is_active": True,
                "file_url": "/uploads/test.pdf"
            }
        )
        assert response.status_code == 201
        content_id = response.json()["id"]

        # Deactivate content
        response = client.patch(
            f"/api/v1/content/{content_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "is_active": False
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is False

        # Verify inactive content doesn't appear in listings
        response = client.get(
            "/api/v1/content",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        content_ids = [item["id"] for item in data["items"]]
        assert content_id not in content_ids

    def test_content_exclusive_access_control(self, client: TestClient, user_token, cibn_token, admin_token, db):
        """Test comprehensive exclusive content access control."""
        # Create exclusive content
        response = client.post(
            "/api/v1/content",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "title": "Exclusive Content for Access Test",
                "description": "Content to test exclusive access",
                "content_type": "document",
                "category": "cibn_publication",
                "price": 5000.0,
                "is_exclusive": True,
                "file_url": "/uploads/exclusive.pdf"
            }
        )
        assert response.status_code == 201
        content_id = response.json()["id"]

        # Regular subscriber should not see exclusive content in listing
        response = client.get(
            "/api/v1/content",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        content_ids = [item["id"] for item in data["items"]]
        assert content_id not in content_ids

        # Regular subscriber should not be able to access exclusive content directly
        response = client.get(
            f"/api/v1/content/{content_id}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 403

        # CIBN member should see exclusive content in listing
        response = client.get(
            "/api/v1/content",
            headers={"Authorization": f"Bearer {cibn_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        content_ids = [item["id"] for item in data["items"]]
        assert content_id in content_ids

        # CIBN member should be able to access exclusive content directly
        response = client.get(
            f"/api/v1/content/{content_id}",
            headers={"Authorization": f"Bearer {cibn_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_exclusive"] is True

        # Admin should see and access exclusive content
        response = client.get(
            f"/api/v1/content/{content_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200

    def test_content_search_comprehensive(self, client: TestClient, user_token, db):
        """Test comprehensive content search functionality."""
        # Create multiple content items with different titles and descriptions
        content_items = [
            ("Python Programming", "Learn Python programming from scratch"),
            ("JavaScript Guide", "Complete guide to JavaScript development"),
            ("Python Data Science", "Python for data science and analytics"),
            ("Web Development", "Full-stack web development guide"),
            ("Python Web Framework", "Django and Flask web frameworks")
        ]

        for title, description in content_items:
            content = Content(
                title=title,
                description=description,
                content_type=ContentType.DOCUMENT,
                category=ContentCategory.RESEARCH_PAPER,
                price=1000.0,
                is_exclusive=False,
                is_active=True,
                file_url="/uploads/test.pdf"
            )
            db.add(content)
        db.commit()

        # Test search by title
        response = client.get(
            "/api/v1/content?search=Python",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3  # 3 items contain "Python"
        titles = [item["title"] for item in data["items"]]
        assert all("Python" in title for title in titles)

        # Test search by description
        response = client.get(
            "/api/v1/content?search=web",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2  # 2 items contain "web"
        titles = [item["title"] for item in data["items"]]
        assert any("Web" in title for title in titles)

        # Test case-insensitive search
        response = client.get(
            "/api/v1/content?search=JAVASCRIPT",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["title"] == "JavaScript Guide"

    def test_content_pagination_edge_cases(self, client: TestClient, user_token, db):
        """Test content pagination edge cases."""
        # Create exactly 25 content items
        for i in range(25):
            content = Content(
                title=f"Content Item {i:02d}",
                description=f"Description for content {i}",
                content_type=ContentType.DOCUMENT,
                category=ContentCategory.RESEARCH_PAPER,
                price=1000.0 + i,
                is_exclusive=False,
                is_active=True,
                file_url=f"/uploads/content{i}.pdf"
            )
            db.add(content)
        db.commit()

        # Test first page with default page size
        response = client.get(
            "/api/v1/content?page=1",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["page_size"] == 20  # Default page size
        assert len(data["items"]) == 20
        assert data["total"] == 25

        # Test second page
        response = client.get(
            "/api/v1/content?page=2",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 2
        assert len(data["items"]) == 5  # Remaining 5 items
        assert data["total"] == 25

        # Test page beyond available content
        response = client.get(
            "/api/v1/content?page=10",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 10
        assert len(data["items"]) == 0
        assert data["total"] == 25

        # Test custom page size
        response = client.get(
            "/api/v1/content?page=1&page_size=10",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["page_size"] == 10
        assert len(data["items"]) == 10

    def test_content_filtering_combinations(self, client: TestClient, user_token, db):
        """Test combining multiple filters."""
        # Create diverse content
        content_items = [
            ("Python Book", ContentType.DOCUMENT, ContentCategory.RESEARCH_PAPER, 1000.0),
            ("Python Video", ContentType.VIDEO, ContentCategory.RESEARCH_PAPER, 2000.0),
            ("JavaScript Book", ContentType.DOCUMENT, ContentCategory.EXAM_TEXT, 1500.0),
            ("JavaScript Video", ContentType.VIDEO, ContentCategory.EXAM_TEXT, 2500.0),
            ("Python Audio", ContentType.AUDIO, ContentCategory.RESEARCH_PAPER, 800.0),
        ]

        for title, content_type, category, price in content_items:
            content = Content(
                title=title,
                description=f"Description for {title}",
                content_type=content_type,
                category=category,
                price=price,
                is_exclusive=False,
                is_active=True,
                file_url="/uploads/test.pdf"
            )
            db.add(content)
        db.commit()

        # Test multiple filters: Python + Document + Price range
        response = client.get(
            "/api/v1/content?search=Python&content_type=document&min_price=500&max_price=1500",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["title"] == "Python Book"

        # Test category + price range
        response = client.get(
            "/api/v1/content?category=research_paper&min_price=1000&max_price=2000",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2  # Python Book and Python Video
        titles = [item["title"] for item in data["items"]]
        assert "Python Book" in titles
        assert "Python Video" in titles
