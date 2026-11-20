import { describe, expect, it } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { initSchema, insertLead, type Db } from "../../server/db";

describe("DB schema + migration", () => {
  it("tạo schema mới với đủ cột KPI cho leads", () => {
    const db = new DatabaseSync(":memory:");
    initSchema(db);
    const columns = (db.prepare("PRAGMA table_info(leads)").all() as { name: string }[]).map((row) => row.name);
    for (const column of ["status", "offer_code", "offer_name", "overall", "industry", "company_size", "role"]) {
      expect(columns).toContain(column);
    }
    db.close();
  });

  it("migration idempotent: bảng leads cũ được thêm cột, dữ liệu cũ không mất", () => {
    const db = new DatabaseSync(":memory:");
    db.exec(`
      CREATE TABLE leads (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        report_id TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        is_representative INTEGER NOT NULL DEFAULT 0,
        consent INTEGER NOT NULL DEFAULT 0,
        consent_version TEXT,
        marketing_opt_in INTEGER NOT NULL DEFAULT 0,
        website TEXT,
        ip_hash TEXT,
        user_agent TEXT,
        created_at TEXT NOT NULL
      );
      INSERT INTO leads (id, session_id, report_id, name, created_at)
      VALUES ('lead-cu', 's1', 'r1', 'Khách cũ', '2026-01-01T00:00:00.000Z');
    `);

    initSchema(db);
    initSchema(db); // gọi lại không lỗi
    const columns = (db.prepare("PRAGMA table_info(leads)").all() as { name: string }[]).map((row) => row.name);
    expect(columns).toContain("status");
    expect(columns).toContain("company_size");

    const legacy = db.prepare("SELECT * FROM leads WHERE id = ?").get("lead-cu") as { status: string; overall: number | null };
    expect(legacy.status).toBe("new");
    expect(legacy.overall).toBeNull();

    insertLead(db as unknown as Db, {
      id: "lead-moi",
      sessionId: "s2",
      reportId: "r2",
      name: "Khách mới",
      phone: "0901234567",
      email: null,
      isRepresentative: true,
      consent: true,
      consentVersion: "2026-11-v1",
      marketingOptIn: false,
      website: null,
      ipHash: "hash",
      userAgent: "test",
      status: "new",
      offerCode: "foundation",
      offerName: "Gói Nền tảng",
      overall: 7.4,
      industry: "Xây dựng",
      companySize: "6-20",
      role: "founder",
      now: "2026-11-14T07:00:00.000Z",
    });
    const created = db.prepare("SELECT * FROM leads WHERE id = ?").get("lead-moi") as {
      status: string;
      offer_code: string;
      offer_name: string;
      overall: number;
      industry: string;
      company_size: string;
      role: string;
    };
    expect(created.status).toBe("new");
    expect(created.offer_code).toBe("foundation");
    expect(created.offer_name).toBe("Gói Nền tảng");
    expect(created.overall).toBe(7.4);
    expect(created.industry).toBe("Xây dựng");
    expect(created.company_size).toBe("6-20");
    expect(created.role).toBe("founder");
    db.close();
  });
});
