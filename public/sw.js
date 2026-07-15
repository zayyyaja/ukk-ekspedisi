if (!self.define) {
  let e,
    a = {};
  const s = (s, b) => (
    (s = new URL(s + ".js", b).href),
    a[s] ||
      new Promise((a) => {
        if ("document" in self) {
          const e = document.createElement("script");
          ((e.src = s), (e.onload = a), document.head.appendChild(e));
        } else ((e = s), importScripts(s), a());
      }).then(() => {
        let e = a[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (b, i) => {
    const t =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (a[t]) return;
    let c = {};
    const n = (e) => s(e, t),
      r = { module: { uri: t }, exports: c, require: n };
    a[t] = Promise.all(b.map((e) => r[e] || n(e))).then((e) => (i(...e), c));
  };
}
define(["./workbox-f52fd911"], function (e) {
  "use strict";
  (importScripts("fallback-yamTA68_5MPQnR2-hcenP.js"),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/app-build-manifest.json",
          revision: "d282cabf0a0cbb6daddbdcf8c8a64034",
        },
        {
          url: "/_next/static/chunks/113-f002d68189e308ee.js",
          revision: "f002d68189e308ee",
        },
        {
          url: "/_next/static/chunks/1255-b8cf77ab14370e57.js",
          revision: "b8cf77ab14370e57",
        },
        {
          url: "/_next/static/chunks/1318-32c3d25bea4f17d7.js",
          revision: "32c3d25bea4f17d7",
        },
        {
          url: "/_next/static/chunks/1461-5fa0b09f6f8b45be.js",
          revision: "5fa0b09f6f8b45be",
        },
        {
          url: "/_next/static/chunks/1646.a93085a0445ba909.js",
          revision: "a93085a0445ba909",
        },
        {
          url: "/_next/static/chunks/164f4fb6-32fa297d9a2ab88f.js",
          revision: "32fa297d9a2ab88f",
        },
        {
          url: "/_next/static/chunks/2191-9dfe2e25d2a23d01.js",
          revision: "9dfe2e25d2a23d01",
        },
        {
          url: "/_next/static/chunks/2237-2125bbcc76da3e09.js",
          revision: "2125bbcc76da3e09",
        },
        {
          url: "/_next/static/chunks/2503-25ea02fc51508fec.js",
          revision: "25ea02fc51508fec",
        },
        {
          url: "/_next/static/chunks/2619-04bc32f026a0d946.js",
          revision: "04bc32f026a0d946",
        },
        {
          url: "/_next/static/chunks/2931.c108b4a770366ef4.js",
          revision: "c108b4a770366ef4",
        },
        {
          url: "/_next/static/chunks/2997-4621187a28cb2348.js",
          revision: "4621187a28cb2348",
        },
        {
          url: "/_next/static/chunks/2f0b94e8-3186a98eb4c9012b.js",
          revision: "3186a98eb4c9012b",
        },
        {
          url: "/_next/static/chunks/3051-aea7357e96fd6312.js",
          revision: "aea7357e96fd6312",
        },
        {
          url: "/_next/static/chunks/306-d61a7065078fb002.js",
          revision: "d61a7065078fb002",
        },
        {
          url: "/_next/static/chunks/3062-1b7604c4cd9a2aec.js",
          revision: "1b7604c4cd9a2aec",
        },
        {
          url: "/_next/static/chunks/4199.ac0c0f3efd36a974.js",
          revision: "ac0c0f3efd36a974",
        },
        {
          url: "/_next/static/chunks/4671-834937c508d1b4ce.js",
          revision: "834937c508d1b4ce",
        },
        {
          url: "/_next/static/chunks/4885-92192566421a6674.js",
          revision: "92192566421a6674",
        },
        {
          url: "/_next/static/chunks/4bd1b696-100b9d70ed4e49c1.js",
          revision: "100b9d70ed4e49c1",
        },
        {
          url: "/_next/static/chunks/5139.e4ff9cc3669129ed.js",
          revision: "e4ff9cc3669129ed",
        },
        {
          url: "/_next/static/chunks/5667-34bc1f64c366c984.js",
          revision: "34bc1f64c366c984",
        },
        {
          url: "/_next/static/chunks/5773-8331af16d70aadbd.js",
          revision: "8331af16d70aadbd",
        },
        {
          url: "/_next/static/chunks/5854-4855e62560781c6a.js",
          revision: "4855e62560781c6a",
        },
        {
          url: "/_next/static/chunks/66-fa8693e8ca8d4a4c.js",
          revision: "fa8693e8ca8d4a4c",
        },
        {
          url: "/_next/static/chunks/7656-7a02ede31cac4443.js",
          revision: "7a02ede31cac4443",
        },
        {
          url: "/_next/static/chunks/8304-04852c120352a204.js",
          revision: "04852c120352a204",
        },
        {
          url: "/_next/static/chunks/8720-c9ee040177c11cae.js",
          revision: "c9ee040177c11cae",
        },
        {
          url: "/_next/static/chunks/927-66f030ba9957baf4.js",
          revision: "66f030ba9957baf4",
        },
        {
          url: "/_next/static/chunks/9511-07d8c3a5b6e1f9dc.js",
          revision: "07d8c3a5b6e1f9dc",
        },
        {
          url: "/_next/static/chunks/9663-66901468ddbe9e2a.js",
          revision: "66901468ddbe9e2a",
        },
        {
          url: "/_next/static/chunks/ad2866b8.e13a3cf75ccf0eb8.js",
          revision: "e13a3cf75ccf0eb8",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/branches/%5Bid%5D/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/branches/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/customers/%5Bid%5D/activate/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/customers/%5Bid%5D/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/customers/%5Bid%5D/suspend/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/customers/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/dashboard/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/payments/%5Bid%5D/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/payments/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/rates/%5Bid%5D/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/rates/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/shipments/%5Bid%5D/assign-courier/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/shipments/%5Bid%5D/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/shipments/%5Bid%5D/status/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/shipments/receive/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/shipments/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/trackings/%5Bid%5D/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/trackings/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/users/%5Bid%5D/activate/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/users/%5Bid%5D/deactivate/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/users/%5Bid%5D/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/users/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/vehicles/%5Bid%5D/assign-courier/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/vehicles/%5Bid%5D/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/admin/vehicles/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/auth/captcha/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/auth/logout/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/auth/me/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/auth/refresh/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/cashier/dashboard/summary/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/cashier/orders/%5Bid%5D/assign-courier/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/cashier/orders/%5Bid%5D/confirm/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/cashier/orders/%5Bid%5D/reject/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/cashier/orders/%5Bid%5D/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/cashier/orders/recent/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/cashier/orders/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/cashier/orders/verify-resi/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/cashier/payments/%5Bid%5D/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/cashier/payments/%5Bid%5D/verify-cash/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/cashier/payments/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/cashier/reports/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/courier/shipments/%5Bid%5D/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/courier/shipments/%5Bid%5D/status/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/courier/shipments/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/customer/auth/login/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/customer/auth/register/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/customer/auth/resend-verification/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/customer/auth/verify-email/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/customer/notifications/%5Bid%5D/read/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/customer/notifications/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/customer/notifications/summary/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/customer/payments/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/customer/profile/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/customer/shipments/%5Bid%5D/cancel/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/customer/shipments/%5Bid%5D/payments/online/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/customer/shipments/%5Bid%5D/payments/sync/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/customer/shipments/%5Bid%5D/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/customer/shipments/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/manager/dashboard/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/manager/payments/summary/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/owner/dashboard/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/owner/payments/summary/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/public/branches/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/public/rates/check/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/public/tracking/%5BtrackingNumber%5D/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/staff/auth/login/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/staff/upload/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/upload/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/api/v2/webhooks/midtrans/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/cabang/page-38469cce0edfe81e.js",
          revision: "38469cce0edfe81e",
        },
        {
          url: "/_next/static/chunks/app/cek-ongkir/page-40599f9ea720c183.js",
          revision: "40599f9ea720c183",
        },
        {
          url: "/_next/static/chunks/app/customer/buat-pesanan/layout-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/customer/buat-pesanan/page-722df757d8971f8e.js",
          revision: "722df757d8971f8e",
        },
        {
          url: "/_next/static/chunks/app/customer/dashboard/layout-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/customer/dashboard/page-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/customer/dashboard/payments/page-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/customer/dashboard/profile/page-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/customer/dashboard/settings/page-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/customer/dashboard/shipments/%5Bid%5D/page-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/customer/dashboard/shipments/create/page-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/customer/dashboard/shipments/page-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/customer/dashboard/tracking/page-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/customer/inbox/page-6697295dd3951811.js",
          revision: "6697295dd3951811",
        },
        {
          url: "/_next/static/chunks/app/customer/lacak-paket/layout-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/customer/lacak-paket/page-8300be7a5052afbf.js",
          revision: "8300be7a5052afbf",
        },
        {
          url: "/_next/static/chunks/app/customer/layout-6b342512340680ae.js",
          revision: "6b342512340680ae",
        },
        {
          url: "/_next/static/chunks/app/customer/login/page-b975b2d2a298ad3f.js",
          revision: "b975b2d2a298ad3f",
        },
        {
          url: "/_next/static/chunks/app/customer/page-65e6435a9a78c31c.js",
          revision: "65e6435a9a78c31c",
        },
        {
          url: "/_next/static/chunks/app/customer/pembayaran/%5Bid%5D/page-83cabc04ed17f0c6.js",
          revision: "83cabc04ed17f0c6",
        },
        {
          url: "/_next/static/chunks/app/customer/pembayaran/layout-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/customer/pembayaran/sukses/page-116226f9cdb0a7d4.js",
          revision: "116226f9cdb0a7d4",
        },
        {
          url: "/_next/static/chunks/app/customer/pesanan/%5Bid%5D/page-e642432fa1d911a2.js",
          revision: "e642432fa1d911a2",
        },
        {
          url: "/_next/static/chunks/app/customer/profile/page-2eb074a7120c6349.js",
          revision: "2eb074a7120c6349",
        },
        {
          url: "/_next/static/chunks/app/customer/register/page-603210db7e05cf04.js",
          revision: "603210db7e05cf04",
        },
        {
          url: "/_next/static/chunks/app/customer/verify-email/layout-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/customer/verify-email/page-3687cf5a5b985b8a.js",
          revision: "3687cf5a5b985b8a",
        },
        {
          url: "/_next/static/chunks/app/error-8c01b3e5ef4a95bf.js",
          revision: "8c01b3e5ef4a95bf",
        },
        {
          url: "/_next/static/chunks/app/kontak/page-6a76d5cc52d0d8a1.js",
          revision: "6a76d5cc52d0d8a1",
        },
        {
          url: "/_next/static/chunks/app/layout-5c83b9bbe0428fab.js",
          revision: "5c83b9bbe0428fab",
        },
        {
          url: "/_next/static/chunks/app/loading-1761a987857aed5a.js",
          revision: "1761a987857aed5a",
        },
        {
          url: "/_next/static/chunks/app/login/page-e6888170600ce4af.js",
          revision: "e6888170600ce4af",
        },
        {
          url: "/_next/static/chunks/app/not-found-d1d4f789feb4128a.js",
          revision: "d1d4f789feb4128a",
        },
        {
          url: "/_next/static/chunks/app/offline/page-d41670d02691e63e.js",
          revision: "d41670d02691e63e",
        },
        {
          url: "/_next/static/chunks/app/page-bf89a87726178b7d.js",
          revision: "bf89a87726178b7d",
        },
        {
          url: "/_next/static/chunks/app/robots.txt/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/sitemap.xml/route-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/staff/admin/branches/page-8837f7c4f5ef88cb.js",
          revision: "8837f7c4f5ef88cb",
        },
        {
          url: "/_next/static/chunks/app/staff/admin/customers/page-d6a93e5caa7e25ca.js",
          revision: "d6a93e5caa7e25ca",
        },
        {
          url: "/_next/static/chunks/app/staff/admin/dashboard/page-839a1db2f18488be.js",
          revision: "839a1db2f18488be",
        },
        {
          url: "/_next/static/chunks/app/staff/admin/payments/page-665d2ccfeecba753.js",
          revision: "665d2ccfeecba753",
        },
        {
          url: "/_next/static/chunks/app/staff/admin/rates/page-11af81daf24782b5.js",
          revision: "11af81daf24782b5",
        },
        {
          url: "/_next/static/chunks/app/staff/admin/shipments/page-49b124ad7598e610.js",
          revision: "49b124ad7598e610",
        },
        {
          url: "/_next/static/chunks/app/staff/admin/staff/page-839018e6ae5132ca.js",
          revision: "839018e6ae5132ca",
        },
        {
          url: "/_next/static/chunks/app/staff/admin/vehicles/page-ba0af9cdc524e58e.js",
          revision: "ba0af9cdc524e58e",
        },
        {
          url: "/_next/static/chunks/app/staff/cashier/cash-verification/page-c7021fefd9db9a3a.js",
          revision: "c7021fefd9db9a3a",
        },
        {
          url: "/_next/static/chunks/app/staff/cashier/dashboard/page-36406116bac86634.js",
          revision: "36406116bac86634",
        },
        {
          url: "/_next/static/chunks/app/staff/cashier/laporan/page-1b4d29fca3c144b8.js",
          revision: "1b4d29fca3c144b8",
        },
        {
          url: "/_next/static/chunks/app/staff/cashier/payments/page-665d2ccfeecba753.js",
          revision: "665d2ccfeecba753",
        },
        {
          url: "/_next/static/chunks/app/staff/cashier/pesanan/page-d0099d18f4b6284c.js",
          revision: "d0099d18f4b6284c",
        },
        {
          url: "/_next/static/chunks/app/staff/cashier/reports/page-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/staff/cashier/tambah-pesanan/page-8c09ab274d5aebe8.js",
          revision: "8c09ab274d5aebe8",
        },
        {
          url: "/_next/static/chunks/app/staff/courier/dashboard/page-58fc2c6af3ba5910.js",
          revision: "58fc2c6af3ba5910",
        },
        {
          url: "/_next/static/chunks/app/staff/courier/deliveries/page-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/staff/courier/pickups/page-06ae0e00bfbb5b63.js",
          revision: "06ae0e00bfbb5b63",
        },
        {
          url: "/_next/static/chunks/app/staff/courier/shipments/page-49b124ad7598e610.js",
          revision: "49b124ad7598e610",
        },
        {
          url: "/_next/static/chunks/app/staff/layout-1376cf27e48b0ec7.js",
          revision: "1376cf27e48b0ec7",
        },
        {
          url: "/_next/static/chunks/app/staff/login/page-8e9527513019177b.js",
          revision: "8e9527513019177b",
        },
        {
          url: "/_next/static/chunks/app/staff/manager/analytics/page-3f01fa2dee8e79c6.js",
          revision: "3f01fa2dee8e79c6",
        },
        {
          url: "/_next/static/chunks/app/staff/manager/branches/page-8837f7c4f5ef88cb.js",
          revision: "8837f7c4f5ef88cb",
        },
        {
          url: "/_next/static/chunks/app/staff/manager/dashboard/page-913feaae09a8c9b1.js",
          revision: "913feaae09a8c9b1",
        },
        {
          url: "/_next/static/chunks/app/staff/manager/payments/page-665d2ccfeecba753.js",
          revision: "665d2ccfeecba753",
        },
        {
          url: "/_next/static/chunks/app/staff/manager/shipments/page-49b124ad7598e610.js",
          revision: "49b124ad7598e610",
        },
        {
          url: "/_next/static/chunks/app/staff/manager/users/page-839018e6ae5132ca.js",
          revision: "839018e6ae5132ca",
        },
        {
          url: "/_next/static/chunks/app/staff/owner/analytics/page-f3f923f51e4203eb.js",
          revision: "f3f923f51e4203eb",
        },
        {
          url: "/_next/static/chunks/app/staff/owner/dashboard/page-68d61d42f30b3218.js",
          revision: "68d61d42f30b3218",
        },
        {
          url: "/_next/static/chunks/app/tracking/%5BtrackingNumber%5D/page-d1d4f789feb4128a.js",
          revision: "d1d4f789feb4128a",
        },
        {
          url: "/_next/static/chunks/app/tracking/page-d8a4d65fb7e24479.js",
          revision: "d8a4d65fb7e24479",
        },
        {
          url: "/_next/static/chunks/bc98253f.d6fc8a0138855acd.js",
          revision: "d6fc8a0138855acd",
        },
        {
          url: "/_next/static/chunks/framework-eaf13c96191cb608.js",
          revision: "eaf13c96191cb608",
        },
        {
          url: "/_next/static/chunks/main-999f47c04695a867.js",
          revision: "999f47c04695a867",
        },
        {
          url: "/_next/static/chunks/main-app-46f6e5249f0ba95f.js",
          revision: "46f6e5249f0ba95f",
        },
        {
          url: "/_next/static/chunks/pages/_app-e8b861c87f6f033c.js",
          revision: "e8b861c87f6f033c",
        },
        {
          url: "/_next/static/chunks/pages/_error-c8f84f7bd11d43d4.js",
          revision: "c8f84f7bd11d43d4",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-4cf6bebdc049812e.js",
          revision: "4cf6bebdc049812e",
        },
        {
          url: "/_next/static/css/4bcd7c363459b001.css",
          revision: "4bcd7c363459b001",
        },
        {
          url: "/_next/static/media/001f750b538f7a9e-s.woff2",
          revision: "a0c5b49eea2028b7fd6e3b0d0d1c8a0a",
        },
        {
          url: "/_next/static/media/1a634e73dfeff02c-s.woff2",
          revision: "536359ff0fc970eef8be299490b3eaff",
        },
        {
          url: "/_next/static/media/1e41be92c43b3255-s.p.woff2",
          revision: "b7627e3c9663757d70121f2ad4c8d986",
        },
        {
          url: "/_next/static/media/1f173e5e25f3efee-s.woff2",
          revision: "f143fb4877cf7ada1b84423ee86a0198",
        },
        {
          url: "/_next/static/media/4120b0a488381b31-s.woff2",
          revision: "1e5f06cab9f9fe1f9df22e2e2aeae2e4",
        },
        {
          url: "/_next/static/media/48e2044251ef3125-s.woff2",
          revision: "45ea393f38e4ecd97f4dbeb12ef23877",
        },
        {
          url: "/_next/static/media/4f48fe9100901594-s.woff2",
          revision: "4409a8110fdf0ba9059a609f00deafbd",
        },
        {
          url: "/_next/static/media/5eae37b69937655e-s.woff2",
          revision: "a721fb76b97a8ad2d71e6466a663e7d1",
        },
        {
          url: "/_next/static/media/80841ae24d03ed90-s.woff2",
          revision: "f852254ed0041481aaac038e94fb24dc",
        },
        {
          url: "/_next/static/media/904be59b21bd51cb-s.p.woff2",
          revision: "c154477b9affa3a0a47f894c8b80c03c",
        },
        {
          url: "/_next/static/media/970d71e7dcbc144d-s.woff2",
          revision: "c65df4878c04253139ed838edf774dee",
        },
        {
          url: "/_next/static/media/b1f344208eb4edfe-s.woff2",
          revision: "b5818778898bf6d34b7423ff99c6beb4",
        },
        {
          url: "/_next/static/media/b3f718d64f9a6dea-s.woff2",
          revision: "7b8d2e8d1d6863bd8250cdfe9b2a583e",
        },
        {
          url: "/_next/static/media/bf24a9759715e608-s.woff2",
          revision: "d185d272afd4e2d7b4801eabba1463a1",
        },
        {
          url: "/_next/static/yamTA68_5MPQnR2-hcenP/_buildManifest.js",
          revision: "0ffaff4d6b75109d2ee54dd9215dddb1",
        },
        {
          url: "/_next/static/yamTA68_5MPQnR2-hcenP/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/icons/icon-192.png",
          revision: "d922a3c0a0f4c7599ca2eed154c3e269",
        },
        {
          url: "/icons/icon-512.png",
          revision: "891021f41a891c6512bfd0fa8b7f5ec9",
        },
        { url: "/images/BG.png", revision: "08d6fcc67c51111d8aa783198b6d42a3" },
        {
          url: "/images/logo.png",
          revision: "085f5d106d09741347395963b52fcb5e",
        },
        { url: "/manifest.json", revision: "b728fb2eebc346345f5d73f3ad778bfd" },
        { url: "/offline", revision: "yamTA68_5MPQnR2-hcenP" },
        {
          url: "/uploads/07fb0e12f1f2c91566046c4992a2a5ef.webp",
          revision: "c802e2e05dd376e925831a157f7a39f6",
        },
        {
          url: "/uploads/0bd62545e68b44f9312038cb99d9540f.jpg",
          revision: "c68900ecb462127ede5521b3ebee10fa",
        },
        {
          url: "/uploads/0d7541d74351d33457b31e727c3255da.png",
          revision: "5f2f6344e5e601a88c720cd31f90859b",
        },
        {
          url: "/uploads/18128f08377a2897ed286bc59c775d6d.png",
          revision: "2e9645c8a64e55d6ba811f029600ca70",
        },
        {
          url: "/uploads/19cd7b590716da4afe1f57573e794866.png",
          revision: "2e9645c8a64e55d6ba811f029600ca70",
        },
        {
          url: "/uploads/1b4eb4500242d09aef541a7422653114.jpg",
          revision: "d68a7d6d2b1a1707044ea5ba372bf1d3",
        },
        {
          url: "/uploads/1e38fe013e93e859e5bb9e4289c6e0d0.jfif",
          revision: "b859d74ec9337d9c5031ae0c17606acc",
        },
        {
          url: "/uploads/1f07217ae539462ad8bffa6f5e95b638.png",
          revision: "2e9645c8a64e55d6ba811f029600ca70",
        },
        {
          url: "/uploads/25c5d18d985f00b20ff32211a26e85c8.png",
          revision: "2e9645c8a64e55d6ba811f029600ca70",
        },
        {
          url: "/uploads/36c887c4638eb91790784e0e34cd8249.png",
          revision: "937ac3fcc5c806a8aca3f46df5e28fe4",
        },
        {
          url: "/uploads/37c585f10fa5e2e97e98b7309e3dbfd4.png",
          revision: "5dd98e7b923c72bc209fa31e7be01355",
        },
        {
          url: "/uploads/42f9cb4b7155bf01f76bf8cf6e5fa256.jpg",
          revision: "a7509aa2597e04aa2ef57bb40393e193",
        },
        {
          url: "/uploads/465084b2d461472d5d9d40071603b598.png",
          revision: "5f2f6344e5e601a88c720cd31f90859b",
        },
        {
          url: "/uploads/4a2d14f2ac0557fbeda5a537b0b4d139.png",
          revision: "2e9645c8a64e55d6ba811f029600ca70",
        },
        {
          url: "/uploads/4e58b052fbf6a7a79cf0ba817960a08b.png",
          revision: "2e9645c8a64e55d6ba811f029600ca70",
        },
        {
          url: "/uploads/540784ddee20783cd54ba6400e10b647.png",
          revision: "2e9645c8a64e55d6ba811f029600ca70",
        },
        {
          url: "/uploads/5b4fbc11a7a8be66f19173cc877972ca.png",
          revision: "2e9645c8a64e55d6ba811f029600ca70",
        },
        {
          url: "/uploads/66500827ac7156b179d92f0752e40e34.png",
          revision: "178f19043eda72440acd920fbc8d0f09",
        },
        {
          url: "/uploads/6f6a80797aec123393a17cbff589835d.jpg",
          revision: "a7509aa2597e04aa2ef57bb40393e193",
        },
        {
          url: "/uploads/8777b7177dfa6d254ca2bea2909c50a3.png",
          revision: "2e9645c8a64e55d6ba811f029600ca70",
        },
        {
          url: "/uploads/8d9129c07e35257db7976ab9f67116ff.png",
          revision: "2e9645c8a64e55d6ba811f029600ca70",
        },
        {
          url: "/uploads/931e82dcc3d735ace0153b8ca9607bd9.png",
          revision: "2e9645c8a64e55d6ba811f029600ca70",
        },
        {
          url: "/uploads/98b0c5de31c9eec5672a92614184b431.png",
          revision: "937ac3fcc5c806a8aca3f46df5e28fe4",
        },
        {
          url: "/uploads/a0236613e1a139ea9044087a1b7a36e2.png",
          revision: "2e9645c8a64e55d6ba811f029600ca70",
        },
        {
          url: "/uploads/a0bb63f7acb16e72c979cccd64856b47.png",
          revision: "2e9645c8a64e55d6ba811f029600ca70",
        },
        {
          url: "/uploads/a728b721e78f8283ee624361e33538ba.jpg",
          revision: "a7509aa2597e04aa2ef57bb40393e193",
        },
        {
          url: "/uploads/a944c46e2ee426c417c7d6cf72f10f11.png",
          revision: "5f2f6344e5e601a88c720cd31f90859b",
        },
        {
          url: "/uploads/ac85f44b1cfc9d580b6bd2d27eff04cf.webp",
          revision: "c802e2e05dd376e925831a157f7a39f6",
        },
        {
          url: "/uploads/ae9823646d28aed1e1e12691f1edf1f9.jpg",
          revision: "c68900ecb462127ede5521b3ebee10fa",
        },
        {
          url: "/uploads/b8b666980f3e611f7e09c8f3ed4e3332.jpg",
          revision: "a7509aa2597e04aa2ef57bb40393e193",
        },
        {
          url: "/uploads/b95feb25ea5ea96dd00692293f1bf0b1.jpg",
          revision: "a7509aa2597e04aa2ef57bb40393e193",
        },
        {
          url: "/uploads/d387e4d8f2f8d39999fd90012ecf1c55.webp",
          revision: "c802e2e05dd376e925831a157f7a39f6",
        },
        {
          url: "/uploads/e7eb1d8e0ae5be8cc537c7f35ebdd748.png",
          revision: "2e9645c8a64e55d6ba811f029600ca70",
        },
        {
          url: "/uploads/f0d6a78e40b720fad0f6aa89917ca2f1.png",
          revision: "67c7d08127c5244de1fdd3082913512a",
        },
      ],
      { ignoreURLParametersMatching: [] },
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: a,
              event: s,
              state: b,
            }) =>
              a && "opaqueredirect" === a.type
                ? new Response(a.body, {
                    status: 200,
                    statusText: "OK",
                    headers: a.headers,
                  })
                : a,
          },
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https?.*\.(?:js|css|woff2?|png|jpg|jpeg|svg|gif|ico)$/i,
      new e.CacheFirst({
        cacheName: "static-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: 2592e3 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https?:\/\/.*\/api\/v1\/.*$/i,
      new e.NetworkFirst({
        cacheName: "api-cache",
        networkTimeoutSeconds: 4,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https?:\/\/.*$/i,
      new e.NetworkFirst({
        cacheName: "pages-cache",
        networkTimeoutSeconds: 4,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 604800 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET",
    ));
});
