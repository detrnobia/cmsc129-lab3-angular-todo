import { Component, OnInit } from '@angular/core';
import { Task } from '../../Tasks';
import { CommonModule } from '@angular/common';
import { TasksItemComponent } from '../task-item/task-item.component';
import { TaskService } from '../../services/task.service';
import { AddTaskComponent } from '../add-task/add-task.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog'; 
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { EditTaskComponent } from '../edit-task/edit-task.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, TasksItemComponent, AddTaskComponent, EditTaskComponent, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  lastDeletedTask?: Task;
  editingTask: Task | null = null;
  sortBy: string = 'dateAddedAsc';
  tasksWithDate: { task: Task; dueDate: Date; dateAdded: Date }[] = [];

  constructor(private taskService: TaskService, private snackBar: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit(): void {                                        
    this.taskService.getTasks().subscribe((tasks: Task[]) => {      // fetches tasks 
      this.tasks = tasks;
      this.tasksWithDate = this.tasks.map(task => ({        // process each task to create new array (to be used later in sorting)
        task,
        dueDate: new Date(task.day),
        dateAdded: task.dateAdded ? new Date(task.dateAdded) : new Date()
      }));
    });
  }  

  confirmDeleteTask(task: Task) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteTask(task);
      }
    });
  }

  deleteTask(task: Task) {
    this.lastDeletedTask = task;
    this.taskService.deleteTask(task).subscribe(() => {         // removing task in db
      this.tasks = this.tasks.filter(t => t.id! !== task.id);

      const snackBarRef = this.snackBar.open('Task Deleted', 'Undo', { duration: 3000 });

      snackBarRef.onAction().subscribe(() => {  // if undo, task is re-added
        if (this.lastDeletedTask) {
          this.addTask(this.lastDeletedTask);
        }
      });
    });
  }

  toggleDone(task: Task) { 
    task.done = !task.done;
    this.taskService.updateTaskDone(task).subscribe();
  }

  addTask(task: Task) {
    task.priority = task.priority || 'low'; // Default to 'low' if not provided
    task.dateAdded = new Date().toISOString(); // Store as Date object
  
    this.taskService.addTask(task).subscribe((newTask: Task) => {
      console.log('Task added:', newTask); // Debugging log
      this.tasks.push(newTask);
      this.tasksWithDate = this.tasks.map(task => ({
        task,
        dueDate: new Date(task.day),
        dateAdded: task.dateAdded ? new Date(task.dateAdded) : new Date() // Ensure it's a Date
      }));
      this.sortTasks();
    });
  }  
  
  editTask(task: Task) {
    this.editingTask = {...task};
  }

  updateTask(updatedTask: Task) {
    updatedTask.priority = updatedTask.priority || 'low'; // Default to 'low' if not provided
    updatedTask.day = `${updatedTask.date} ${updatedTask.time}`;
  
    this.taskService.updateTask(updatedTask).subscribe(() => {            // PUT req to update task in db
      const index = this.tasks.findIndex(task => task.id === updatedTask.id);
      if (index !== -1) {
        this.tasks[index] = updatedTask;                      // replaces old to updated
        this.tasksWithDate = this.tasks.map(task => ({        // rebuilds tasksWithDate[]
          task,
          dueDate: new Date(task.day),
          dateAdded: task.dateAdded ? new Date(task.dateAdded) : new Date()
        }));
        this.sortTasks();
      }
      this.cancelEdit();
    });
  }

  cancelEdit() {
    this.editingTask = null;
  }

sortTasks() {
    this.tasksWithDate = [...this.tasksWithDate].sort((a, b) => {
      switch (this.sortBy) {
        case 'dateAddedAsc':                                      // if negative: older
          return a.dateAdded.getTime() - b.dateAdded.getTime();
        case 'dateAddedDesc':                                     // if positive: new 
          return b.dateAdded.getTime() - a.dateAdded.getTime();
        case 'dueDateAsc':                                        
          return a.dueDate.getTime() - b.dueDate.getTime();
        case 'dueDateDesc':                                       
          return b.dueDate.getTime() - a.dueDate.getTime();
        case 'priorityAsc':                                       // if negative: lower prio
          return this.priorityValue(a.task.priority || 'low') - this.priorityValue(b.task.priority || 'low');
        case 'priorityDesc':                                      // if positive: higher prio
          return this.priorityValue(b.task.priority || 'low') - this.priorityValue(a.task.priority || 'low');
        default:
          return 0;
      }
    });
    this.tasksWithDate = this.tasks.map(task => ({
      task,
      dueDate: task.day ? new Date(task.day) : new Date(), // Default to current date if invalid
      dateAdded: task.dateAdded ? new Date(task.dateAdded) : new Date()
    }));
  }

  priorityValue(priority: 'high' | 'mid' | 'low'): number {
    if (!priority) {
      return 0; // Default value for undefined priority
    }
    return priority === 'high' ? 3 : priority === 'mid' ? 2 : 1;
  }
}