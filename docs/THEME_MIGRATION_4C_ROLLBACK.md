# Phase 4C: Rollback Strategy

**Document Purpose:** Disaster recovery and rollback procedures if migration fails.

---

## Rollback Levels

### Level 1: Soft Rollback (Minutes)
- **Scope:** Recent data only
- **Impact:** Zero downtime
- **Method:** Database rollback + cache clear

### Level 2: Hard Rollback (Hours)
- **Scope:** Full migration reversal
- **Impact:** Short downtime (< 1 hour)
- **Method:** Restore from backup + code revert

### Level 3: Emergency Rollback (24 Hours)
- **Scope:** Complete reset
- **Impact:** Manual data recovery
- **Method:** Restore from cold backup

---

## Level 1: Soft Rollback

### When to Use
- Template data corrupted after migration
- Cache invalidation not working
- Recent publish caused issues
- No data loss in old system

### Procedure (5 minutes)

```typescript
async function softRollback() {
  console.log('Starting Level 1 Rollback...');
  
  // 1. Clear all template caches
  console.log('Clearing cache...');
  await kv.delete('template:*');
  console.log('✅ Cache cleared');
  
  // 2. Revert recent templates to previous version
  const recentTemplates = await db.templates.findAll({
    updated_at: { $gt: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 min
  });
  
  for (const template of recentTemplates) {
    console.log(`Rolling back ${template.id}...`);
    
    // Get previous version
    const previousVersion = await db.template_versions
      .where({ template_id: template.id })
      .orderBy('version', 'desc')
      .offset(1)
      .first();
    
    if (previousVersion) {
      // Revert to previous
      await db.templates.update(
        { id: template.id },
        {
          config: previousVersion.config,
          sections: previousVersion.sections,
          version: previousVersion.version
        }
      );
      console.log(`✅ Reverted ${template.id} to v${previousVersion.version}`);
    }
  }
  
  console.log('✅ Level 1 Rollback complete');
}
```

### Rollback Button (Admin Panel)
```typescript
export function AdminRollbackPanel() {
  const [isRolling, setIsRolling] = useState(false);
  
  async function handleRollback() {
    const confirmed = window.confirm(
      'Revert recent template changes to previous versions?\n' +
      'This will not delete any data, only restore previous versions.'
    );
    
    if (!confirmed) return;
    
    setIsRolling(true);
    
    try {
      const res = await fetch('/api/admin/rollback/soft', {
        method: 'POST'
      });
      
      if (res.ok) {
        showNotification('Rollback successful', 'success');
        // Refresh page
        location.reload();
      } else {
        showNotification('Rollback failed', 'error');
      }
    } finally {
      setIsRolling(false);
    }
  }
  
  return (
    <div className="admin-panel">
      <h3>Emergency Controls</h3>
      <button
        onClick={handleRollback}
        disabled={isRolling}
        className="danger"
      >
        {isRolling ? 'Rolling back...' : 'Rollback to Previous Versions'}
      </button>
    </div>
  );
}
```

---

## Level 2: Hard Rollback

### When to Use
- Migration script corrupted significant data
- Multiple stores affected
- Soft rollback insufficient
- Old code still available and working

### Pre-Migration Backup

```bash
#!/bin/bash
# backup-before-migration.sh

echo "Creating backup before migration..."

# 1. Backup D1 database
wrangler d1 backup create --database=prod-db "pre-migration-$(date +%s)"

# 2. Backup KV
# (KV doesn't have built-in backup, but it's just cache)
# so we can safely delete after restoring DB

# 3. Document current code version
git log --oneline -1 > migration-baseline.txt

# 4. Verify backup
BACKUP_ID=$(wrangler d1 backup list --database=prod-db | head -1 | awk '{print $1}')
echo "✅ Backup created: $BACKUP_ID"

# 5. Store in safe place
echo $BACKUP_ID > migration-backup-id.txt
```

### Restore from Backup

