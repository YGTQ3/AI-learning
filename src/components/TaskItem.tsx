import { useState } from 'react';
import { LearningTask } from '@/types/schedule';
import { useSchedule } from '@/contexts/ScheduleContext';
import { TaskForm } from './TaskForm';
import { toast } from 'sonner';

interface TaskItemProps {
  task: LearningTask;
}

export function TaskItem({ task }: TaskItemProps) {
  const { toggleTaskCompletion, deleteTask } = useSchedule();
  const [showEditForm, setShowEditForm] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleDelete = async () => {
    if (confirm('确定要删除这个任务吗？')) {
      console.log('准备删除任务:', task.id, task.title); // 添加调试
      try {
        await deleteTask(task.id);
        toast.success('任务已删除');
      } catch (error) {
        console.error('删除任务失败:', error);
        toast.error('删除失败');
      }
    }
  };

  return (
    <>
      <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors border-l-4 border-blue-500">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => toggleTaskCompletion(task.id)}
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
              task.completed 
                ? 'bg-green-100 dark:bg-green-900' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {task.completed && <i className="fa-solid fa-check text-green-600 dark:text-green-400 text-xs"></i>}
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-medium ${
                task.completed 
                  ? 'text-gray-500 dark:text-gray-400 line-through' 
                  : 'text-gray-800 dark:text-gray-200'
              }`}>
                {task.title}
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
              </span>
              {task.category && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                  {task.category}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {task.startTime} - {task.endTime}
            </p>
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {task.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditForm(true)}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="编辑任务"
          >
            <i className="fa-regular fa-pen-to-square"></i>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="删除任务"
          >
            <i className="fa-regular fa-trash-can"></i>
          </button>
        </div>
      </div>

      {showEditForm && (
        <TaskForm
          task={task}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </>
  );
}
