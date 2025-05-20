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
import { MatSnackBar } from '@angular/material/snack-bar';


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
  deletingTask: Task | null = null;

  constructor(private taskService: TaskService, private uiService: UiService, private snackBar: MatSnackBar) {
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
      this.applyFilters(); // Apply filters after fetching tasks
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
    this.deletingTask = task;
  }

  cancelDelete(): void {
    this.deletingTask = null;
  }

  deleteTask(task: Task): void {
    this.taskService.deleteTask(task).subscribe(() => {
      this.tasks = this.tasks.filter((t) => t.id !== task.id); // Remove the task from the list
      this.deletingTask = null; // Close the modal

      // Show a toast notification with an undo option
      const snackBarRef = this.snackBar.open(
        `Task "${task.text}" deleted.`,
        'Undo',
        { duration: 5000 }
      );

      snackBarRef.onAction().subscribe(() => {
        // Undo the deletion
        this.taskService.addTask(task).subscribe((restoredTask: Task) => {
          this.tasks.push(restoredTask); // Add the task back to the list
          this.sortTasks(); // Re-sort the tasks
        });
      });
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
    this.filteredTasks.sort((a, b) => {
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

  
  searchText: string = ''; // Add this property to hold the search text
  filteredTasks: Task[] = [];

  searchTasks(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const lowerSearchText = this.searchText.toLowerCase();
    this.filteredTasks = this.tasks.filter((task) =>
      task.text.toLowerCase().includes(lowerSearchText)
    );
    this.sortTasks(); // Ensure sorting is applied after searching
  }

  isOverdue(task: Task): boolean {
    if (!task.day) return false; // If no due date, it's not overdue
    const dueDate = new Date(task.day);
    const today = new Date();
    return dueDate < today && !task.done; // Overdue if due date is in the past and task is not done
  }
}