from django.contrib import admin
from django.utils.html import format_html
from .models import Pund, Membership

# Inline to show membership inside Pund admin
class MembershipInline(admin.TabularInline):
    model = Membership
    fields = ("user", "role", "is_active", "joined_at")
    readonly_fields = ("joined_at",)
    extra = 0
    autocomplete_fields = ("user",)
    show_change_link = True

@admin.register(Pund)
class PundAdmin(admin.ModelAdmin):
    """Admin for Pund (group)."""
    list_display = (
        "id",
        "name",
        "pund_type",
        "saving_amount",   # if you removed this field, remove from list_display
        "start_date",
        "is_active",
        "created_by",
        "created_at",
        "member_count",
    )
    list_filter = ("pund_type", "is_active", "start_date")
    search_fields = ("name", "created_by__email", "created_by__name")
    readonly_fields = ("created_at",)
    inlines = [MembershipInline]
    autocomplete_fields = ("created_by",)
    ordering = ("-created_at",)

    def member_count(self, obj):
        return Membership.objects.filter(pund=obj, is_active=True).count()
    member_count.short_description = "Active members"

@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    """Separate admin for membership if needed."""
    list_display = ("id", "user", "pund", "role", "is_active", "joined_at")
    list_filter = ("role", "is_active")
    search_fields = ("user__email", "user__name", "pund__name")
    readonly_fields = ("joined_at",)
    autocomplete_fields = ("user", "pund")
    ordering = ("-joined_at",)