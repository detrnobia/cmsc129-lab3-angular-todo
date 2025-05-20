import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import {Task} from '../../Tasks';
import { faTimes, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.css']
})
export class TasksItemComponent implements OnInit{
  @Input() task!: Task;
  faTimes = faTimes;
  faPencilAlt = faPencilAlt;
  @Input() priority!: 'high' | 'mid' | 'low';
  @Output() onDeleteTask: EventEmitter<Task> = new EventEmitter();
  @Output() onToggleDone: EventEmitter<Task> = new EventEmitter();
  @Output() onEditTask: EventEmitter<Task> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  onDelete(task: Task) {
    this.onDeleteTask.emit(task);
  }

  toggleDone(task: Task) {  
    this.onToggleDone.emit(task);
  }

  editTask(task: Task) {
    this.onEditTask.emit(task); 
  }

  isOverdue(task: Task): boolean {
    const now = new Date();
    const dueDate = new Date(task.day || '');
    return !task.done && dueDate < now;
  }
}