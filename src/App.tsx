import { useState, useEffect, useCallback, useRef } from 'react';
import type { TaskStatus } from './types/task';
import { useTaskStore } from './store/useTaskStore';
import { SearchBar } from './components/SearchBar';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { ConfirmDialog } from './components/ConfirmDialog';
import { setupDeclarativeHandler } from './webmcp/declarative';
import { registerCreateTaskTool } from './webmcp/imperative';
import { registerDeleteTaskTool } from './webmcp/human-in-the-loop';
import { TaskCreatorWithHook } from './webmcp/react-hook';
import { ToolInspector } from './demo/ToolInspector';
import { ToolTester } from './demo/ToolTester';
import './demo/demo.css';
import './App.css';

function App() {
  const { tasks, addTask, deleteTask, toggleTask, searchTasks } =
    useTaskStore();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<TaskStatus>('all');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const tasksRef = useRef(tasks);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const getTasks = useCallback(() => tasksRef.current, []);

  useEffect(() => {
    setupDeclarativeHandler(getTasks);
  }, [getTasks]);

  useEffect(() => {
    registerCreateTaskTool(addTask);
    registerDeleteTaskTool(getTasks, deleteTask);
  }, [addTask, deleteTask, getTasks]);

  const filteredTasks = searchTasks(query, status);
  const taskToDelete = pendingDeleteId
    ? filteredTasks.find((t) => t.id === pendingDeleteId)
    : null;

  function handleDeleteRequest(id: string) {
    setPendingDeleteId(id);
  }

  function handleDeleteConfirm() {
    if (pendingDeleteId) {
      deleteTask(pendingDeleteId);
      setPendingDeleteId(null);
    }
  }

  function handleDeleteCancel() {
    setPendingDeleteId(null);
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Task Manager</h1>
        <TaskCreatorWithHook onTaskCreated={addTask} />
      </header>
      <main className="app__main">
        <TaskForm onAdd={addTask} />
        <SearchBar
          query={query}
          status={status}
          onQueryChange={setQuery}
          onStatusChange={setStatus}
        />
        <TaskList
          tasks={filteredTasks}
          onToggle={toggleTask}
          onDelete={handleDeleteRequest}
        />
      </main>
      <ToolInspector />
      <ToolTester />
      {pendingDeleteId && (
        <ConfirmDialog
          message={
            taskToDelete
              ? `Delete "${taskToDelete.title}"?`
              : 'Delete this task?'
          }
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}

export default App;
