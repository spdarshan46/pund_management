from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, Group, Permission, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None):
        if not email:
            raise ValueError("Email required")
        user = self.model(email=self.normalize_email(email))
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password):
        user = self.create_user(email, password)
        user.is_staff     = True
        user.is_superuser = True
        user.is_active    = True
        user.save()
        return user


class User(AbstractBaseUser, PermissionsMixin):
    email         = models.EmailField(unique=True)
    name          = models.CharField(max_length=100, blank=True, null=True)
    mobile        = models.CharField(max_length=15, unique=True, blank=True, null=True)
    pending_email = models.EmailField(null=True, blank=True)

    is_active = models.BooleanField(default=False)
    is_staff  = models.BooleanField(default=False)

    otp            = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)
    otp_attempts   = models.IntegerField(default=0)
    email_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(default=timezone.now)

    # Avoid reverse accessor clashes with default auth User
    groups = models.ManyToManyField(
        Group, related_name="users_custom_set", blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission, related_name="users_custom_permissions_set", blank=True
    )

    USERNAME_FIELD = "email"
    objects        = UserManager()

    def __str__(self):
        return self.email