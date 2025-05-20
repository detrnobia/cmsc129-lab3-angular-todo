import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../services/ui.service';
import { Subscription } from 'rxjs';
import { Task } from '../../Tasks';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css']
})
export class AddTaskComponent implements OnInit {
  @Output() onAddTask: EventEmitter<Task> = new EventEmitter();
  text?: string;
  date: string = '';
  time: string = '';
  priority: 'high' | 'mid' | 'low' = 'low'; 
  dateAdded: string = '';
  showAddTask?: boolean;
  subscription: Subscription;

  constructor(){}

  ngOnInit(): void {}

  onSubmit() {
    if (!this.text) {
      alert('Please add a task!');
      return;
    }
    if (!this.date || !this.time) {
      alert('Please select both date and time!');
      return;
    }

    const newTask: Task = {
      text: this.text,
      day: `${this.date} ${this.time}`, 
      priority: this.priority, 
      date: this.date,
      time: this.time,
      dateAdded: new Date().toISOString(),
      reminder: false, // Default value for reminder
      done: false, // Default value for done
    };

    this.onAddTask.emit(newTask);  //clears the form
    this.text = '';
    this.date = '';
    this.time = '';
    this.priority = 'low'; 
  }
}