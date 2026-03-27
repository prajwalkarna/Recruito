const db = require('../db');

async function optimizeDatabase() {
    try {
        console.log('🔧 Optimizing database...');

        // Create indexes if they don't exist
        const indexes = [
            // Users
            'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
            'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
            'CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)',

            // Jobs
            'CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC)',

            // Applications
            'CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id)',
            'CREATE INDEX IF NOT EXISTS idx_applications_freelancer_id ON applications(freelancer_id)',
            'CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)',
            'CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications(applied_at DESC)',

            // Messages
            'CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)',
            'CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id)',
            'CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at DESC)',

            // Notifications
            'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)',
            'CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC)',

            // CVs
            'CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id)',

            // Portfolios
            'CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id)',

            // Saved Jobs
            'CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id)'
        ];

        for (const query of indexes) {
            await db.query(query);
            console.log('✅', query.split('idx_')[1]?.split(' ON')[0]);
        }

        console.log('');
        console.log('🎉 Database optimization complete!');
        console.log('');
        console.log('Performance improvements:');
        console.log('  ✅ Faster user lookups');
        console.log('  ✅ Faster job queries');
        console.log('  ✅ Faster application searches');
        console.log('  ✅ Faster message retrieval');
        console.log('  ✅ Faster notification loading');

        process.exit(0);
    } catch (error) {
        console.error('❌ Optimization failed:', error);
        process.exit(1);
    }
}

optimizeDatabase();