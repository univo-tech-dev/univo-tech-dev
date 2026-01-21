/**
 * Supabase Storage Bucket Migration Script
 * Migrates ALL buckets from old Supabase project to new one
 * 
 * Usage:
 * 1. Set environment variables in .env.migration (create this file)
 * 2. Run: npx ts-node src/scripts/migrate-avatars.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load .env.local first (new project credentials)
dotenv.config({ path: '.env.local' });
// Then load migration-specific env (old project credentials)
dotenv.config({ path: '.env.migration' });

const OLD_SUPABASE_URL = process.env.OLD_SUPABASE_URL!;
const OLD_SUPABASE_SERVICE_KEY = process.env.OLD_SUPABASE_SERVICE_KEY!;
const NEW_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const NEW_SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!OLD_SUPABASE_URL || !OLD_SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing OLD Supabase credentials in .env.migration');
    process.exit(1);
}

if (!NEW_SUPABASE_URL || !NEW_SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing NEW Supabase credentials in .env.local');
    process.exit(1);
}

const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_SERVICE_KEY);
const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

async function listAllFiles(client: any, bucket: string, folder: string = ''): Promise<string[]> {
    const files: string[] = [];
    
    const { data, error } = await client.storage.from(bucket).list(folder, {
        limit: 1000,
        offset: 0,
    });

    if (error) {
        console.error(`Error listing files in ${bucket}/${folder}:`, error.message);
        return files;
    }

    for (const item of data || []) {
        const itemPath = folder ? `${folder}/${item.name}` : item.name;
        
        if (item.id === null) {
            const subFiles = await listAllFiles(client, bucket, itemPath);
            files.push(...subFiles);
        } else {
            files.push(itemPath);
        }
    }

    return files;
}

async function migrateFile(bucketName: string, filePath: string): Promise<boolean> {
    try {
        console.log(`    📥 Downloading: ${filePath}`);
        
        const { data: fileData, error: downloadError } = await oldSupabase.storage
            .from(bucketName)
            .download(filePath);

        if (downloadError || !fileData) {
            console.error(`    ❌ Download failed: ${downloadError?.message}`);
            return false;
        }

        const arrayBuffer = await fileData.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`    📤 Uploading: ${filePath} (${(buffer.length / 1024).toFixed(1)} KB)`);

        const { error: uploadError } = await newSupabase.storage
            .from(bucketName)
            .upload(filePath, buffer, {
                contentType: fileData.type,
                upsert: true
            });

        if (uploadError) {
            console.error(`    ❌ Upload failed: ${uploadError.message}`);
            return false;
        }

        console.log(`    ✅ Migrated: ${filePath}`);
        return true;
    } catch (err: any) {
        console.error(`    ❌ Error: ${err.message}`);
        return false;
    }
}

async function migrateBucket(bucketName: string): Promise<{ success: number; failed: number }> {
    console.log(`\n📦 Migrating bucket: ${bucketName}`);
    console.log('─'.repeat(40));

    // Ensure bucket exists in new project
    const { data: buckets } = await newSupabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucketName);
    
    if (!bucketExists) {
        console.log(`  Creating bucket "${bucketName}" in new project...`);
        const { error } = await newSupabase.storage.createBucket(bucketName, {
            public: true
        });
        if (error && !error.message.includes('already exists')) {
            console.error(`  ❌ Failed to create bucket: ${error.message}`);
            return { success: 0, failed: 0 };
        }
    }

    // List all files
    const files = await listAllFiles(oldSupabase, bucketName);
    
    if (files.length === 0) {
        console.log(`  ⚠️  No files found in bucket`);
        return { success: 0, failed: 0 };
    }

    console.log(`  Found ${files.length} files\n`);

    let success = 0;
    let failed = 0;

    for (const file of files) {
        const result = await migrateFile(bucketName, file);
        if (result) success++;
        else failed++;
    }

    return { success, failed };
}

async function main() {
    console.log('🚀 Starting Full Storage Migration');
    console.log('━'.repeat(50));
    console.log(`Old Project: ${OLD_SUPABASE_URL}`);
    console.log(`New Project: ${NEW_SUPABASE_URL}`);
    console.log('━'.repeat(50));

    // Get all buckets from old project
    const { data: oldBuckets, error } = await oldSupabase.storage.listBuckets();
    
    if (error || !oldBuckets) {
        console.error('❌ Failed to list buckets:', error?.message);
        process.exit(1);
    }

    // Skip already migrated avatars bucket
    const bucketsToMigrate = oldBuckets.filter(b => b.name !== 'avatars');
    
    console.log(`\n📋 Found ${oldBuckets.length} buckets total`);
    console.log(`   Already migrated: avatars`);
    console.log(`   To migrate: ${bucketsToMigrate.map(b => b.name).join(', ') || 'none'}`);

    let totalSuccess = 0;
    let totalFailed = 0;

    for (const bucket of bucketsToMigrate) {
        const result = await migrateBucket(bucket.name);
        totalSuccess += result.success;
        totalFailed += result.failed;
    }

    // Summary
    console.log('\n' + '━'.repeat(50));
    console.log('📊 Migration Complete');
    console.log(`   ✅ Total Success: ${totalSuccess}`);
    console.log(`   ❌ Total Failed: ${totalFailed}`);
    console.log('━'.repeat(50));
}

main().catch(console.error);
