import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export async function getNotifications(userId) {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
}

export async function sendNotification(userId, type, title, message) {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .insert([{
                user_id: userId,
                type,
                title,
                message,
                is_read: false,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
}

export async function markNotificationAsRead(notificationId) {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .update({
                is_read: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', notificationId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
}

export async function markAllNotificationsAsRead(userId) {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .update({
                is_read: true,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('is_read', false)
            .select();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
}

export async function deleteNotification(notificationId) {
    try {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
}

export async function deleteAllNotifications(userId) {
    try {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting all notifications:', error);
        throw error;
    }
}

// Fungsi helper untuk mengirim notifikasi berdasarkan jenis aktivitas
export async function sendFoodJournalNotification(userId, foodName) {
    return sendNotification(
        userId,
        'reminder',
        'Pengingat Makanan',
        `Jangan lupa untuk mencatat makanan "${foodName}" di jurnal Anda hari ini!`
    );
}

export async function sendAchievementNotification(userId, achievementName) {
    return sendNotification(
        userId,
        'achievement',
        'Pencapaian Baru!',
        `Selamat! Anda telah mendapatkan pencapaian "${achievementName}"`
    );
}

export async function sendRecommendationNotification(userId, foodName) {
    return sendNotification(
        userId,
        'recommendation',
        'Rekomendasi Makanan',
        `Kami memiliki rekomendasi makanan "${foodName}" untuk Anda berdasarkan mood Anda hari ini!`
    );
}

export async function sendCommunityNotification(userId, postTitle) {
    return sendNotification(
        userId,
        'community',
        'Aktivitas Komunitas',
        `Ada posting baru "${postTitle}" yang mungkin menarik minat Anda!`
    );
} 