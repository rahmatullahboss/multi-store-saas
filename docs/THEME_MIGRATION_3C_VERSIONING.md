# Phase 3C: Versioning & Rollback

**Document Purpose:** Versioning strategy, rollback procedures, and recovery plans.

---

## Versioning Model

### Version Semantics
```
v1  → First publish (initial)
v2  → Second publish (edit + republish)
v3  → Third publish (rollback counts as new version)
...

ALL versions are immutable and retrievable
```

### Version Lifecycle
```
CREATE: When user publishes
STORE: Permanently in template_versions table
READ: For history, previews, rollback
UPDATE: Never updated (immutable)
DELETE: Only with admin action (archival)
```

---

## Version Storage Strategy

### Keep All Versions
```sql
-- Good for:
-- ✅ Full audit trail
-- ✅ Safe rollback
-- ✅ Compliance (retention policy)

-- Concern: Storage growth
-- Solution: Archive old versions after 1 year
```

### Archive Old Versions
```typescript
// Cron job: Run monthly
async function archiveOldVersions() {
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  
  // Move to archive table
  const oldVersions = await db.template_versions.findAll({
    created_at: { $lt: oneYearAgo }
  });
  
  for (const version of oldVersions) {
    await db.template_versions_archive.insert(version);
    await db.template_versions.delete(version.id);
  }
  
  console.log(`Archived ${oldVersions.length} versions`);
}
```

---

## Rollback Scenarios

### Scenario 1: Accidental Bad Publish
```
Timeline:
- v1 (March 1): Good version
- v2 (March 5): Bad version (published by mistake)
- NOW: Need to revert

Action:
1. Click "Rollback to v1"
2. Creates v3 (copy of v1 config/sections)
3. v3 becomes published
4. Live reverted immediately
```

### Scenario 2: Browser Cache Issue
```
Timeline:
- v1 (Published): Correct theme
- User sees v0 (cached): Old colors

Action:
1. Invalidate KV cache: template:{storeId}:published
2. Clear browser cache header: Cache-Control: max-age=0
3. User refreshes, gets v1
```

### Scenario 3: Corrupted Data
```
Timeline:
- v1, v2, v3 all corrupted
- Need to rollback to v0 (before migration)

Action:
1. Restore backup of template_versions table
2. Rebuild from backup
3. Verify data integrity
```

---

## Rollback Implementation

### Simple Rollback (One Click)
```typescript
// User clicks "Rollback to v1"
async function quickRollback(
  templateId: string,
  targetVersion: number,
  storeId: string,
  userId: string
) {
  // 1. Get target version (immutable)
  const target = await db.template_versions.findOne({
    template_id: templateId,
    store_id: storeId,
    version: targetVersion
  });
  
  if (!target) {
    throw new Error('Version not found');
  }
  
  // 2. Create new version (copy)
  const newVersion = {
    id: generateId(),
    template_id: templateId,
    store_id: storeId,
    version: target.version + 1,
    config: target.config,              // Exact copy
    sections: target.sections,          // Exact copy
    changelog: `Rolled back to v${target.version}`,
    created_by: userId,
    created_at: new Date()
  };
  
  await db.template_versions.insert(newVersion);
  
  // 3. Update published template
  await db.templates.update(
    { id: templateId, store_id: storeId },
    {
      version: newVersion.version,
      config: target.config,
      sections: target.sections,
      updated_at: new Date(),
      updated_by: userId
    }
  );
  
  // 4. Clear cache
  await kv.delete(`template:${storeId}:published`);
  
  return newVersion;
}
```

---

## Diff & Preview Before Rollback

### Calculate Diff
```typescript
export interface VersionDiff {
  versionFrom: number;
  versionTo: number;
  configChanges: Record<string, any>;
  sectionChanges: {
    added: Section[];
    removed: Section[];
    modified: { before: Section; after: Section }[];
  };
}

function diffVersions(from: Version, to: Version): VersionDiff {
  return {
    versionFrom: from.version,
    versionTo: to.version,
    configChanges: deepDiff(from.config, to.config),
    sectionChanges: {
      added: to.sections.filter(s =>
        !from.sections.find(fs => fs.id === s.id)
      ),
      removed: from.sections.filter(s =>
        !to.sections.find(ts => ts.id === s.id)
      ),
      modified: from.sections
        .map(fs => {
          const ts = to.sections.find(s => s.id === fs.id);
          return ts && !deepEqual(fs, ts) ? { before: fs, after: ts } : null;
        })
        .filter(Boolean)
    }
  };
}
```

### Preview Endpoint
```typescript
// GET /api/templates/:id/preview-rollback/:version
export async function GET(req: Request) {
  const { id, version } = req.params;
  const storeId = req.user.storeId;
  
  const current = await db.templates.findOne({
    id,
    store_id: storeId,
    status: 'published'
  });
  
  const target = await db.template_versions.findOne({
    template_id: id,
    store_id: storeId,
    version: parseInt(version)
  });
  
  const diff = diffVersions(current, target);
  
  return json({
    current: current.version,
    target: target.version,
    diff,
    warning: generateWarning(diff)
  });
}

function generateWarning(diff: VersionDiff): string {
  const changes = [];
  
  if (diff.sectionChanges.removed.length > 0) {
    changes.push(
      `${diff.sectionChanges.removed.length} sections will be removed`
    );
  }
  
  if (Object.keys(diff.configChanges).length > 0) {
    changes.push('Theme colors/fonts will change');
  }
  
  return changes.join('\n');
}
```

