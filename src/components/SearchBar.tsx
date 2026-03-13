import type { TaskStatus } from '../types/task';

interface SearchBarProps {
  query: string;
  status: TaskStatus;
  onQueryChange: (query: string) => void;
  onStatusChange: (status: TaskStatus) => void;
}

export function SearchBar({
  query,
  status,
  onQueryChange,
  onStatusChange,
}: SearchBarProps) {
  return (
    <form
      className="search-bar"
      onSubmit={(e) => e.preventDefault()}
      toolname="search-tasks"
      tooldescription="Search tasks by keyword and filter by status"
      toolautosubmit=""
    >
      <input
        name="query"
        type="text"
        className="search-bar__input"
        placeholder="Search tasks..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      <select
        name="status"
        className="search-bar__select"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>
    </form>
  );
}
