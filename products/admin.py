"""
products/admin.py — VERSION 2
Admin complet avec miniatures images, badges colorés, inline galerie.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    """Galerie d'images dans la page produit."""
    model   = ProductImage
    extra   = 1
    fields  = ['image', 'alt_text', 'image_preview']
    readonly_fields = ['image_preview']

    def image_preview(self, obj):
        """Affiche une miniature de l'image dans l'admin."""
        if obj.image:
            return format_html(
                '<img src="{}" style="height:60px; border-radius:4px;"/>',
                obj.image.url
            )
        return "—"
    image_preview.short_description = "Aperçu"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display        = ['name', 'slug', 'product_count', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields       = ['name']

    def product_count(self, obj):
        """Nombre de produits dans cette catégorie."""
        count = obj.products.count()
        return format_html('<b>{}</b> produit(s)', count)
    product_count.short_description = "Produits"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # Colonnes affichées dans la liste
    list_display = [
        'image_preview', 'name', 'category', 'brand',
        'price', 'old_price', 'stock_badge',
        'is_featured', 'is_new_arrival', 'created_at'
    ]
    # Filtres dans la sidebar droite
    list_filter   = ['category', 'brand', 'is_featured', 'is_new_arrival', 'is_best_seller']
    # Barre de recherche
    search_fields = ['name', 'description', 'brand']
    # Champs modifiables directement dans la liste (sans ouvrir le produit)
    list_editable = ['price', 'is_featured']
    # Slug auto-rempli depuis le name
    prepopulated_fields = {'slug': ('name',)}
    # Champs en lecture seule dans le formulaire
    readonly_fields = ['created_at', 'updated_at', 'image_preview']
    # Galerie d'images en bas de la page produit
    inlines = [ProductImageInline]

    # Organisation des champs dans le formulaire
    fieldsets = (
        ("Informations principales", {
            'fields': ('name', 'slug', 'description', 'category', 'brand')
        }),
        ("Prix & Stock", {
            'fields': ('price', 'old_price', 'stock')
        }),
        ("Image principale", {
            'fields': ('image', 'image_preview')
        }),
        ("Mise en avant", {
            'fields': ('is_featured', 'is_new_arrival', 'is_best_seller')
        }),
        ("Dates", {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)   # section repliable
        }),
    )

    def image_preview(self, obj):
        """Miniature de l'image principale."""
        if obj.image:
            return format_html(
                '<img src="{}" style="height:60px; border-radius:6px; box-shadow:0 1px 4px rgba(0,0,0,.2);"/>',
                obj.image.url
            )
        return format_html('<span style="color:#aaa;">Aucune image</span>')
    image_preview.short_description = "Photo"

    def stock_badge(self, obj):
        """Badge coloré selon le niveau de stock."""
        if obj.stock == 0:
            color, label = "#ef4444", "Rupture"
        elif obj.stock <= 5:
            color, label = "#f97316", f"Faible ({obj.stock})"
        else:
            color, label = "#22c55e", f"{obj.stock} unités"

        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:12px;font-size:12px;">{}</span>',
            color, label
        )
    stock_badge.short_description = "Stock"

