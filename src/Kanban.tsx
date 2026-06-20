import { useState } from "react";
import type { DragEvent } from "react";

type ColumnName = "toDo" | "inProgress" | "done";

type Columns = {
  toDo: string[];
  inProgress: string[];
  done: string[];
};

type DragData = {
  fromColumn: ColumnName;
  fromIndex: number;
};

function KanbanBoard() {
  const [columns, setColumns] = useState<Columns>({
    toDo: ["Eat Breakfast", "Take a shower", "Walk the dog"],
    inProgress: [],
    done: [],
  });

  const [newTask, setNewTask] = useState("");

  function addTask() {
    if (newTask.trim() === "") return;

    setColumns((current) => ({
      ...current,
      toDo: [...current.toDo, newTask],
    }));

    setNewTask("");
  }

  function deleteTask(column: ColumnName, index: number) {
    setColumns((current) => ({
      ...current,
      [column]: current[column].filter((_, i) => i !== index),
    }));
  }

  function handleDragStart(
    event: DragEvent<HTMLDivElement>,
    fromColumn: ColumnName,
    fromIndex: number
  ) {
    const data: DragData = { fromColumn, fromIndex };
    event.dataTransfer.setData("task", JSON.stringify(data));
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
    toColumn: ColumnName,
    toIndex: number
  ) {
    event.preventDefault();

    const data = event.dataTransfer.getData("task");
    if (!data) return;

    const { fromColumn, fromIndex } = JSON.parse(data) as DragData;

    setColumns((current) => {
      const sourceTasks = [...current[fromColumn]];
      const destinationTasks = [...current[toColumn]];

      const [movedTask] = sourceTasks.splice(fromIndex, 1);

      if (!movedTask) return current;

      if (fromColumn === toColumn) {
        sourceTasks.splice(toIndex, 0, movedTask);

        return {
          ...current,
          [fromColumn]: sourceTasks,
        };
      }

      destinationTasks.splice(toIndex, 0, movedTask);

      return {
        ...current,
        [fromColumn]: sourceTasks,
        [toColumn]: destinationTasks,
      };
    });
  }

  function handleDropAtEnd(
    event: DragEvent<HTMLDivElement>,
    toColumn: ColumnName
  ) {
    handleDrop(event, toColumn, columns[toColumn].length);
  }

  return (
    <div className="kanban-board">
      <h1>Kanban Board</h1>

      <div className="task-input">
        <input
            type="text"
            placeholder="Enter a task..."
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
        />
        <button className="add-button" onClick={addTask}> Add </button>
    </div>

      <div className="columns">
        <KanbanColumn
          title="To Do"
          column="toDo"
          tasks={columns.toDo}
          onDelete={deleteTask}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onDropAtEnd={handleDropAtEnd}
        />

        <KanbanColumn
          title="In Progress"
          column="inProgress"
          tasks={columns.inProgress}
          onDelete={deleteTask}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onDropAtEnd={handleDropAtEnd}
        />

        <KanbanColumn
          title="Done"
          column="done"
          tasks={columns.done}
          onDelete={deleteTask}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onDropAtEnd={handleDropAtEnd}
        />
      </div>
    </div>
  );
}

type KanbanColumnProps = {
  title: string;
  column: ColumnName;
  tasks: string[];
  onDelete: (column: ColumnName, index: number) => void;
  onDragStart: (
    event: DragEvent<HTMLDivElement>,
    column: ColumnName,
    index: number
  ) => void;
  onDrop: (
    event: DragEvent<HTMLDivElement>,
    column: ColumnName,
    index: number
  ) => void;
  onDropAtEnd: (
    event: DragEvent<HTMLDivElement>,
    column: ColumnName
  ) => void;
};

function KanbanColumn({
  title,
  column,
  tasks,
  onDelete,
  onDragStart,
  onDrop,
  onDropAtEnd,
}: KanbanColumnProps) {
  return (
    <div
      className="kanban-column"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => onDropAtEnd(event, column)}
    >
      <h2>{title}</h2>

      {tasks.map((task, index) => (
        <div
          className="kanban-card"
          key={`${task}-${index}`}
          draggable
          onDragStart={(event) => onDragStart(event, column, index)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.stopPropagation();
            onDrop(event, column, index);
          }}
        >
          <span>{task}</span>

          <button className="delete-button" onClick={() => onDelete(column, index)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default KanbanBoard;