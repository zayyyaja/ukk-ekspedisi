"use client";

import { useEffect, useState } from "react";

export function OpsStatusBar() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 30000);
        return () => clearInterval(interval);
    }, []);

    const formatted = time.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Jakarta",
    });

    return (
        <div className="ops-bar" role="status" aria-label="Operational status">
            <span className="ops-bar-dot live shrink-0" aria-hidden="true" />
            <span>System online</span>
            <span className="ops-bar-separator shrink-0" aria-hidden="true" />
            <span>Last sync · {formatted} WIB</span>
            <span className="ops-bar-separator shrink-0" aria-hidden="true" />
            <span className="text-warning-soft/80" style={{ color: 'var(--color-warning)' }}>
                ● 4 pending
            </span>
        </div>
    );
}
