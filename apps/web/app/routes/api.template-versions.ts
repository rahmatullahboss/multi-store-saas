/**
 * API: Template Versions
 * 
 * Manage template version history and rollback
 * 
 * GET    /api/template-versions?templateId=xxx - List versions
 * POST   /api/template-versions/rollback - Rollback to a version
 */

import { type ActionFunction, type LoaderFunction } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import { getSession } from '~/services/auth.server';
import { templateVersions, parseTemplateVersion, type TemplateVersion } from '@db/schema_versions';
import { templateSectionsDraft, templateSectionsPublished, themeSettingsDraft, themeSettingsPublished, themeTemplates } from '@db/schema_templates';

// GET: List versions for a template
export const loader: LoaderFunction = async ({ request, context }) => {
  const session = await getSession(request, context.cloudflare.env);
  const storeId = session.get('storeId');
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const url = new URL(request.url);
  
  const templateId = url.searchParams.get('templateId');
  const themeId = url.searchParams.get('themeId');
  const limit = parseInt(url.searchParams.get('limit') || '10');

  if (!templateId && !themeId) {
    return json({ error: 'Missing templateId or themeId parameter' }, { status: 400 });
  }

  let query;
  if (templateId) {
    query = db.select().from(templateVersions)
      .where(and(
        eq(templateVersions.storeId, storeId),
        eq(templateVersions.templateId, templateId)
      ))
      .orderBy(desc(templateVersions.version))
      .limit(limit);
  } else {
    query = db.select().from(templateVersions)
      .where(and(
        eq(templateVersions.storeId, storeId),
        eq(templateVersions.themeId, themeId!)
      ))
      .orderBy(desc(templateVersions.version))
      .limit(limit);
  }

  const versions = await query;

  return json({
    success: true,
    versions: versions.map(v => ({
      ...v,
      sectionsCount: JSON.parse(v.sectionsJson).length,
    })),
  });
};

// POST: Rollback to a specific version
export const action: ActionFunction = async ({ request, context }) => {
  const session = await getSession(request, context.cloudflare.env);
  const storeId = session.get('storeId');
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const body = await request.json();
  
  const { versionId, target = 'draft' } = body as { 
    versionId: string; 
    target?: 'draft' | 'published' | 'both';
  };

  if (!versionId) {
    return json({ error: 'Missing versionId' }, { status: 400 });
  }

  // Get the version
  const version = await db.select().from(templateVersions)
    .where(and(
      eq(templateVersions.id, versionId),
      eq(templateVersions.storeId, storeId)
    ))
    .limit(1);

  if (version.length === 0) {
    return json({ error: 'Version not found' }, { status: 404 });
  }

  const ver = version[0];
  const sections = JSON.parse(ver.sectionsJson);
  const settings = ver.settingsJson ? JSON.parse(ver.settingsJson) : null;

  try {
    // Rollback to draft
    if (target === 'draft' || target === 'both') {
      // Delete current draft sections
      await db.delete(templateSectionsDraft)
        .where(and(
          eq(templateSectionsDraft.templateId, ver.templateId),
          eq(templateSectionsDraft.shopId, storeId)
        ));

      // Insert version sections to draft
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        await db.insert(templateSectionsDraft).values({
          id: `draft_${section.id}_${Date.now()}_${i}`,
          shopId: storeId,
          templateId: ver.templateId,
          type: section.type,
          enabled: 1,
          sortOrder: i,
          propsJson: JSON.stringify(section.settings || {}),
          blocksJson: JSON.stringify(section.blocks || []),
          version: 1,
        });
      }

      // Update theme settings draft if available
      if (settings) {
        await db.update(themeSettingsDraft)
          .set({
            settingsJson: JSON.stringify(settings),
            updatedAt: new Date().toISOString() as unknown as Date,
          })
          .where(and(
            eq(themeSettingsDraft.themeId, ver.themeId),
            eq(themeSettingsDraft.shopId, storeId)
          ));
      }
    }

    // Rollback to published
    if (target === 'published' || target === 'both') {
      // Delete current published sections
      await db.delete(templateSectionsPublished)
        .where(and(
          eq(templateSectionsPublished.templateId, ver.templateId),
          eq(templateSectionsPublished.shopId, storeId)
        ));

      // Insert version sections to published
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        await db.insert(templateSectionsPublished).values({
          id: `pub_${section.id}_${Date.now()}_${i}`,
          shopId: storeId,
          templateId: ver.templateId,
          type: section.type,
          enabled: 1,
          sortOrder: i,
          propsJson: JSON.stringify(section.settings || {}),
          blocksJson: JSON.stringify(section.blocks || []),
        });
      }

      // Update theme settings published if available
      if (settings) {
        await db.update(themeSettingsPublished)
          .set({
            settingsJson: JSON.stringify(settings),
          })
          .where(and(
            eq(themeSettingsPublished.themeId, ver.themeId),
            eq(themeSettingsPublished.shopId, storeId)
          ));
      }
    }

    return json({
      success: true,
      message: `Rolled back to version ${ver.version}${ver.label ? ` (${ver.label})` : ''}`,
      target,
    });

  } catch (error) {
    console.error('Rollback error:', error);
    return json({ 
      error: 'Failed to rollback', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
};


export default function() {}
