"""
accounts/admin.py — VERSION 2
Admin personnalisé avec UserProfile inline.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    """Affiche le profil directement dans la page de l'utilisateur."""
    model          = UserProfile
    can_delete     = False
    verbose_name   = "Profil"
    fields         = ['phone', 'address', 'avatar']


class UserAdmin(BaseUserAdmin):
    """
    On remplace l'admin User par défaut pour y ajouter le profil inline
    et des colonnes utiles.
    """
    inlines     = [UserProfileInline]
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined']
    list_filter  = ['is_staff', 'is_active', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering     = ['-date_joined']


# Désinscrire l'admin User par défaut et réinscrire le nôtre
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display  = ['user', 'phone', 'address']
    search_fields = ['user__username', 'user__email', 'phone']

