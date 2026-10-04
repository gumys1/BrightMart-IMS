from rest_framework.permissions import BasePermission


class IsInventoryStaffOrManager(BasePermission):
	message = "Inventory Staff or Manager access is required."

	def has_permission(self, request, view):
		user = request.user
		return bool(
			user
			and user.is_authenticated
			and getattr(user, "role", None) in {"STAFF", "MANAGER"}
		)


class IsInventoryManager(BasePermission):
	message = "Inventory Manager access is required."

	def has_permission(self, request, view):
		user = request.user
		return bool(user and user.is_authenticated and getattr(user, "role", None) == "MANAGER")