```bash
#!/bin/bash
# rollback-hard.sh

BACKUP_ID=$1

if [ -z "$BACKUP_ID" ]; then
  echo "Usage: ./rollback-hard.sh <backup-id>"
  echo "Available backups:"
  wrangler d1 backup list --database=prod-db
  exit 1
fi

echo "Starting Level 2 Hard Rollback..."
echo "Restoring backup: $BACKUP_ID"

# 1. Restore D1 from backup
echo "Restoring database..."
wrangler d1 backup restore \
  --database=prod-db \
  --backup-id=$BACKUP_ID

if [ $? -ne 0 ]; then
  echo "❌ Database restore failed"
  exit 1
fi

echo "✅ Database restored"

# 2. Clear KV cache completely
echo "Clearing KV cache..."
wrangler kv:namespace delete-namespace --preview false \
  --namespace-id=<TEMPLATE_CACHE_NAMESPACE>

echo "✅ Cache cleared"

# 3. Revert code (optional)
echo "Reverting to pre-migration code..."
git checkout HEAD~1 -- app/components/templates/

# 4. Redeploy
echo "Redeploying..."
npm run deploy

echo "✅ Level 2 Hard Rollback complete"
echo "Verify:"
echo "  - Check template editor"
echo "  - Test loading templates"
echo "  - Verify cache working"
```

### Verification Checklist (After Hard Rollback)

```typescript
async function verifyHardRollback() {
  const checks = [];
  
  // 1. Check templates loaded
  const templates = await fetch('/api/templates?limit=5');
  checks.push({
    name: 'Templates API',
    status: templates.ok ? 'pass' : 'fail'
  });
  
  // 2. Check legacy code available
  try {
    const legacy = await import('app/components/store-templates/rovo/theme.ts');
    checks.push({
      name: 'Legacy templates available',
      status: 'pass'
    });
  } catch {
    checks.push({
      name: 'Legacy templates available',
      status: 'fail'
    });
  }
  
  // 3. Check cache empty
  const cacheStats = await getKVStats();
  checks.push({
    name: 'Cache reset',
    status: cacheStats.count === 0 ? 'pass' : 'warn'
  });
  
  // 4. Manual store check
  checks.push({
    name: 'Manual store verification needed',
    status: 'manual',
    instruction: 'Visit store and check templates render correctly'
  });
  
  return checks;
}
```

---

## Level 3: Emergency Rollback

### When to Use
- Database corruption beyond repair
- Multiple backups corrupted
- Full data loss scenario
- Manual recovery required

### Manual Recovery Process

```bash
#!/bin/bash
# emergency-recovery.sh

echo "🚨 EMERGENCY RECOVERY PROCEDURE"
echo "================================"
echo ""
echo "This will restore from the oldest available backup."
echo "YOU WILL LOSE all changes since that backup."
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Cancelled"
  exit 1
fi

# 1. List all available backups
echo "Available backups:"
wrangler d1 backup list --database=prod-db

# 2. Get oldest backup
OLDEST_BACKUP=$(wrangler d1 backup list --database=prod-db | tail -1 | awk '{print $1}')

echo "Restoring oldest backup: $OLDEST_BACKUP"

# 3. Restore
wrangler d1 backup restore \
  --database=prod-db \
  --backup-id=$OLDEST_BACKUP

# 4. Clear everything
echo "Clearing KV namespace..."
wrangler kv:namespace delete-namespace \
  --namespace-id=<NAMESPACE_ID> \
  --preview=false

# 5. Rebuild from source
echo "Rebuilding application..."
npm run build

# 6. Deploy with old code
echo "Deploying emergency state..."
npm run deploy

echo "✅ Emergency recovery complete"
echo ""
echo "IMPORTANT: Check git history for lost changes"
git log --oneline -5
```

---

## Monitoring During Rollback

### Real-Time Status Dashboard

