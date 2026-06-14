"""
orders/views.py
"""

from django.db import transaction
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Cart, CartItem, Order, OrderItem
from .serializers import (
    CartSerializer, AddToCartSerializer, UpdateCartItemSerializer,
    OrderSerializer, CreateOrderSerializer,
)


def get_or_create_cart(user):
    """Récupère le panier de l'utilisateur ou le crée s'il n'existe pas."""
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


# ── Panier ───────────────────────────────────────────────────────────────────

class CartView(APIView):
    """GET /api/cart/ → retourne le panier de l'utilisateur connecté."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart = get_or_create_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CartAddView(APIView):
    """POST /api/cart/add/ → ajoute un produit au panier."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        product  = serializer.validated_data['product']
        quantity = serializer.validated_data['quantity']
        cart     = get_or_create_cart(request.user)

        # Si le produit est déjà dans le panier, on additionne les quantités
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            new_quantity = cart_item.quantity + quantity
            if new_quantity > product.stock:
                return Response(
                    {"error": f"Quantité totale ({new_quantity}) dépasse le stock ({product.stock})."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            cart_item.quantity = new_quantity
            cart_item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartUpdateView(APIView):
    """PUT /api/cart/update/{item_id}/ → modifie la quantité d'un article."""
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, item_id):
        try:
            item = CartItem.objects.select_related('product').get(
                id=item_id, cart__user=request.user
            )
        except CartItem.DoesNotExist:
            return Response({"error": "Article introuvable."}, status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateCartItemSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        quantity = serializer.validated_data['quantity']
        if quantity > item.product.stock:
            return Response(
                {"error": f"Quantité ({quantity}) dépasse le stock ({item.product.stock})."},
                status=status.HTTP_400_BAD_REQUEST
            )
        item.quantity = quantity
        item.save()
        return Response(CartSerializer(item.cart).data)


class CartRemoveView(APIView):
    """DELETE /api/cart/remove/{item_id}/ → retire un article du panier."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, item_id):
        try:
            item = CartItem.objects.get(id=item_id, cart__user=request.user)
        except CartItem.DoesNotExist:
            return Response({"error": "Article introuvable."}, status=status.HTTP_404_NOT_FOUND)
        cart = item.cart
        item.delete()
        return Response(CartSerializer(cart).data)


class CartClearView(APIView):
    """DELETE /api/cart/clear/ → vide complètement le panier."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        cart = get_or_create_cart(request.user)
        cart.items.all().delete()
        return Response({"message": "Panier vidé."}, status=status.HTTP_200_OK)


# ── Commandes ────────────────────────────────────────────────────────────────

class OrderListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/orders/  → liste des commandes de l'utilisateur connecté
    POST /api/orders/  → crée une commande depuis le panier
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # L'utilisateur ne voit que ses propres commandes
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateOrderSerializer
        return OrderSerializer

    def get_serializer_context(self):
        return {'request': self.request}

    @transaction.atomic   # Si quelque chose échoue, tout est annulé
    def create(self, request, *args, **kwargs):
        serializer = CreateOrderSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        cart             = serializer.validated_data['cart']
        shipping_address = serializer.validated_data['shipping_address']

        # Calculer le total
        total = cart.get_total()

        # Créer la commande
        order = Order.objects.create(
            user=request.user,
            shipping_address=shipping_address,
            total_price=total,
        )

        # Créer les OrderItems et décrémenter le stock
        for item in cart.items.select_related('product').all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                unit_price=item.product.price,  # on fixe le prix au moment de la commande
            )
            # Décrémenter le stock
            item.product.stock -= item.quantity
            item.product.save()

        # Vider le panier
        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
    """GET /api/orders/{id}/ → détail d'une commande."""
    serializer_class   = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product')
