"""
orders/serializers.py
"""

from rest_framework import serializers
from products.models import Product
from products.serializers import ProductListSerializer
from .models import Cart, CartItem, Order, OrderItem


# ── Panier ───────────────────────────────────────────────────────────────────

class CartItemSerializer(serializers.ModelSerializer):
    product_detail = ProductListSerializer(source='product', read_only=True)
    subtotal       = serializers.SerializerMethodField()

    class Meta:
        model  = CartItem
        fields = ['id', 'product', 'product_detail', 'quantity', 'subtotal']

    def get_subtotal(self, obj):
        return float(obj.get_subtotal())


class CartSerializer(serializers.ModelSerializer):
    items       = CartItemSerializer(many=True, read_only=True)
    total       = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()

    class Meta:
        model  = Cart
        fields = ['id', 'items', 'total', 'total_items', 'created_at']

    def get_total(self, obj):
        return float(obj.get_total())

    def get_total_items(self, obj):
        """Nombre total d'articles dans le panier."""
        return sum(item.quantity for item in obj.items.all())


class AddToCartSerializer(serializers.Serializer):
    """Valide la requête POST /api/cart/add/"""
    product_id = serializers.IntegerField()
    quantity   = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        product_id = attrs['product_id']
        quantity   = attrs['quantity']

        # Vérifier que le produit existe
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            raise serializers.ValidationError({"product_id": "Ce produit n'existe pas."})

        # Vérifier le stock
        if product.stock == 0:
            raise serializers.ValidationError({"product_id": "Ce produit est en rupture de stock."})

        if quantity > product.stock:
            raise serializers.ValidationError(
                {"quantity": f"Quantité demandée ({quantity}) dépasse le stock disponible ({product.stock})."}
            )

        attrs['product'] = product
        return attrs


class UpdateCartItemSerializer(serializers.Serializer):
    """Valide la requête PUT /api/cart/update/{item_id}/"""
    quantity = serializers.IntegerField(min_value=1)

    def validate_quantity(self, value):
        # La vérification du stock se fait dans la vue (on connaît le CartItem)
        return value


# ── Commandes ────────────────────────────────────────────────────────────────

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True, default='Produit supprimé')
    subtotal     = serializers.SerializerMethodField()

    class Meta:
        model  = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal']

    def get_subtotal(self, obj):
        return float(obj.get_subtotal())


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model  = Order
        fields = ['id', 'status', 'total_price', 'shipping_address', 'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'total_price', 'created_at', 'updated_at']


class CreateOrderSerializer(serializers.Serializer):
    """Valide la requête POST /api/orders/ (création depuis le panier)."""
    shipping_address = serializers.CharField(min_length=10)

    def validate(self, attrs):
        request = self.context['request']
        # Vérifier que le panier existe et n'est pas vide
        try:
            cart = request.user.cart
        except Cart.DoesNotExist:
            raise serializers.ValidationError("Votre panier est vide.")

        if not cart.items.exists():
            raise serializers.ValidationError("Votre panier est vide.")

        # Vérifier le stock pour chaque article
        for item in cart.items.select_related('product').all():
            if item.quantity > item.product.stock:
                raise serializers.ValidationError(
                    f"Stock insuffisant pour '{item.product.name}' "
                    f"(demandé: {item.quantity}, disponible: {item.product.stock})."
                )

        attrs['cart'] = cart
        return attrs
