import io
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework.test import APITestCase
from .models import User


class DeploymentStorageTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("storage@example.test", "Test-only-storage-123")
        self.client.force_authenticate(self.user)

    @override_settings(SERVERLESS_RUNTIME=True)
    def test_serverless_local_upload_is_rejected_before_writing(self):
        self.assertFalse(self.client.get("/api/v1/auth/me/").data["can_upload_photo"])
        content = io.BytesIO()
        Image.new("RGB", (16, 16)).save(content, "PNG")
        photo = SimpleUploadedFile("photo.png", content.getvalue(), content_type="image/png")
        response = self.client.patch("/api/v1/auth/me/", {"avatar": photo}, format="multipart")
        self.assertEqual(response.status_code, 400)
        self.assertIn("temporarily unavailable", str(response.data["avatar"]))
        self.user.refresh_from_db()
        self.assertFalse(self.user.avatar)

    @override_settings(SERVERLESS_RUNTIME=True)
    def test_other_profile_updates_and_removal_remain_available(self):
        response = self.client.patch("/api/v1/auth/me/", {"first_name": "Updated", "avatar": None}, format="json")
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Updated")

    @override_settings(SERVERLESS_RUNTIME=False)
    def test_local_persistent_filesystem_remains_supported(self):
        self.assertTrue(self.client.get("/api/v1/auth/me/").data["can_upload_photo"])
