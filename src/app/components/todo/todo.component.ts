import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { Filtertype, TodoModel } from '../../models/todo.model';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent implements OnInit {

  newTask = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)]
  })

  editTask = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)]
  })

  constructor() {
    /* Un efecto en Angular se dispara cuando una de las señales que está dentro del mismo efecto cambia */

    // cada vez que el signal cambie, se va a disparar este efecto.
    // en ese caso tambien se dispara el efecto al inicio porque está en el constructor.

    effect(() => {
      localStorage.setItem('task_name', JSON.stringify(this.todoList()));
    })


  }

  ngOnInit(): void {
    const storage = localStorage.getItem('task_name');
    if (!storage) return;
    this.todoList.set(JSON.parse(storage));
  }

  todoList = signal<TodoModel[]>([])

/*   todoList = signal<TodoModel[]>([
    { id: 1, title: 'Buy milk', isCompleted: false, isEditing: false },
    { id: 2, title: 'Buy bread', isCompleted: false, isEditing: false },
    { id: 3, title: 'Buy cheese', isCompleted: false, isEditing: false },
  ]) */

  filter = signal<Filtertype>('all');

  todoListFiltered = computed(() => {
    const updatedFilter = this.filter();
    const updatedToDoList = this.todoList();

    switch (updatedFilter) {
      case 'active':
        return updatedToDoList.filter((todo) => !todo.isCompleted);
      case 'completed':
        return updatedToDoList.filter((todo) => todo.isCompleted);
      default:
        return updatedToDoList;
    }
  })

  onChangefilter(filterString: Filtertype) {
    this.filter.set(filterString);
  }

  onAddToDo() {
    if (this.newTask.invalid) {
      this.newTask.markAllAsTouched();
      this.newTask.reset();
      return
    }
    const newTodoTitle = this.newTask.value.trim();

    this.todoList.update((prep_todos) => {
      return [
        ...prep_todos,
        { id: Date.now(), title: newTodoTitle, isCompleted: false, isEditing: false }
      ]
    });
    this.newTask.reset();
  }

  toggleToDo(todoId: number) {
    this.todoList.update((prev_todos) => prev_todos.map((todo) => {
      return todo.id === todoId ? { ...todo, isCompleted: !todo.isCompleted } : todo;
    }))
  }

  enableEditToDo(todoId: number) {
    this.todoList.update((prev_todos) => prev_todos.map((todo) => {
      return todo.id === todoId
        ? { ...todo, isEditing: true }
        : { ...todo, isEditing: false };
    }))
  }
  
  onEditToDo(todoId: number, enterEvent: Event) {

    const newtitle = (enterEvent.target as HTMLInputElement).value;

    this.todoList.update((prev_todos) => prev_todos.map((todo) => {
      return todo.id === todoId ? { ...todo, title: newtitle, isEditing: false } : todo;
    }))
  }

  onDeleteToDo(todoId: number) {
    this.todoList.update((prev_todos) => prev_todos.filter((todo) => todo.id !== todoId));
  }
}
