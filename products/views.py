"""
products/views.py
"""

from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product
from .serializers import (
    CategorySerializer, CategoryDetailSerializer,
    ProductListSerializer, ProductDetailSerializer, ProductWriteSerializer,
)
from .filters import ProductFilter


class IsAdminOrReadOnly(permissions.BasePermission):
    """Lecture pour tout le monde, écriture pour les admins seulement."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class ProductViewSet(viewsets.ModelViewSet):
    """
    GET    /api/products/        → liste avec filtres
    GET    /api/products/{id}/   → détail
    POST   /api/products/        → créer (admin)
    PUT    /api/products/{id}/   → modifier (admin)
    DELETE /api/products/{id}/   → supprimer (admin)
    """
    queryset           = Product.objects.select_related('category').prefetch_related('images')
    permission_classes = [IsAdminOrReadOnly]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class    = ProductFilter
    search_fields      = ['name', 'description', 'brand']
    ordering_fields    = ['price', 'created_at', 'name']
    ordering           = ['-created_at']

    def get_serializer_class(self):
        """Choisit le bon sérialiseur selon l'action."""
        if self.action == 'list':
            return ProductListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ProductWriteSerializer
        return ProductDetailSerializer  # retrieve


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/categories/       → liste des catégories
    GET /api/categories/{id}/  → catégorie + ses produits
    """
    queryset = Category.objects.all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CategoryDetailSerializer
        return CategorySerializer
