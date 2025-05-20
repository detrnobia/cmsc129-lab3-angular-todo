import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet, RouterModule  } from '@angular/router';
import { HeaderComponent } from './component/header/header.component';
import { TasksComponent } from './component/tasks/tasks.component';
import { AddTaskComponent } from './component/add-task/add-task.component';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from './component/footer/footer.component'
import { MatDialogModule } from '@angular/material/dialog';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterModule, 
    HeaderComponent, 
    TasksComponent, 
    AddTaskComponent, 
    FormsModule,
    FooterComponent,
    MatDialogModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent { }