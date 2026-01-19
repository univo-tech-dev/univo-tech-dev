'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export type CommunityPost = {
    id: string
    community_id: string
    user_id: string
    content: string | null
    media_url: string | null
    is_announcement: boolean
    created_at: string
    updated_at: string
    profiles?: {
        full_name: string
        avatar_url: string
    }
}

export type CommunityPostComment = {
    id: string
    post_id: string
    user_id: string
    content: string
    created_at: string
    profiles?: {
        full_name: string
        avatar_url: string
    }
}

export async function getCommunityPosts(communityId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('community_posts')
        .select(`
      *,
      profiles:user_id (full_name, avatar_url)
    `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching posts:', error)
        return []
    }

    return data as CommunityPost[]
}

export async function createPost(communityId: string, content: string, mediaUrl?: string, isAnnouncement: boolean = false) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // Check permissions (Admin or Approved Request)
    // We can rely on RLS, but it's good to fail fast or handle error gracefully

    const { error } = await supabase
        .from('community_posts')
        .insert({
            community_id: communityId,
            user_id: user.id,
            content,
            media_url: mediaUrl,
            is_announcement: isAnnouncement
        })

    if (error) {
        console.error('Error creating post:', error)
        throw new Error('Could not create post')
    }

    revalidatePath(`/community/${communityId}/chat`)
    return { success: true }
}

export async function getPostComments(postId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('community_post_comments')
        .select(`
        *,
        profiles:user_id (full_name, avatar_url)
      `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching comments:', error)
        return []
    }

    return data as CommunityPostComment[]
}

export async function createComment(postId: string, content: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('community_post_comments')
        .insert({
            post_id: postId,
            user_id: user.id,
            content
        })

    if (error) {
        console.error('Error creating comment:', error)
        throw new Error('Could not create comment')
    }

    // We might need to revalidate, or just return success and let client update optimistically
    // Ideally revalidate the specific post area if possible, but path revalidation works
    // revalidatePath(`/community/[id]/chat`) - difficult to know ID here easily without passing it.
    // For now, return success.
    return { success: true }
}

export async function requestPostPermission(communityId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // Check if already has pending or approved
    try {
        const { data: existing, error: fetchError } = await supabase
            .from('community_permission_requests')
            .select('*')
            .eq('community_id', communityId)
            .eq('user_id', user.id)
            .in('status', ['pending', 'approved'])
            .maybeSingle()

        if (fetchError) {
            console.error('Error fetching existing request:', fetchError);
            throw new Error('Database error while checking permissions');
        }

        if (existing) {
            return { success: false, message: 'Zaten beklemede olan veya onaylanmış bir isteğiniz var.' }
        }
    } catch (e: any) {
        console.error('Error in permission check:', e);
        return { success: false, message: e.message || 'Bir hata oluştu' }
    }

    const { error } = await supabase
        .from('community_permission_requests')
        .insert({
            community_id: communityId,
            user_id: user.id,
            status: 'pending'
        })

    if (error) {
        console.error('Error requesting permission:', error)
        throw new Error('Could not request permission')
    }

    return { success: true }
}

export async function getPendingRequests(communityId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('community_permission_requests')
        .select(`
        *,
        profiles:user_id (full_name, avatar_url)
      `)
        .eq('community_id', communityId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error getting requests:', error)
        return []
    }

    return data
}

export async function updateRequestStatus(requestId: string, status: 'approved' | 'rejected') {
    const supabase = await createClient()

    // RLS will check if admin
    const { error } = await supabase
        .from('community_permission_requests')
        .update({ status })
        .eq('id', requestId)

    if (error) {
        console.error('Error updating request:', error)
        throw new Error('Could not update request')
    }

    return { success: true }
}

export async function checkUserPermission(communityId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { hasPermission: false, isAdmin: false }

    // Check if admin
    const { data: community } = await supabase
        .from('communities')
        .select('admin_id')
        .eq('id', communityId)
        .single()

    if (community && community.admin_id === user.id) {
        return { hasPermission: true, isAdmin: true }
    }

    // Check if approved request
    const { data: request } = await supabase
        .from('community_permission_requests')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .single()

    return { hasPermission: !!request, isAdmin: false }
}