```typescript
export function RollbackMonitor() {
  const [status, setStatus] = useState('idle');
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const eventSource = new EventSource('/api/admin/rollback/status');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatus(data.status);
      setLogs(prev => [...prev, data.message]);
      
      // Auto-scroll to latest
      setTimeout(() => {
        const logContainer = document.getElementById('logs');
        if (logContainer) {
          logContainer.scrollTop = logContainer.scrollHeight;
        }
      }, 0);
    };
    
    return () => eventSource.close();
  }, []);
  
  return (
    <div className="rollback-monitor">
      <h2>Rollback Status: {status}</h2>
      
      <div id="logs" className="logs">
        {logs.map((log, i) => (
          <div key={i} className="log-line">
            {log}
          </div>
        ))}
      </div>
      
      {status === 'complete' && (
        <button onClick={() => location.reload()}>
          Reload Application
        </button>
      )}
    </div>
  );
}
```

---

## Post-Rollback Actions

### After Any Rollback

```typescript
async function postRollbackCleanup() {
  console.log('Post-rollback cleanup...');
  
  // 1. Verify data integrity
  console.log('Verifying data...');
  const audit = await postMigrationAudit();
  if (!audit.success) {
    console.error('Data verification failed:', audit.issues);
    // Alert support team
    await alertSupportTeam('Rollback verification failed', audit.issues);
  }
  
  // 2. Clear all caches
  console.log('Clearing caches...');
  await kv.delete('*');
  
  // 3. Rebuild cache from database
  console.log('Rebuilding cache...');
  const templates = await db.templates.findAll({
    status: 'published'
  });
  
  for (const template of templates) {
    await cacheTemplate(template);
  }
  
  // 4. Log rollback event
  await db.insert('system_events', {
    event_type: 'rollback',
    severity: 'critical',
    message: 'Migration rollback executed',
    timestamp: new Date()
  });
  
  // 5. Notify team
  await sendAlert({
    channel: 'tech-incidents',
    title: 'Migration Rollback Completed',
    message: 'System has been rolled back to pre-migration state',
    severity: 'high'
  });
  
  console.log('✅ Post-rollback cleanup complete');
}
```

---

## Communication Plan

### Notify Stakeholders

```typescript
async function notifyRollback(level: 'soft' | 'hard' | 'emergency') {
  const messages = {
    soft: {
      users: 'We made a small adjustment. Templates may not display for 1 minute.',
      team: 'Soft rollback completed. Monitor for issues.',
      status: '🟡 Degraded Service'
    },
    hard: {
      users: 'We are performing scheduled maintenance. Service may be unavailable for 30 minutes.',
      team: 'Hard rollback in progress. Database being restored.',
      status: '🔴 Service Maintenance'
    },
    emergency: {
      users: 'Emergency maintenance in progress. We apologize for the disruption.',
      team: 'EMERGENCY ROLLBACK INITIATED. All hands on deck.',
      status: '🔴 Service Down'
    }
  };
  
  const msg = messages[level];
  
  // Notify users via status page
  await updateStatusPage(msg.status);
  
  // Email users
  await sendUserEmail(msg.users);
  
  // Alert team
  await sendSlackMessage({
    channel: '#incidents',
    text: msg.team,
    severity: level
  });
}
```

---

## Rollback Decision Tree

```
Problem Detected
  ├─ Recent template issue?
  │  └─ YES → Level 1 (Soft Rollback)
  │
  ├─ Multiple stores affected?
  │  └─ YES → Level 2 (Hard Rollback)
  │
  └─ Database corruption?
     └─ YES → Level 3 (Emergency Rollback)
```

---

## Checklist: Rollback Readiness

- [ ] Level 1 rollback script tested
- [ ] Level 2 backup procedure automated
- [ ] Level 3 emergency procedure documented
- [ ] Backups created before migration
- [ ] Legacy code still available
- [ ] Admin panel has rollback button
- [ ] Communication templates prepared
- [ ] Support team trained
- [ ] Monitoring alerts configured
- [ ] Recovery time objective (RTO) < 1 hour
- [ ] Recovery point objective (RPO) < 1 hour

---

## Next Steps

See [Phase 5A: Migration Script](../THEME_MIGRATION_5A_SCRIPT.md) for executing the migration.
