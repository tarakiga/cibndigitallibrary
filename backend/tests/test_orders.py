"""
Tests for order endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.models import OrderStatus


@pytest.mark.orders
@pytest.mark.integration
class TestCreateOrder:
    """Tests for creating orders."""
    
    def test_create_order_success(self, client: TestClient, user_token, test_user, test_content_public):
        """Test successful order creation."""
        response = client.post(
            "/api/v1/orders",
            headers={"Authorization": f"Bearer {user_token}"},
            json={
                "items": [
                    {
                        "content_id": test_content_public.id,
                        "quantity": 1
                    }
                ],
                "shipping_address": "123 Test Street, Lagos",
                "notes": "Please deliver during office hours"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["user_id"] == test_user.id
        assert data["total_amount"] == test_content_public.price
        assert data["status"] == "pending"
        assert len(data["items"]) == 1
        assert "id" in data
    
    def test_create_order_multiple_items(self, client: TestClient, user_token, test_content_public, db):
        """Test creating order with multiple items."""
        from app.models import Content, ContentType, ContentCategory
        
        # Create another content item
        content2 = Content(
            title="Second Document",
            content_type=ContentType.DOCUMENT,
            category=ContentCategory.RESEARCH_PAPER,
            price=2000.0,
            is_exclusive=False,
            is_active=True,
            file_url="/doc2.pdf"
        )
        db.add(content2)
        db.commit()
        db.refresh(content2)
        
        response = client.post(
            "/api/v1/orders",
            headers={"Authorization": f"Bearer {user_token}"},
            json={
                "items": [
                    {"content_id": test_content_public.id, "quantity": 2},
                    {"content_id": content2.id, "quantity": 1}
                ]
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        expected_total = (test_content_public.price * 2) + (content2.price * 1)
        assert data["total_amount"] == expected_total
        assert len(data["items"]) == 2
    
    def test_create_order_physical_item_sufficient_stock(self, client: TestClient, user_token, test_physical_content):
        """Test creating order for physical item with sufficient stock."""
        response = client.post(
            "/api/v1/orders",
            headers={"Authorization": f"Bearer {user_token}"},
            json={
                "items": [
                    {"content_id": test_physical_content.id, "quantity": 3}
                ],
                "shipping_address": "456 Book Avenue, Abuja"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["total_amount"] == test_physical_content.price * 3
    
    def test_create_order_physical_item_insufficient_stock(self, client: TestClient, user_token, test_physical_content):
        """Test creating order fails when insufficient stock."""
        response = client.post(
            "/api/v1/orders",
            headers={"Authorization": f"Bearer {user_token}"},
            json={
                "items": [
                    {"content_id": test_physical_content.id, "quantity": 999}
                ]
            }
        )
        
        assert response.status_code == 400
        assert "insufficient stock" in response.json()["detail"].lower()
    
    def test_create_order_nonexistent_content(self, client: TestClient, user_token):
        """Test creating order with nonexistent content fails."""
        response = client.post(
            "/api/v1/orders",
            headers={"Authorization": f"Bearer {user_token}"},
            json={
                "items": [
                    {"content_id": 99999, "quantity": 1}
                ]
            }
        )
        
        assert response.status_code == 404
    
    def test_create_order_inactive_content(self, client: TestClient, user_token, db):
        """Test creating order with inactive content fails."""
        from app.models import Content, ContentType, ContentCategory
        
        inactive_content = Content(
            title="Inactive Content",
            content_type=ContentType.DOCUMENT,
            category=ContentCategory.RESEARCH_PAPER,
            price=1000.0,
            is_exclusive=False,
            is_active=False,  # Inactive
            file_url="/inactive.pdf"
        )
        db.add(inactive_content)
        db.commit()
        
        response = client.post(
            "/api/v1/orders",
            headers={"Authorization": f"Bearer {user_token}"},
            json={
                "items": [
                    {"content_id": inactive_content.id, "quantity": 1}
                ]
            }
        )
        
        assert response.status_code == 400
        assert "not available" in response.json()["detail"].lower()
    
    def test_create_order_no_auth(self, client: TestClient, test_content_public):
        """Test creating order without authentication fails."""
        response = client.post(
            "/api/v1/orders",
            json={
                "items": [
                    {"content_id": test_content_public.id, "quantity": 1}
                ]
            }
        )
        
        assert response.status_code == 403


@pytest.mark.orders
@pytest.mark.integration
class TestInitializePayment:
    """Tests for initializing payment."""
    
    @patch('app.services.payment.paystack_service.initialize_transaction')
    async def test_initialize_payment_success(self, mock_initialize, client: TestClient, user_token, test_user, db):
        """Test successful payment initialization."""
        from app.models import Order
        
        # Create an order
        order = Order(
            user_id=test_user.id,
            total_amount=5000.0,
            status=OrderStatus.PENDING
        )
        db.add(order)
        db.commit()
        db.refresh(order)
        
        # Mock Paystack response
        mock_initialize.return_value = {
            "authorization_url": "https://checkout.paystack.com/test123",
            "access_code": "test_access_code",
            "reference": f"CIBN-{order.id}-test"
        }
        
        response = client.post(
            f"/api/v1/orders/{order.id}/initialize-payment",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "authorization_url" in data
        assert "reference" in data
    
    def test_initialize_payment_nonexistent_order(self, client: TestClient, user_token):
        """Test initializing payment for nonexistent order fails."""
        response = client.post(
            "/api/v1/orders/99999/initialize-payment",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 404
    
    def test_initialize_payment_wrong_user(self, client: TestClient, user_token, cibn_token, test_cibn_member, db):
        """Test user cannot initialize payment for another user's order."""
        from app.models import Order
        
        # Create order for CIBN member
        order = Order(
            user_id=test_cibn_member.id,
            total_amount=5000.0,
            status=OrderStatus.PENDING
        )
        db.add(order)
        db.commit()
        
        # Try to initialize with regular user token
        response = client.post(
            f"/api/v1/orders/{order.id}/initialize-payment",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 404  # Order not found for this user
    
    def test_initialize_payment_already_completed(self, client: TestClient, user_token, test_user, db):
        """Test initializing payment for already completed order fails."""
        from app.models import Order
        
        order = Order(
            user_id=test_user.id,
            total_amount=5000.0,
            status=OrderStatus.COMPLETED  # Already completed
        )
        db.add(order)
        db.commit()
        
        response = client.post(
            f"/api/v1/orders/{order.id}/initialize-payment",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 400
        assert "cannot be paid" in response.json()["detail"].lower()


@pytest.mark.orders
@pytest.mark.integration
class TestVerifyPayment:
    """Tests for verifying payment."""
    
    @patch('app.services.payment.paystack_service.verify_transaction')
    async def test_verify_payment_success(self, mock_verify, client: TestClient, user_token, test_user, test_content_public, db):
        """Test successful payment verification."""
        from app.models import Order, OrderItem
        
        # Create order with items
        order = Order(
            user_id=test_user.id,
            total_amount=test_content_public.price,
            status=OrderStatus.PENDING,
            payment_reference="CIBN-1-test123"
        )
        db.add(order)
        db.flush()
        
        order_item = OrderItem(
            order_id=order.id,
            content_id=test_content_public.id,
            quantity=1,
            price_at_purchase=test_content_public.price
        )
        db.add(order_item)
        db.commit()
        
        # Mock successful verification
        mock_verify.return_value = {
            "status": "success",
            "channel": "card",
            "amount": test_content_public.price * 100  # Paystack uses kobo
        }
        
        response = client.post(
            f"/api/v1/orders/verify-payment/{order.payment_reference}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 200
        assert response.json()["status"] == "success"
        
        # Verify order status updated
        db.refresh(order)
        assert order.status == OrderStatus.COMPLETED
    
    @patch('app.services.payment.paystack_service.verify_transaction')
    async def test_verify_payment_failed(self, mock_verify, client: TestClient, user_token, test_user, db):
        """Test payment verification when payment failed."""
        from app.models import Order
        
        order = Order(
            user_id=test_user.id,
            total_amount=5000.0,
            status=OrderStatus.PENDING,
            payment_reference="CIBN-1-failed"
        )
        db.add(order)
        db.commit()
        
        # Mock failed verification
        mock_verify.return_value = {
            "status": "failed",
            "channel": "card"
        }
        
        response = client.post(
            f"/api/v1/orders/verify-payment/{order.payment_reference}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 400
        
        # Verify order status updated to cancelled
        db.refresh(order)
        assert order.status == OrderStatus.CANCELLED
    
    @patch('app.services.payment.paystack_service.verify_transaction')
    async def test_verify_payment_creates_purchase(self, mock_verify, client: TestClient, user_token, test_user, test_content_public, db):
        """Test that digital content purchase is created after successful payment."""
        from app.models import Order, OrderItem, Purchase
        
        # Create order
        order = Order(
            user_id=test_user.id,
            total_amount=test_content_public.price,
            status=OrderStatus.PENDING,
            payment_reference="CIBN-1-digital"
        )
        db.add(order)
        db.flush()
        
        order_item = OrderItem(
            order_id=order.id,
            content_id=test_content_public.id,
            quantity=1,
            price_at_purchase=test_content_public.price
        )
        db.add(order_item)
        db.commit()
        
        # Mock successful verification
        mock_verify.return_value = {
            "status": "success",
            "channel": "card"
        }
        
        response = client.post(
            f"/api/v1/orders/verify-payment/{order.payment_reference}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 200
        
        # Verify purchase created
        purchase = db.query(Purchase).filter(
            Purchase.user_id == test_user.id,
            Purchase.content_id == test_content_public.id
        ).first()
        assert purchase is not None
    
    @patch('app.services.payment.paystack_service.verify_transaction')
    async def test_verify_payment_updates_stock(self, mock_verify, client: TestClient, user_token, test_user, test_physical_content, db):
        """Test that physical item stock is updated after successful payment."""
        from app.models import Order, OrderItem
        
        initial_stock = test_physical_content.stock_quantity
        quantity_ordered = 3
        
        # Create order
        order = Order(
            user_id=test_user.id,
            total_amount=test_physical_content.price * quantity_ordered,
            status=OrderStatus.PENDING,
            payment_reference="CIBN-1-physical"
        )
        db.add(order)
        db.flush()
        
        order_item = OrderItem(
            order_id=order.id,
            content_id=test_physical_content.id,
            quantity=quantity_ordered,
            price_at_purchase=test_physical_content.price
        )
        db.add(order_item)
        db.commit()
        
        # Mock successful verification
        mock_verify.return_value = {
            "status": "success",
            "channel": "card"
        }
        
        response = client.post(
            f"/api/v1/orders/verify-payment/{order.payment_reference}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 200
        
        # Verify stock updated
        db.refresh(test_physical_content)
        assert test_physical_content.stock_quantity == initial_stock - quantity_ordered


@pytest.mark.orders
@pytest.mark.integration
class TestGetOrders:
    """Tests for getting orders."""
    
    def test_get_my_orders(self, client: TestClient, user_token, test_user, db):
        """Test getting current user's orders."""
        from app.models import Order
        
        # Create orders for user
        order1 = Order(
            user_id=test_user.id,
            total_amount=5000.0,
            status=OrderStatus.PENDING
        )
        order2 = Order(
            user_id=test_user.id,
            total_amount=3000.0,
            status=OrderStatus.COMPLETED
        )
        db.add_all([order1, order2])
        db.commit()
        
        response = client.get(
            "/api/v1/orders",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert all(order["user_id"] == test_user.id for order in data)
    
    def test_get_my_orders_empty(self, client: TestClient, user_token):
        """Test getting orders when user has none."""
        response = client.get(
            "/api/v1/orders",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 200
        assert response.json() == []
    
    def test_get_specific_order(self, client: TestClient, user_token, test_user, db):
        """Test getting a specific order."""
        from app.models import Order
        
        order = Order(
            user_id=test_user.id,
            total_amount=5000.0,
            status=OrderStatus.PENDING
        )
        db.add(order)
        db.commit()
        
        response = client.get(
            f"/api/v1/orders/{order.id}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == order.id
        assert data["total_amount"] == 5000.0
    
    def test_get_other_user_order_fails(self, client: TestClient, user_token, test_cibn_member, db):
        """Test that user cannot access another user's order."""
        from app.models import Order
        
        # Create order for different user
        order = Order(
            user_id=test_cibn_member.id,
            total_amount=5000.0,
            status=OrderStatus.PENDING
        )
        db.add(order)
        db.commit()
        
        response = client.get(
            f"/api/v1/orders/{order.id}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 404
    
    def test_get_orders_no_auth(self, client: TestClient):
        """Test getting orders without authentication fails."""
        response = client.get("/api/v1/orders")
        
        assert response.status_code == 403
