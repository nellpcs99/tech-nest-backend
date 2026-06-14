from django.urls import path
from .views import (
    CartView, CartAddView, CartUpdateView, CartRemoveView, CartClearView,
    OrderListCreateView, OrderDetailView,
)

urlpatterns = [
    # Panier
    path('cart/',                   CartView.as_view(),      name='cart'),
    path('cart/add/',               CartAddView.as_view(),   name='cart-add'),
    path('cart/update/<int:item_id>/', CartUpdateView.as_view(), name='cart-update'),
    path('cart/remove/<int:item_id>/', CartRemoveView.as_view(), name='cart-remove'),
    path('cart/clear/',             CartClearView.as_view(), name='cart-clear'),

    # Commandes
    path('orders/',           OrderListCreateView.as_view(), name='orders'),
    path('orders/<int:pk>/',  OrderDetailView.as_view(),     name='order-detail'),
]
