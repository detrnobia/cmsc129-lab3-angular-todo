import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../Tasks';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.css']
})
export class EditTaskComponent {
  @Input() task!: Task; 
  @Output() onSaveTask: EventEmitter<Task> = new EventEmitter();
  @Output() onCancelEdit: EventEmitter<void> = new EventEmitter();

  editedTask!: Task;

  ngOnInit(): void {
    this.editedTask = JSON.parse(JSON.stringify(this.task));        // deep copy to avoid modifying original task
  
    if (this.editedTask.day) {
      const [datePart, timePart] = this.editedTask.day.split(' ');
      this.editedTask.date = datePart || ''; 
      this.editedTask.time = timePart || ''; 
    }
  }  

  saveTask() {
    this.editedTask.day = `${this.editedTask.date} ${this.editedTask.time}`;
    this.onSaveTask.emit(this.editedTask); 
  }

  cancelEdit() {
    this.onCancelEdit.emit(); 
  }
}