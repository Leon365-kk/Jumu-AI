import { Router, type Request, type Response } from 'express';
import { supabase } from '../lib/supabase.ts';

const router = Router();

// POST /api/organizations
// Create a new organization
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, description, contactEmail, settings, adminUserId } = req.body;

    if (!name || !type || !adminUserId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name,
        type,
        description,
        contact_email: contactEmail,
        settings
      } as any)
      .select()
      .single() as any;

    if (orgError) throw orgError;

    if (!organization) {
      return res.status(500).json({ error: 'Failed to create organization' });
    }

    // Run profile creation and user update in parallel
    const [profileResult, userResult] = await Promise.all([
      supabase
        .from('organization_profiles')
        .upsert({
          user_id: adminUserId,
          organization_id: organization.id,
          role: 'admin'
        } as any)
        .eq('user_id', adminUserId),
      supabase
        .from('users')
        .upsert({
          id: adminUserId,
          entity_type: 'organization',
          entity_id: organization.id
        } as any)
        .eq('id', adminUserId)
    ]);

    if (profileResult.error) throw profileResult.error;
    if (userResult.error) throw userResult.error;

    res.json({ success: true, organization });
  } catch (error: any) {
    console.error('Create organization error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/organizations/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        groups (*),
        profiles:organization_profiles (
          user_id,
          role,
          team
        )
      `)
      .eq('id', id)
      .limit(1, { foreignTable: 'groups' })
      .limit(50, { foreignTable: 'profiles' })
      .single();

    if (error) throw error;

    res.json({ organization: data });
  } catch (error: any) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/organizations/:id/groups
// Create a group within an organization
router.post('/:id/groups', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, adminId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing group name' });
    }

    const { data, error } = await supabase
      .from('groups')
      .insert({
        organization_id: id,
        name,
        description,
        admin_id: adminId
      } as any)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, group: data });
  } catch (error: any) {
    console.error('Create group error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/organizations/:id/groups
router.get('/:id/groups', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        memberships:group_memberships (
          user_id,
          role,
          joined_at
        )
      `)
      .eq('organization_id', id)
      .limit(50)
      .limit(20, { foreignTable: 'memberships' });

    if (error) throw error;

    res.json({ groups: data || [] });
  } catch (error: any) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/groups/:id/join
// Join a group
router.post('/groups/:id/join', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Verify group exists
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('id')
      .eq('id', id)
      .single();

    if (groupError) throw groupError;

    // Add membership
    const { data, error } = await supabase
      .from('group_memberships')
      .insert({
        group_id: id,
        user_id: userId
      } as any)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Already in group' });
      }
      throw error;
    }

    res.json({ success: true, membership: data });
  } catch (error: any) {
    console.error('Join group error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/organizations/:id/invite
// Send invitation email to join organization
router.post('/:id/invite', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    res.status(501).json({ error: 'Invite emails are not yet implemented. Please share the organization code manually.' });
  } catch (error: any) {
    console.error('Send invitation error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;