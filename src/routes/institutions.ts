import { Router, type Request, type Response } from 'express';
import { supabase } from '../lib/supabase.ts';

const router = Router();

// POST /api/institutions
// Create a new institution
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, address, contactEmail, settings, adminUserId } = req.body;

    if (!name || !type || !adminUserId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create institution
    const { data: institution, error: instError } = await supabase
      .from('institutions')
      .insert({
        name,
        type,
        address,
        contact_email: contactEmail,
        settings
      } as any)
      .select()
      .single() as any;

    if (instError) throw instError;

    if (!institution) {
      return res.status(500).json({ error: 'Failed to create institution' });
    }

    // Run profile creation and user update in parallel
    const [profileResult, userResult] = await Promise.all([
      supabase
        .from('institution_profiles')
        .upsert({
          user_id: adminUserId,
          institution_id: institution.id,
          role: 'admin'
        } as any)
        .eq('user_id', adminUserId),
      supabase
        .from('users')
        .upsert({
          id: adminUserId,
          entity_type: 'institution',
          entity_id: institution.id
        } as any)
        .eq('id', adminUserId)
    ]);

    if (profileResult.error) throw profileResult.error;
    if (userResult.error) throw userResult.error;

    res.json({ success: true, institution });
  } catch (error: any) {
    console.error('Create institution error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/institutions/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('institutions')
      .select(`
        *,
        classes (*),
        profiles:institution_profiles (
          user_id,
          role,
          department
        )
      `)
      .eq('id', id)
      .limit(10, { foreignTable: 'classes' })
      .limit(50, { foreignTable: 'profiles' })
      .single();

    if (error) throw error;

    res.json({ institution: data });
  } catch (error: any) {
    console.error('Get institution error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/institutions/:id/classes
// Create a class within an institution
router.post('/:id/classes', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, description, teacherId, gradeLevel, subject } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing class name' });
    }

    const { data, error } = await supabase
      .from('classes')
      .insert({
        institution_id: id,
        name,
        code,
        description,
        teacher_id: teacherId,
        grade_level: gradeLevel,
        subject
      } as any)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, class: data });
  } catch (error: any) {
    console.error('Create class error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/institutions/:id/classes
router.get('/:id/classes', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        memberships:class_memberships (
          student_id,
          status,
          joined_at
        )
      `)
      .eq('institution_id', id)
      .limit(50)
      .limit(30, { foreignTable: 'memberships' });

    if (error) throw error;

    res.json({ classes: data || [] });
  } catch (error: any) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/classes/:id/join
// Join a class with code
router.post('/classes/:id/join', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Verify class exists
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id')
      .eq('id', id)
      .single();

    if (classError) throw classError;

    // Add membership
    const { data, error } = await supabase
      .from('class_memberships')
      .insert({
        class_id: id,
        student_id: userId
      } as any)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Already in class' });
      }
      throw error;
    }

    res.json({ success: true, membership: data });
  } catch (error: any) {
    console.error('Join class error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/institutions/:id/invite
// Send invitation email to join institution
router.post('/:id/invite', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    res.status(501).json({ error: 'Invite emails are not yet implemented. Please share the institution code manually.' });
  } catch (error: any) {
    console.error('Send invitation error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;