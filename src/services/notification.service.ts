import {
  countCustomerNotifications,
  countUnreadCustomerNotifications,
  createCustomerNotification,
  findCustomerNotificationById,
  findCustomerNotifications,
  markCustomerNotificationAsRead,
} from "@/repositories/notification.repository";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { toJsonSafe } from "@/lib/serialize";
import type { AuthUser } from "@/types/auth";

function ensureCustomer(user: AuthUser) {
  if (user.role !== "customer") {
    throw new ForbiddenError("Customer access required");
  }
}

function paginate(page: number, limit: number) {
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

function paginationMeta(total: number, page: number, limit: number) {
  return {
    page,
    perPage: limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function notifyRegisteredReceiverAboutShipment(
  customerId: number,
  trackingNumber: string,
  shipmentId: number,
) {
  await createCustomerNotification({
    customerId,
    shipmentId,
    title: "Paket Baru Untuk Anda",
    message: `Anda menerima paket dengan nomor resi ${trackingNumber}. Buka inbox untuk melihat detail tracking.`,
  });
}

export async function getCustomerNotifications(
  currentUser: AuthUser,
  query: { page?: number; limit?: number },
) {
  ensureCustomer(currentUser);

  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const { skip, take } = paginate(page, limit);

  const [total, notifications] = await Promise.all([
    countCustomerNotifications(currentUser.id),
    findCustomerNotifications(currentUser.id, skip, take),
  ]);

  return {
    data: toJsonSafe(notifications),
    meta: paginationMeta(total, page, limit),
  };
}

export async function getCustomerNotificationSummary(currentUser: AuthUser) {
  ensureCustomer(currentUser);

  const unreadCount = await countUnreadCustomerNotifications(currentUser.id);

  return toJsonSafe({ unreadCount });
}

export async function readCustomerNotification(
  currentUser: AuthUser,
  notificationId: number,
) {
  ensureCustomer(currentUser);

  const notification = await findCustomerNotificationById(
    notificationId,
    currentUser.id,
  );

  if (!notification) {
    throw new NotFoundError("Notifikasi tidak ditemukan");
  }

  if (!notification.is_read) {
    await markCustomerNotificationAsRead(notificationId, currentUser.id);
  }

  return toJsonSafe({
    ...notification,
    is_read: true,
  });
}
