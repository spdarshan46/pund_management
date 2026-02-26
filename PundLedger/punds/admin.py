from django.contrib import admin
from .models import Pund, Membership


class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 0


@admin.register(Pund)
class PundAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "pund_type",
        "is_active",
        "created_by",
        "start_date",
    )

    list_filter = ("pund_type", "is_active")
    search_fields = ("name",)
    inlines = [MembershipInline]


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "pund",
        "role",
        "is_active",
        "joined_at",
    )

    list_filter = ("role", "is_active")
    search_fields = ("user__email", "pund__name")