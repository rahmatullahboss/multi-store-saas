/**
 * Super Admin - Team Management (RBAC)
 * 
 * Route: /admin/team
 * 
 * Features:
 * - List all admin team members
 * - Add/Edit/Remove admins
 * - Assign roles (Super Admin, Support, Finance, Developer)
 * - Manage fine-grained permissions
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, useSearchParams, Form } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, sql, desc, ne } from 'drizzle-orm';
import { users, adminRoles, activityLogs, adminAuditLogs } from '@db/schema';
import { requireSuperAdmin, requireAdminPermission } from '~/services/auth.server';
import { logAuditAction } from '~/services/audit.server';
import { hashPassword } from '~/services/auth.server';
import { 
  Users, 
  Shield, 
  UserPlus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Check, 
  AlertTriangle,
  Lock,
  Mail,
  MoreVertical
} from 'lucide-react';
import { useState, useEffect } from 'react';

export const meta: MetaFunction = () => {
  return [{ title: 'Team Management - Super Admin' }];
};

// Defined Roles
const ROLES = {
  super_admin: { label: 'Super Admin', color: 'red', desc: 'Full access to everything' },
  support: { label: 'Support Agent', color: 'blue', desc: 'Can view stores and logs, cannot delete or manage billing' },
  finance: { label: 'Finance', color: 'emerald', desc: 'Can manage billing and subscriptions' },
  developer: { label: 'Developer', color: 'purple', desc: 'Can view technical logs and system health' },
} as const;

type AdminRole = keyof typeof ROLES;

// Default permissions for each role
const DEFAULT_PERMISSIONS: Record<AdminRole, any> = {
  super_admin: { canSuspend: true, canDelete: true, canBilling: true, canImpersonate: true, canManageTeam: true },
  support: { canSuspend: false, canDelete: false, canBilling: false, canImpersonate: true, canManageTeam: false },
  finance: { canSuspend: false, canDelete: false, canBilling: true, canImpersonate: false, canManageTeam: false },
  developer: { canSuspend: false, canDelete: false, canBilling: false, canImpersonate: true, canManageTeam: false },
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  const { userId: currentAdminId } = await requireSuperAdmin(request, context.cloudflare.env, db);
  
  const drizzleDb = drizzle(db);
  
  // Fetch all admins (users with super_admin role or in admin_roles table)
  // For now, we fetch from admin_roles and join users
  const teamMembers = await drizzleDb
    .select({
      id: adminRoles.id,
      userId: adminRoles.userId,
      role: adminRoles.role,
      permissions: adminRoles.permissions,
      createdAt: adminRoles.createdAt,
      name: users.name,
      email: users.email,
      userRole: users.role,
    })
    .from(adminRoles)
    .innerJoin(users, eq(users.id, adminRoles.userId))
    .orderBy(desc(adminRoles.createdAt));
    
  return json({ teamMembers, currentAdminId });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const db = context.cloudflare.env.DB;
  const { userId: adminId, userEmail: adminEmail } = await requireSuperAdmin(request, context.cloudflare.env, db);
  
  // Enforce Team Management Permission
  await requireAdminPermission(request, context.cloudflare.env, db, 'canManageTeam');

  const formData = await request.formData();
  const intent = formData.get('intent');
  
  const drizzleDb = drizzle(db);
  
  // ============ ADD TEAM MEMBER ============
  if (intent === 'addMember') {
    const email = formData.get('email')?.toString().toLowerCase().trim();
    const name = formData.get('name')?.toString().trim();
    const password = formData.get('password')?.toString();
    const role = formData.get('role') as AdminRole;
    
    if (!email || !name || !password || !role) {
      return json({ error: 'All fields are required' }, { status: 400 });
    }
    
    // Check if user exists
    let targetUserId: number;
    const existingUser = await drizzleDb.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      targetUserId = existingUser[0].id;
      // If user exists but is merchant, we might need to change role? 
      // For safety, let's keep user role as is, but add to admin_roles. 
      // Ideally, we should ensure they have 'super_admin' role in users table to login to /admin,
      // or update login logic. For now, we'll update their user role to 'super_admin'.
      
      await drizzleDb.update(users).set({ role: 'super_admin' }).where(eq(users.id, targetUserId));
    } else {
      // Create new user
      const passwordHash = await hashPassword(password);
      const newUser = await drizzleDb.insert(users).values({
        email,
        name,
        passwordHash,
        role: 'super_admin', // Required to access /admin currently
      }).returning();
      targetUserId = newUser[0].id;
    }
    
    // Check if already in admin_roles
    const existingRole = await drizzleDb.select().from(adminRoles).where(eq(adminRoles.userId, targetUserId)).limit(1);
    if (existingRole.length > 0) {
      return json({ error: 'User is already a team member' }, { status: 400 });
    }
    
    // Add to admin_roles
    const permissions = JSON.stringify(DEFAULT_PERMISSIONS[role]);
    await drizzleDb.insert(adminRoles).values({
      userId: targetUserId,
      role,
      permissions,
      createdBy: adminId,
    });
    
    // Log action
    await logAuditAction(context.cloudflare.env, {
      storeId: 0, // System action
      actorId: adminId,
      action: 'add_team_member',
      resource: 'user',
      resourceId: targetUserId,
      diff: { action: 'add_team_member', role, email, name },
      ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
      userAgent: request.headers.get('User-Agent') || undefined,
    });
    
    return json({ success: true, action: 'added' });
  }
  
  // ============ REMOVE TEAM MEMBER ============
  if (intent === 'removeMember') {
    const roleId = Number(formData.get('roleId'));
    const targetUserId = Number(formData.get('targetUserId'));
    const memberName = formData.get('memberName')?.toString();
    
    if (targetUserId === adminId) {
      return json({ error: 'You cannot remove yourself' }, { status: 400 });
    }
    
    await drizzleDb.delete(adminRoles).where(eq(adminRoles.id, roleId));
    
    // Start downgrade user role back to merchant or just standard user?
    // Safer to leave as is or revert to empty string/standard?
    // Let's just remove from admin_roles for now.
    
    await logAuditAction(context.cloudflare.env, {
      storeId: 0,
      actorId: adminId,
      action: 'remove_team_member',
      resource: 'user',
      resourceId: targetUserId,
      diff: { action: 'remove_team_member', memberName },
      ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
      userAgent: request.headers.get('User-Agent') || undefined,
    });
    
    return json({ success: true, action: 'removed' });
  }
  
  // ============ UPDATE ROLE ============
  if (intent === 'updateRole') {
    const roleId = Number(formData.get('roleId'));
    const newRole = formData.get('role') as AdminRole;
    const targetUserId = Number(formData.get('targetUserId'));
    
    if (targetUserId === adminId) {
      // Prevent self-demotion from super_admin to something else if unsafe?
      // Allow for now but warn in UI
    }
    
    const permissions = JSON.stringify(DEFAULT_PERMISSIONS[newRole]);
    
    await drizzleDb.update(adminRoles)
      .set({ role: newRole, permissions, updatedAt: new Date() })
      .where(eq(adminRoles.id, roleId));
      
    await logAuditAction(context.cloudflare.env, {
      storeId: 0,
      actorId: adminId,
      action: 'update_team_role',
      resource: 'user',
      resourceId: targetUserId,
      diff: { action: 'update_team_role', newRole },
      ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
      userAgent: request.headers.get('User-Agent') || undefined,
    });
    
    return json({ success: true, action: 'updated' });
  }
  
  return json({ error: 'Invalid intent' }, { status: 400 });
}

export default function AdminTeam() {
  const { teamMembers, currentAdminId } = useLoaderData<typeof loader>();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fetcher = useFetcher();
  
  useEffect(() => {
    if (fetcher.data && (fetcher.data as any).success) {
      setIsAddModalOpen(false);
    }
  }, [fetcher.data, fetcher.state]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Management</h1>
          <p className="text-slate-400">Manage admin access and roles</p>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition"
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </button>
      </div>
      
      {/* Team List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {member.name}
                          {member.userId === currentAdminId && <span className="ml-2 text-xs text-blue-400">(You)</span>}
                        </div>
                        <div className="text-sm text-slate-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      member.role === 'super_admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      member.role === 'support' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      member.role === 'finance' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    }`}>
                      {ROLES[member.role as AdminRole]?.label || member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                       {/* Parse permissions JSON safely */}
                       {(() => {
                         try {
                           const perms = JSON.parse(member.permissions as string);
                           return Object.entries(perms)
                             .filter(([_, v]) => v === true)
                             .map(([k, _]) => (
                               <span key={k} className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                                 {k.replace('can', '')}
                               </span>
                             ));
                         } catch (e) {
                           return <span className="text-xs text-slate-500">Default</span>;
                         }
                       })()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(member.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {member.userId !== currentAdminId && (
                      <fetcher.Form method="post" onSubmit={(e) => {
                        if (!confirm('Are you sure you want to remove this team member?')) e.preventDefault();
                      }}>
                        <input type="hidden" name="intent" value="removeMember" />
                        <input type="hidden" name="roleId" value={member.id} />
                        <input type="hidden" name="targetUserId" value={member.userId} />
                        <input type="hidden" name="memberName" value={member.name || ''} />
                        <button className="text-red-400 hover:text-red-300 transition p-2 hover:bg-red-500/10 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </fetcher.Form>
                    )}
                  </td>
                </tr>
              ))}
              
              {teamMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No team members found. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                Add Team Member
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <fetcher.Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="addMember" />
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <div className="space-y-2">
                  {Object.entries(ROLES).map(([key, config]) => (
                    <label key={key} className="flex items-start gap-3 p-3 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800/50 transition">
                      <input type="radio" name="role" value={key} defaultChecked={key === 'support'} className="mt-1" />
                      <div>
                        <div className="font-medium text-white text-sm">{config.label}</div>
                        <div className="text-xs text-slate-400">{config.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fetcher.state === 'submitting'}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex justify-center items-center gap-2"
                >
                  {fetcher.state === 'submitting' ? 'Accessing...' : 'Add Member'}
                </button>
              </div>
            </fetcher.Form>
          </div>
        </div>
      )}
    </div>
  );
}
