"""
orders/models.py
"""

from django.db import models
from django.contrib.auth.models import User
from products.models import Product


class Cart(models.Model):
    """Un panier par utilisateur (créé automatiquement à la première utilisation)."""
    user       = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Panier de {self.user.username}"

    def get_total(self):
        """Calcule le total du panier."""
        return sum(item.get_subtotal() for item in self.items.all())


class CartItem(models.Model):
    cart     = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product  = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        # Un produit ne peut apparaître qu'une fois par panier
        unique_together = ('cart', 'product')

    def get_subtotal(self):
        return self.product.price * self.quantity

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending',   'En attente'),
        ('confirmed', 'Confirmée'),
        ('shipped',   'Expédiée'),
        ('delivered', 'Livrée'),
        ('cancelled', 'Annulée'),
    ]

    user             = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price      = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_address = models.TextField()
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Commande #{self.id} – {self.user.username} ({self.status})"


class OrderItem(models.Model):
    order      = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product    = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity   = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    # unit_price est stocké au moment de la commande (le prix peut changer plus tard)

    def get_subtotal(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"{self.quantity}x {self.product.name if self.product else 'Produit supprimé'}"
