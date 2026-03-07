from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

from punds.models import Pund, Membership
from finance.models import (
    PundStructure,
    Payment,
    Loan,
    LoanInstallment,
    FinanceAuditLog
)

User = get_user_model()


class FinanceTests(APITestCase):

    def setUp(self):

        # create users
        self.owner = User.objects.create_user(
            email="owner@test.com",
            password="Password123"
        )
        self.owner.is_active = True
        self.owner.email_verified = True
        self.owner.save()

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

        token = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + token)

        # create pund
        self.pund = Pund.objects.create(
            name="Finance Test Pund",
            pund_type="MONTHLY",
            created_by=self.owner
        )

        # memberships
        Membership.objects.create(
            user=self.owner,
            pund=self.pund,
            role="OWNER"
        )

        Membership.objects.create(
            user=self.member,
            pund=self.pund,
            role="MEMBER"
        )

        # create structure
        self.structure = PundStructure.objects.create(
            pund=self.pund,
            saving_amount=1000,
            loan_interest_percentage=5,
            missed_saving_penalty=50,
            missed_loan_penalty=100,
            default_loan_cycles=6,
            effective_from=timezone.now().date()
        )

        # create payment (fund in pund)
        self.payment = Payment.objects.create(
            pund=self.pund,
            member=self.member,
            cycle_number=1,
            amount=10000,
            is_paid=True,
            due_date=timezone.now().date()
        )

    # ------------------------------------------------
    # SET STRUCTURE
    # ------------------------------------------------
    def test_set_structure(self):

        url = f"/finance/pund/{self.pund.id}/set-structure/"

        response = self.client.post(url, {
            "saving_amount": 2000,
            "loan_interest_percentage": 6,
            "missed_saving_penalty": 60,
            "missed_loan_penalty": 120,
            "default_loan_cycles": 8
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ------------------------------------------------
    # GENERATE CYCLE
    # ------------------------------------------------
    def test_generate_cycle(self):

        url = f"/finance/pund/{self.pund.id}/generate-cycle/"

        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    # ------------------------------------------------
    # CYCLE PAYMENTS
    # ------------------------------------------------
    def test_cycle_payments(self):

        url = f"/finance/pund/{self.pund.id}/cycle-payments/"

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ------------------------------------------------
    # MARK PAYMENT PAID
    # ------------------------------------------------
    def test_mark_payment_paid(self):

        payment = Payment.objects.create(
            pund=self.pund,
            member=self.member,
            cycle_number=2,
            amount=1000,
            due_date=timezone.now().date()
        )

        url = f"/finance/payment/{payment.id}/mark-paid/"

        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ------------------------------------------------
    # REQUEST LOAN
    # ------------------------------------------------
    def test_request_loan(self):

        # login member
        login = self.client.post(reverse("login"), {
            "email": "member@test.com",
            "password": "Password123"
        })

        token = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + token)

        url = f"/finance/pund/{self.pund.id}/request-loan/"

        response = self.client.post(url, {
            "principal_amount": 5000
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ------------------------------------------------
    # APPROVE LOAN
    # ------------------------------------------------
    def test_approve_loan(self):

        loan = Loan.objects.create(
            pund=self.pund,
            member=self.member,
            principal_amount=5000,
            interest_percentage=0,
            total_payable=0,
            total_cycles=0,
            remaining_amount=0,
            status="PENDING"
        )

        url = f"/finance/loan/{loan.id}/approve/"

        response = self.client.post(url, {
            "cycles": 6
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ------------------------------------------------
    # REJECT LOAN
    # ------------------------------------------------
    def test_reject_loan(self):

        loan = Loan.objects.create(
            pund=self.pund,
            member=self.member,
            principal_amount=3000,
            interest_percentage=0,
            total_payable=0,
            total_cycles=0,
            remaining_amount=0,
            status="PENDING"
        )

        url = f"/finance/loan/{loan.id}/reject/"

        response = self.client.post(url, {
            "reason": "Invalid request"
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ------------------------------------------------
    # LOAN DETAIL
    # ------------------------------------------------
    def test_loan_detail(self):

        loan = Loan.objects.create(
            pund=self.pund,
            member=self.member,
            principal_amount=4000,
            interest_percentage=5,
            total_payable=4200,
            total_cycles=6,
            remaining_amount=4200,
            status="APPROVED"
        )

        url = f"/finance/loan/{loan.id}/detail/"

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ------------------------------------------------
    # MARK INSTALLMENT PAID
    # ------------------------------------------------
    def test_mark_installment_paid(self):

        loan = Loan.objects.create(
            pund=self.pund,
            member=self.member,
            principal_amount=5000,
            interest_percentage=5,
            total_payable=5250,
            total_cycles=6,
            remaining_amount=5250,
            status="APPROVED",
            is_active=True
        )

        inst = LoanInstallment.objects.create(
            loan=loan,
            cycle_number=2,
            emi_amount=875,
            due_date=timezone.now().date()
        )

        url = f"/finance/installment/{inst.id}/mark-paid/"

        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ------------------------------------------------
    # FUND SUMMARY
    # ------------------------------------------------
    def test_fund_summary(self):

        url = f"/finance/pund/{self.pund.id}/fund-summary/"

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ------------------------------------------------
    # SAVING SUMMARY
    # ------------------------------------------------
    def test_saving_summary(self):

        url = f"/finance/pund/{self.pund.id}/saving-summary/"

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ------------------------------------------------
    # AUDIT LOG
    # ------------------------------------------------
    def test_audit_logs(self):

        FinanceAuditLog.objects.create(
            pund=self.pund,
            user=self.owner,
            action="Test",
            description="Testing log"
        )

        url = f"/finance/pund/{self.pund.id}/audit-logs/"

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ------------------------------------------------
    # MY LOANS
    # ------------------------------------------------
    def test_my_loans(self):

        url = "/finance/my-loans/"

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ------------------------------------------------
    # MY FINANCIAL SUMMARY
    # ------------------------------------------------
    def test_my_financial_summary(self):

        url = f"/finance/pund/{self.pund.id}/my-financial-summary/"

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ------------------------------------------------
    # PUND LOANS
    # ------------------------------------------------
    def test_pund_loans(self):

        url = f"/finance/pund/{self.pund.id}/loans/"

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)