import { query } from "../../db/pool.js";

export const logAudit = async ({
  actorUserId,
  actorRole,
  action,
  entityType,
  entityId,
  metadata,
  ipAddress,
  userAgent,
}) => {
  const sql = `
    INSERT INTO audit_log
      (actor_user_id, actor_role, action, entity_type, entity_id, metadata, ip_address, user_agent)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  await query(sql, [
    actorUserId || null,
    actorRole || null,
    action,
    entityType || null,
    entityId || null,
    metadata ? JSON.stringify(metadata) : null,
    ipAddress || null,
    userAgent || null,
  ]);
};
