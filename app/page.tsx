"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
};

type Filter = "all" | "pending" | "completed";

const STORAGE_KEY = "meu-dia-tasks";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "pending", label: "Pendentes" },
  { id: "completed", label: "Concluídas" },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M10 11v6m4-6v6M5 7l1 13h12l1-13M9 7V4h6v3" />
    </svg>
  );
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    try {
      const savedTasks = window.localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        const parsedTasks: unknown = JSON.parse(savedTasks);
        if (
          Array.isArray(parsedTasks) &&
          parsedTasks.every(
            (task) =>
              typeof task.id === "string" &&
              typeof task.title === "string" &&
              typeof task.completed === "boolean" &&
              typeof task.createdAt === "number",
          )
        ) {
          setTasks(parsedTasks);
        } else {
          setStorageError("Não foi possível carregar as tarefas salvas.");
        }
      }
    } catch {
      setStorageError("Não foi possível acessar as tarefas salvas neste navegador.");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      setStorageError("");
    } catch {
      setStorageError("Não foi possível salvar suas alterações neste navegador.");
    }
  }, [isLoaded, tasks]);

  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;
  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (filter === "pending") return !task.completed;
        if (filter === "completed") return task.completed;
        return true;
      }),
    [filter, tasks],
  );

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) return;

    setTasks((currentTasks) => [
      { id: crypto.randomUUID(), title, completed: false, createdAt: Date.now() },
      ...currentTasks,
    ]);
    setNewTask("");
  }

  function toggleTask(id: string) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function deleteTask(id: string) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
  }

  const greetingDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Meu dia, página inicial">
          <span className="brand-mark"><CheckIcon /></span>
          <span>meu<span className="brand-accent">dia</span></span>
        </a>
        <span className="topbar-note"><span className="status-dot" /> Seu espaço, no seu ritmo</span>
      </header>

      <section className="workspace" aria-labelledby="page-title">
        <aside className="intro-panel">
          <div className="date-label">{greetingDate}</div>
          <h1 id="page-title">Um passo de cada vez<span>.</span></h1>
          <p className="intro-copy">
            Tire as ideias da cabeça e coloque no papel. O resto fica mais leve.
          </p>

          <div className="progress-card">
            <div className="progress-heading">
              <span>Seu progresso</span>
              <span className="progress-fraction">{completedCount}<span> / {tasks.length}</span></span>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Tarefas concluídas"
              aria-valuenow={completedCount}
              aria-valuemin={0}
              aria-valuemax={tasks.length || 1}
            >
              <span
                className="progress-fill"
                style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
              />
            </div>
            <p>
              {tasks.length === 0
                ? "Tudo começa com uma pequena tarefa."
                : completedCount === tasks.length
                  ? "Tudo feito. Você arrasou!"
                  : `${pendingCount} ${pendingCount === 1 ? "tarefa esperando" : "tarefas esperando"} por você.`}
            </p>
          </div>

          <div className="quote-card">
            <span className="quote-mark">“</span>
            <p>Feito é melhor que perfeito.</p>
            <span className="quote-caption">UM LEMBRETE GENTIL</span>
          </div>
        </aside>

        <section className="tasks-panel" aria-label="Lista de tarefas">
          <div className="tasks-heading">
            <div>
              <p className="eyebrow">ORGANIZE SEU DIA</p>
              <h2>Minhas tarefas <span className="task-count">{tasks.length}</span></h2>
            </div>
            <div className="task-summary" aria-label={`${pendingCount} pendentes, ${completedCount} concluídas`}>
              <span className="summary-pending">{pendingCount} pendentes</span>
              <span className="summary-divider" />
              <span>{completedCount} concluídas</span>
            </div>
          </div>

          <form className="add-form" onSubmit={addTask}>
            <label className="sr-only" htmlFor="new-task">Adicionar uma tarefa</label>
            <span className="input-plus"><PlusIcon /></span>
            <input
              id="new-task"
              type="text"
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              placeholder="O que você precisa fazer?"
              maxLength={160}
            />
            <button type="submit" className="add-button" disabled={!newTask.trim()}>
              Adicionar
            </button>
          </form>

          {storageError && <p className="storage-message" role="status">{storageError}</p>}

          <div className="filter-row" role="tablist" aria-label="Filtrar tarefas">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                className={`filter-button${filter === item.id ? " active" : ""}`}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
                {item.id === "all" && <span className="filter-count">{tasks.length}</span>}
                {item.id === "pending" && <span className="filter-count">{pendingCount}</span>}
                {item.id === "completed" && <span className="filter-count">{completedCount}</span>}
              </button>
            ))}
          </div>

          <div className="task-list" role="tabpanel">
            {visibleTasks.length > 0 ? (
              visibleTasks.map((task) => (
                <article className={`task-item${task.completed ? " is-complete" : ""}`} key={task.id}>
                  <button
                    className="task-check"
                    type="button"
                    aria-label={task.completed ? `Marcar ${task.title} como pendente` : `Concluir ${task.title}`}
                    aria-pressed={task.completed}
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.completed && <CheckIcon />}
                  </button>
                  <div className="task-content">
                    <p className="task-title">{task.title}</p>
                    <span className="task-status">{task.completed ? "Concluída" : "Pendente"}</span>
                  </div>
                  <button
                    className="delete-button"
                    type="button"
                    aria-label={`Excluir ${task.title}`}
                    onClick={() => deleteTask(task.id)}
                  >
                    <TrashIcon />
                  </button>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon"><CheckIcon /></div>
                <h3>
                  {filter === "all"
                    ? "Sua lista começa aqui"
                    : filter === "pending"
                      ? "Nenhuma tarefa pendente"
                      : "Nenhuma tarefa concluída"}
                </h3>
                <p>
                  {filter === "all"
                    ? "Adicione uma tarefa e dê o primeiro passo."
                    : "Quando houver tarefas por aqui, elas vão aparecer."}
                </p>
              </div>
            )}
          </div>
          <p className="list-footnote">
            <span className="footnote-sparkle">✳</span> Suas tarefas ficam salvas neste dispositivo.
          </p>
        </section>
      </section>
      <footer className="footer">FEITO COM CALMA <span>·</span> UM DIA DE CADA VEZ</footer>
    </main>
  );
}
