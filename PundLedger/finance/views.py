from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from datetime import timedelta

from punds.models import Pund, Membership
from .models import PundStructure
from .serializers import PundStructureSerializer


class SetStructureView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pund_id):

        pund = Pund.objects.filter(id=pund_id, is_active=True).first()
        if not pund:
            return Response({"error": "Pund not found or inactive"}, status=404)

        # Only OWNER can set structure
        is_owner = Membership.objects.filter(
            user=request.user,
            pund=pund,
            role="OWNER",
            is_active=True
        ).exists()

        if not is_owner:
            return Response({"error": "Only owner can set structure"}, status=403)

        serializer = PundStructureSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        next_week = timezone.now().date() + timedelta(days=7)

        # 🔥 Check if future structure already exists
        existing_future = PundStructure.objects.filter(
            pund=pund,
            effective_from=next_week
        ).first()

        if existing_future:
            # Update existing future structure
            existing_future.saving_amount = serializer.validated_data["saving_amount"]
            existing_future.loan_interest_percentage = serializer.validated_data["loan_interest_percentage"]
            existing_future.missed_week_penalty = serializer.validated_data["missed_week_penalty"]
            existing_future.save()

            return Response({"message": "Future structure updated successfully"})

        # Create new future structure
        PundStructure.objects.create(
            pund=pund,
            saving_amount=serializer.validated_data["saving_amount"],
            loan_interest_percentage=serializer.validated_data["loan_interest_percentage"],
            missed_week_penalty=serializer.validated_data["missed_week_penalty"],
            effective_from=next_week,
        )

        return Response({"message": "Structure created successfully"})