"""
orders/admin.py — VERSION 2 corrigée
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Cart, CartItem, Order, OrderItem

STATUS_COLORS = {
    'pending':   ('#f59e0b', '⏳ En attente'),
    'confirmed': ('#3b82f6', '✅ Confirmée'),
    'shipped':   ('#8b5cf6', '🚚 Expédiée'),
    'delivered': ('#22c55e', '📦 Livrée'),
    'cancelled': ('#ef4444', '❌ Annulée'),
}


class OrderItemInline(admin.TabularInline):
    model           = OrderItem
    extra           = 0
    readonly_fields = ['product', 'quantity', 'unit_price', 'subtotal_display']
    can_delete      = False

    def subtotal_display(self, obj):
        return f"{obj.get_subtotal()} FCFA"
    subtotal_display.short_description = "Sous-total"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    # 'status' est dans list_display ET dans list_editable → plus de conflit
    list_display    = ['id', 'user', 'status', 'status_badge', 'total_price_display', 'items_count', 'created_at']
    list_filter     = ['status', 'created_at']
    search_fields   = ['user__username', 'user__email']
    list_editable   = ['status']
    readonly_fields = ['created_at', 'updated_at', 'total_price', 'user']
    inlines         = [OrderItemInline]
    ordering        = ['-created_at']

    fieldsets = (
        ("Informations commande", {
            'fields': ('user', 'status', 'total_price', 'shipping_address')
        }),
        ("Dates", {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def status_badge(self, obj):
        color, label = STATUS_COLORS.get(obj.status, ('#6b7280', obj.status))
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 10px;'
            'border-radius:12px;font-size:12px;font-weight:600;">{}</span>',
            color, label
        )
    status_badge.short_description = "Statut visuel"

    def total_price_display(self, obj):
        return format_html('<b>{} FCFA</b>', obj.total_price)
    total_price_display.short_description = "Total"

    def items_count(self, obj):
        return f"{obj.items.count()} article(s)"
    items_count.short_description = "Articles"


class CartItemInline(admin.TabularInline):
    model           = CartItem
    extra           = 0
    readonly_fields = ['product', 'quantity']
    can_delete      = False


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display    = ['user', 'items_count', 'cart_total', 'created_at']
    readonly_fields = ['user', 'created_at']
    inlines         = [CartItemInline]

    def items_count(self, obj):
        return f"{obj.items.count()} article(s)"
    items_count.short_description = "Articles"

    def cart_total(self, obj):
        return f"{obj.get_total()} FCFA"
    cart_total.short_description = "Total panier"