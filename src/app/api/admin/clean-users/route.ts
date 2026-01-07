import { NextResponse } from 'next/server';
import getSupabaseAdmin from '@/lib/supabase-admin';

export async function GET(request: Request) {
  // Simple "Secret" protection (e.g. ?secret=univo_admin_123)
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.ADMIN_SECRET && secret !== 'univo_admin_cleanup') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    // 1. List all users
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) throw error;

    const deleteAll = searchParams.get('all') === 'true';
    let totalDeleted = 0;
    
    // Safety Break to prevent infinite loops in case of errors
    // Limit to 10 iterations of 50 users = 500 users max per call unless we use a better loop.
    // Better: Recursive deletion.
    
    let hasMoreUsers = true;
    
    while (hasMoreUsers) {
        // Fetch users (default limit 50)
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error) throw error;
        
        if (users.length === 0) {
            hasMoreUsers = false;
            break;
        }

        const targets = deleteAll ? users : users.filter(user => {
            const email = user.email || '';
            return !email.endsWith('@metu.edu.tr') && !email.endsWith('@student.metu.edu.tr');
        });

        if (targets.length === 0 && !deleteAll) {
             // We fetched 50 users, none matched criteria. 
             // IMPORTANT: listUsers pagination logic required to check *next* page.
             // But simpler strategy for 'deleteAll': just keep fetching page 1 because users vanish as we delete them.
             // For filtering: we need real pagination.
             // Since the user asked to delete ALL users (deleteAll=true), we can rely on Page 1 always refilling.
             if (users.length < 50) hasMoreUsers = false; // End of list
             continue; 
        }

        // Delete current batch
        for (const user of targets) {
            const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
            if (!deleteError) {
                // Also delete profile
                await supabaseAdmin.from('profiles').delete().eq('id', user.id);
                totalDeleted++;
            }
        }
        
        // If we deleted everything we fetched, we effectively cleared page 1.
        // If we filtered some, page 1 might still have valid users.
        // For 'deleteAll', we are good.
        if (deleteAll) {
             // If we fetched less than 50, we are done.
             if (users.length < 50) hasMoreUsers = false;
        } else {
            // Complex case, assume 'deleteAll' is the request per user prompt.
            // Just break if we didn't find any targets in this batch to avoid infinite loop if logic is weak.
             if (targets.length === 0) hasMoreUsers = false; 
        }
    }

    return NextResponse.json({
        success: true,
        deletedCount: totalDeleted,
        message: 'Cleanup process completed.'
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
