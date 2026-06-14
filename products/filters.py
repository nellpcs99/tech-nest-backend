"""
products/filters.py
Filtres personnalisés pour les produits.
"""

import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    # Filtrer par catégorie : /api/products/?category=1
    category = django_filters.NumberFilter(field_name='category__id')

    # Filtrer par nom de catégorie : /api/products/?category_name=smartphones
    category_name = django_filters.CharFilter(field_name='category__slug', lookup_expr='iexact')

    # Filtrer par marque : /api/products/?brand=Samsung
    brand = django_filters.CharFilter(field_name='brand', lookup_expr='icontains')

    # Fourchette de prix : /api/products/?price_min=100&price_max=500
    price_min = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    price_max = django_filters.NumberFilter(field_name='price', lookup_expr='lte')

    # Booléens : /api/products/?is_featured=true
    is_featured    = django_filters.BooleanFilter()
    is_new_arrival = django_filters.BooleanFilter()
    is_best_seller = django_filters.BooleanFilter()

    class Meta:
        model  = Product
        fields = ['category', 'brand', 'is_featured', 'is_new_arrival', 'is_best_seller']
