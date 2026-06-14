"""
accounts/models.py
On garde le User Django par défaut et on lui ajoute un profil via OneToOne.
"""

from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    # Lié 1-pour-1 au User Django standard
    user    = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone   = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    avatar  = models.ImageField(upload_to='avatars/', null=True, blank=True)

    def __str__(self):
        return f"Profil de {self.user.username}"
