"""
products/serializers.py
"""

from rest_framework import serializers
from .models import Category, Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProductImage
        fields = ['id', 'image', 'alt_text']


class ProductListSerializer(serializers.ModelSerializer):
    """Sérialiseur léger pour la liste des produits (pas les images galerie)."""
    is_on_sale    = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model  = Product
        fields = [
            'id', 'name', 'slug', 'price', 'old_price', 'is_on_sale',
            'stock', 'brand', 'image', 'category', 'category_name',
            'is_featured', 'is_new_arrival', 'is_best_seller',
        ]

    def get_is_on_sale(self, obj):
        """True si l'ancien prix existe et est supérieur au prix actuel."""
        return obj.old_price is not None and obj.old_price > obj.price


class ProductDetailSerializer(serializers.ModelSerializer):
    """Sérialiseur complet avec galerie d'images."""
    is_on_sale    = serializers.SerializerMethodField()
    images        = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model  = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'old_price', 'is_on_sale',
            'stock', 'brand', 'image', 'images', 'category', 'category_name',
            'is_featured', 'is_new_arrival', 'is_best_seller',
            'created_at', 'updated_at',
        ]

    def get_is_on_sale(self, obj):
        return obj.old_price is not None and obj.old_price > obj.price


class ProductWriteSerializer(serializers.ModelSerializer):
    """Sérialiseur d'écriture (création/modification, admin seulement)."""

    class Meta:
        model  = Product
        fields = [
            'name', 'description', 'price', 'old_price', 'stock',
            'category', 'brand', 'image',
            'is_featured', 'is_new_arrival', 'is_best_seller',
        ]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le prix doit être supérieur à 0.")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Le stock ne peut pas être négatif.")
        return value

    def validate(self, attrs):
        old_price = attrs.get('old_price')
        price     = attrs.get('price')
        if old_price and price and old_price <= price:
            raise serializers.ValidationError(
                {"old_price": "L'ancien prix doit être supérieur au prix actuel pour indiquer une remise."}
            )
        return attrs


# ── Catégories ───────────────────────────────────────────────────────────────

class CategorySerializer(serializers.ModelSerializer):
    """Catégorie avec le nombre de produits."""
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model  = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'product_count', 'created_at']


class CategoryDetailSerializer(serializers.ModelSerializer):
    """Catégorie avec la liste complète de ses produits."""
    products = ProductListSerializer(many=True, read_only=True)

    class Meta:
        model  = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'products']