---

## Rollback UI Component

```typescript
export function RollbackModal({ template, onSuccess }) {
  const [selectedVersion, setSelectedVersion] = useState<number>();
  const [diff, setDiff] = useState<VersionDiff>();
  const [isLoading, setIsLoading] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  
  const versions = useVersionHistory(template.id);
  
  async function handlePreview(version: number) {
    setIsLoading(true);
    
    try {
      const res = await fetch(
        `/api/templates/${template.id}/preview-rollback/${version}`
      );
      const data = await res.json();
      setDiff(data.diff);
      setSelectedVersion(version);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleConfirmRollback() {
    if (!selectedVersion) return;
    
    setIsRollingBack(true);
    
    try {
      const res = await fetch(
        `/api/templates/${template.id}/rollback/${selectedVersion}`,
        { method: 'POST' }
      );
      
      if (res.ok) {
        showNotification('Rolled back successfully', 'success');
        onSuccess();
      }
    } finally {
      setIsRollingBack(false);
    }
  }
  
  return (
    <Modal>
      <h2>Rollback to Previous Version</h2>
      
      <div className="version-list">
        {versions.map(v => (
          <button
            key={v.version}
            onClick={() => handlePreview(v.version)}
            className={selectedVersion === v.version ? 'active' : ''}
          >
            <strong>v{v.version}</strong>
            <span>{formatDate(v.created_at)}</span>
            <span>{v.changelog}</span>
          </button>
        ))}
      </div>
      
      {diff && (
        <DiffPreview diff={diff} />
      )}
      
      {selectedVersion && (
        <button
          onClick={handleConfirmRollback}
          disabled={isRollingBack}
        >
          {isRollingBack ? 'Rolling back...' : 'Confirm Rollback'}
        </button>
      )}
    </Modal>
  );
}

function DiffPreview({ diff }: { diff: VersionDiff }) {
  return (
    <div className="diff-preview">
      <h3>Changes</h3>
      
      {diff.sectionChanges.removed.length > 0 && (
        <div className="removed">
          <h4>Sections to be removed:</h4>
          {diff.sectionChanges.removed.map(s => (
            <p key={s.id}>- {s.type} ({s.id})</p>
          ))}
        </div>
      )}
      
      {diff.sectionChanges.added.length > 0 && (
        <div className="added">
          <h4>Sections to be added:</h4>
          {diff.sectionChanges.added.map(s => (
            <p key={s.id}>+ {s.type} ({s.id})</p>
          ))}
        </div>
      )}
      
      {Object.keys(diff.configChanges).length > 0 && (
        <div className="config-changed">
          <h4>Theme changes:</h4>
          {Object.entries(diff.configChanges).map(([key, value]) => (
            <p key={key}>{key}: {JSON.stringify(value)}</p>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Version Retention Policy

### Recommendation
```
- Keep all versions for 1 year
- Archive versions older than 1 year
- Admins can manually delete archived versions
- Maintain at least last 10 versions always
```

### Implementation
```typescript
async function purgeOldVersions(templateId: string, storeId: string) {
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  
  // Get all versions older than 1 year
  const oldVersions = await db.template_versions.findAll({
    template_id: templateId,
    store_id: storeId,
    created_at: { $lt: oneYearAgo }
  }).orderBy('version', 'desc');
  
  // Keep at least 10 most recent versions
  const toDelete = oldVersions.slice(10);
  
  for (const version of toDelete) {
    await db.template_versions.delete(version.id);
  }
}
```

---

## Emergency Recovery

### Database Backup Before Publish
```bash
# Before major publish, back up D1
wrangler d1 backup create prod-db

# Or manual:
npm run db:backup -- --prefix=prelaunch_$(date +%s)
```

### Restore from Backup
```bash
# Restore entire templates table
npm run db:restore -- --backup=prelaunch_1234567890

# Or restore specific template:
DELETE FROM templates WHERE id = 'template_abc';
DELETE FROM template_versions WHERE template_id = 'template_abc';
-- Then restore from backup export
```

---

## Audit Trail

### Version Creation Log
```typescript
interface VersionAuditLog {
  version_id: string;
  template_id: string;
  store_id: string;
  action: 'publish' | 'rollback' | 'restore';
  from_version?: number;
  to_version: number;
  user_id: string;
  timestamp: Date;
  changelog?: string;
}

// Log every version action
async function logVersionAction(log: VersionAuditLog) {
  await db.version_audit_logs.insert(log);
}
```

---

## Checklist: Versioning & Rollback

- [ ] Version table with immutability enforced
- [ ] Rollback endpoint creates new version
- [ ] Diff calculation working
- [ ] Preview before rollback UI
- [ ] Version history UI showing changelog
- [ ] Archive job scheduled (monthly)
- [ ] Backup procedure documented
- [ ] Audit logs enabled
- [ ] Recovery tested (dry-run)

---

## Next Steps

See [Phase 4A: Validation Schema](../THEME_MIGRATION_4A_VALIDATION.md) for pre-publish validation.
