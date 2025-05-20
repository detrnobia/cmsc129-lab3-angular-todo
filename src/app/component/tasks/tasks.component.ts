import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../Tasks';
import { TaskService } from '../../services/task.service';
import { UiService } from '../../services/ui.service';
import { Subscription } from 'rxjs';
import { TasksItemComponent } from '../task-item/task-item.component';
import { AddTaskComponent } from '../add-task/add-task.component';
import { EditTaskComponent } from '../edit-task/edit-task.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TasksItemComponent,
    AddTaskComponent,
    EditTaskComponent,
  ],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  editingTask: Task | null = null;
  sortBy: string = 'dateAddedAsc';
  showAddTask: boolean = false;
  subscription: Subscription;

  constructor(private taskService: TaskService, private uiService: UiService) {
    this.subscription = this.uiService
      .onToggle()
      .subscribe((value: boolean) => (this.showAddTask = value));
  }

  ngOnInit(): void {
    this.fetchTasks();
  }

  fetchTasks(): void {
    this.taskService.getTasks().subscribe((tasks: Task[]) => {
      this.tasks = tasks;
      this.sortTasks();
    });
  }

  addTask(task: Task): void {
    this.taskService.addTask(task).subscribe((newTask: Task) => {
      this.tasks.push(newTask);
      this.sortTasks();
    });
  }

  updateTask(updatedTask: Task): void {
    this.taskService.updateTask(updatedTask).subscribe(() => {
      const index = this.tasks.findIndex((task) => task.id === updatedTask.id);
      if (index !== -1) {
        this.tasks[index] = updatedTask;
      }
      this.editingTask = null;
      this.sortTasks();
    });
  }

  confirmDeleteTask(task: Task): void {
    if (confirm(`Are you sure you want to delete the task: "${task.text}"?`)) {
      this.deleteTask(task);
    }
  }

  deleteTask(task: Task): void {
    this.taskService.deleteTask(task).subscribe(() => {
      this.tasks = this.tasks.filter((t) => t.id !== task.id);
    });
  }

  toggleDone(task: Task): void {
    task.done = !task.done;
    this.taskService.updateTask(task).subscribe(() => {
      this.sortTasks();
    });
  }

  editTask(task: Task): void {
    this.editingTask = { ...task };
  }

  cancelEdit(): void {
    this.editingTask = null;
  }

  sortTasks(): void {
    this.tasks.sort((a, b) => {
      if (a.done !== b.done) {
        return a.done ? 1 : -1; // Completed tasks go to the bottom
      }
      switch (this.sortBy) {
        case 'dateAddedAsc':
          return (
            new Date(a.dateAdded || 0).getTime() -
            new Date(b.dateAdded || 0).getTime()
          );
        case 'dateAddedDesc':
          return (
            new Date(b.dateAdded || 0).getTime() -
            new Date(a.dateAdded || 0).getTime()
          );
        case 'dueDateAsc':
          return (
            new Date(a.day || 0).getTime() - new Date(b.day || 0).getTime()
          );
        case 'dueDateDesc':
          return (
            new Date(b.day || 0).getTime() - new Date(a.day || 0).getTime()
          );
        case 'priorityAsc':
          return this.priorityValue(a.priority) - this.priorityValue(b.priority);
        case 'priorityDesc':
          return this.priorityValue(b.priority) - this.priorityValue(a.priority);
        default:
          return 0;
      }
    });
  }

  priorityValue(priority: 'high' | 'mid' | 'low'): number {
    return priority === 'high' ? 3 : priority === 'mid' ? 2 : 1;
  }
}