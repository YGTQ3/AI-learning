import { supabase } from '@/lib/supabase';
import { LearningTask } from '@/types/schedule';
import { LearningResource } from '@/types/resource';
import { toast } from 'sonner';

export class SupabaseSyncService {
  // 同步任务到云端
  async syncTasks(userId: string, tasks: LearningTask[]) {
    try {
      // 获取云端现有任务
      const { data: cloudTasks, error: fetchError } = await supabase
        .from('learning_tasks')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) throw fetchError;

      const cloudTaskIds = new Set(cloudTasks?.map(t => t.id) || []);
      const localTaskIds = new Set(tasks.map(t => t.id));

      // 需要上传的新任务
      const tasksToInsert = tasks.filter(task => !cloudTaskIds.has(task.id));
      
      // 需要更新的任务
      const tasksToUpdate = tasks.filter(task => cloudTaskIds.has(task.id));

      // 需要删除的任务（云端有但本地没有）
      const tasksToDelete = cloudTasks?.filter(task => !localTaskIds.has(task.id)) || [];

      // 批量插入新任务
      if (tasksToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('learning_tasks')
          .insert(
            tasksToInsert.map(task => ({
              id: task.id,
              user_id: userId,
              title: task.title,
              description: task.description,
              start_time: task.startTime,
              end_time: task.endTime,
              date: task.date,
              completed: task.completed,
              category: task.category,
              priority: task.priority,
            }))
          );

        if (insertError) throw insertError;
      }

      // 批量更新任务
      for (const task of tasksToUpdate) {
        const { error: updateError } = await supabase
          .from('learning_tasks')
          .update({
            title: task.title,
            description: task.description,
            start_time: task.startTime,
            end_time: task.endTime,
            date: task.date,
            completed: task.completed,
            category: task.category,
            priority: task.priority,
            updated_at: new Date().toISOString(),
          })
          .eq('id', task.id)
          .eq('user_id', userId);

        if (updateError) throw updateError;
      }

      // 删除不存在的任务
      if (tasksToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('learning_tasks')
          .delete()
          .in('id', tasksToDelete.map(t => t.id))
          .eq('user_id', userId);

        if (deleteError) throw deleteError;
      }

      return { success: true, message: '任务同步成功' };
    } catch (error) {
      console.error('同步任务失败:', error);
      return { success: false, message: '任务同步失败' };
    }
  }

  // 从云端获取任务
  async fetchTasks(userId: string): Promise<LearningTask[]> {
    try {
      const { data, error } = await supabase
        .from('learning_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        startTime: task.start_time,
        endTime: task.end_time,
        date: task.date,
        completed: task.completed,
        category: task.category,
        priority: task.priority as 'low' | 'medium' | 'high',
        createdAt: task.created_at,
      })) || [];
    } catch (error) {
      console.error('获取任务失败:', error);
      return [];
    }
  }

  // 同步资源到云端
  async syncResources(userId: string, resources: LearningResource[]) {
    try {
      const { data: cloudResources, error: fetchError } = await supabase
        .from('learning_resources')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) throw fetchError;

      const cloudResourceIds = new Set(cloudResources?.map(r => r.id) || []);
      const localResourceIds = new Set(resources.map(r => r.id));

      const resourcesToInsert = resources.filter(resource => !cloudResourceIds.has(resource.id));
      const resourcesToUpdate = resources.filter(resource => cloudResourceIds.has(resource.id));
      const resourcesToDelete = cloudResources?.filter(resource => !localResourceIds.has(resource.id)) || [];

      // 插入新资源
      if (resourcesToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('learning_resources')
          .insert(
            resourcesToInsert.map(resource => ({
              id: resource.id,
              user_id: userId,
              title: resource.title,
              category: resource.category,
              rating: resource.rating,
              url: resource.url,
              description: resource.description,
            }))
          );

        if (insertError) throw insertError;
      }

      // 更新资源
      for (const resource of resourcesToUpdate) {
        const { error: updateError } = await supabase
          .from('learning_resources')
          .update({
            title: resource.title,
            category: resource.category,
            rating: resource.rating,
            url: resource.url,
            description: resource.description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', resource.id)
          .eq('user_id', userId);

        if (updateError) throw updateError;
      }

      // 删除资源
      if (resourcesToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('learning_resources')
          .delete()
          .in('id', resourcesToDelete.map(r => r.id))
          .eq('user_id', userId);

        if (deleteError) throw deleteError;
      }

      return { success: true, message: '资源同步成功' };
    } catch (error) {
      console.error('同步资源失败:', error);
      return { success: false, message: '资源同步失败' };
    }
  }

  // 从云端获取资源
  async fetchResources(userId: string): Promise<LearningResource[]> {
    try {
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(resource => ({
        id: resource.id,
        title: resource.title,
        category: resource.category,
        rating: resource.rating,
        url: resource.url,
        description: resource.description,
      })) || [];
    } catch (error) {
      console.error('获取资源失败:', error);
      return [];
    }
  }

  // 同步用户设置
  async syncSettings(userId: string, settings: any) {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          theme: settings.theme || 'light',
          notifications: settings.notifications || {},
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      return { success: true, message: '设置同步成功' };
    } catch (error) {
      console.error('同步设置失败:', error);
      return { success: false, message: '设置同步失败' };
    }
  }

  // 获取用户设置
  async fetchSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('获取设置失败:', error);
      return null;
    }
  }
}

export const supabaseSync = new SupabaseSyncService();