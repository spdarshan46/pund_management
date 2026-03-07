from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

from .models import Pund, Membership

User = get_user_model()


class PundTests(APITestCase):

    def setUp(self):

        # owner user
        self.owner = User.objects.create_user(
            email="owner@test.com",
            password="Password123"
        )
        self.owner.is_active = True
        self.owner.email_verified = True
        self.owner.save()

        # member user
        self.member = User.objects.create_user(
            email="member@test.com",
            password="Password123"
        )
        self.member.is_active = True
        self.member.email_verified = True
        self.member.save()

        # login owner
        login = self.client.post(reverse("login"), {
            "email": "owner@test.com",
            "password": "Password123"
        })

        self.token = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + self.token)

        # create pund
        self.pund = Pund.objects.create(
            name="Test Pund",
            pund_type="MONTHLY",
            created_by=self.owner
        )

        Membership.objects.create(
            user=self.owner,
            pund=self.pund,
            role="OWNER"
        )


    # ─────────────────────────
    # CREATE PUND
    # ─────────────────────────
    def test_create_pund(self):

        url = "/punds/create/"

        response = self.client.post(url, {
            "name": "New Pund",
            "pund_type": "MONTHLY"
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


    # ─────────────────────────
    # GET MY ALL PUNDS
    # ─────────────────────────
    def test_my_all_punds(self):

        url = "/punds/my-all/"

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)


    # ─────────────────────────
    # ADD MEMBER
    # ─────────────────────────
    def test_add_member(self):

        url = f"/punds/{self.pund.id}/add-member/"

        response = self.client.post(url, {
            "name": "Member",
            "email": "member@test.com",
            "mobile": "9999999999"
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


    # ─────────────────────────
    # PUND DETAIL
    # ─────────────────────────
    def test_pund_detail(self):

        url = f"/punds/{self.pund.id}/"

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)


    # ─────────────────────────
    # CLOSE PUND
    # ─────────────────────────
    def test_close_pund(self):

        url = f"/punds/{self.pund.id}/close/"

        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.pund.refresh_from_db()

        self.assertFalse(self.pund.is_active)


    # ─────────────────────────
    # REOPEN PUND
    # ─────────────────────────
    def test_reopen_pund(self):

        self.pund.is_active = False
        self.pund.save()

        url = f"/punds/{self.pund.id}/reopen/"

        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)


    # ─────────────────────────
    # REMOVE MEMBER
    # ─────────────────────────
    def test_remove_member(self):

        membership = Membership.objects.create(
            user=self.member,
            pund=self.pund,
            role="MEMBER"
        )

        url = f"/punds/{self.pund.id}/remove-member/{self.member.id}/"

        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        membership.refresh_from_db()

        self.assertFalse(membership.is_active)


    # ─────────────────────────
    # REACTIVATE MEMBER
    # ─────────────────────────
    def test_reactivate_member(self):

        membership = Membership.objects.create(
            user=self.member,
            pund=self.pund,
            role="MEMBER",
            is_active=False
        )

        url = f"/punds/{self.pund.id}/reactivate-member/{self.member.id}/"

        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        membership.refresh_from_db()

        self.assertTrue(membership.is_active)


    # ─────────────────────────
    # EDIT MEMBER
    # ─────────────────────────
    def test_edit_member(self):

        Membership.objects.create(
            user=self.member,
            pund=self.pund,
            role="MEMBER"
        )

        url = f"/punds/{self.pund.id}/edit-member/{self.member.id}/"

        response = self.client.patch(url, {
            "name": "Updated Member"
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)