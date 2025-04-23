import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessagingService } from '../../../services/messaging/messaging.service';
import { Conversation, Message, NewMessage } from '../../../types/types';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrderByPipe } from '../../../pipes/order-by.pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mesagging-admin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, OrderByPipe],
  templateUrl: './mesagging-admin.component.html',
  styleUrl: './mesagging-admin.component.css',
})
export class MesaggingAdminComponent implements OnInit {
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  messageForm: FormGroup;

  constructor(
    private messagingService: MessagingService,
    private fb: FormBuilder
  ) {
    this.messageForm = this.fb.group({
      content: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.messagingService.getConversations().subscribe({
      next: (conversations: Conversation[]) => {
        this.conversations = conversations;
      },
      error: (error) => {
        console.error('Error loading conversations', error);
      },
    });
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.loadMessages(conversation.id);
  }

  loadMessages(conversationId: number): void {
    {
      this.messagingService.getMessages(conversationId).subscribe({
        next: (data: Message[]) => {
          this.messages = data;
        },
        error: (error) => {
          console.error('Error loading messages', error);
        },
      });
    }
  }

  sendMessage(event: Event): void {
    if (this.selectedConversation) {
      const content = this.messageForm.get('content')?.value;
      const newMessage: NewMessage = {
        content,
        conversation: this.selectedConversation.id,
      };
      this.messagingService.createMessage(newMessage).subscribe({
        next: (message: Message) => {
          this.messages.unshift(message);
          this.messageForm.reset();
        },
        error: (error) => {
          console.error('Error sending message', error);
        },
      });
    }
  }

  closeConversation(conversationId: number): void {
    this.messagingService.closeConversation(conversationId).subscribe({
      next: () => {
        this.loadConversations();
        this.selectedConversation = null;
      },
      error: (error) => {
        console.error('Error closing conversation', error);
      },
    });
  }

  deleteConversation(conversationId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      color: '#ffffff',
      width: 300,
      heightAuto: true,
      background: '#000',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.messagingService.deleteConversation(conversationId).subscribe({
          next: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'The conversation has been deleted.',
              icon: 'success',
              color: '#ffffff',
              width: 300,
              heightAuto: true,
              background: '#000',
              showConfirmButton: true,
              confirmButtonColor: '#000',
            });
            this.loadConversations();
            this.selectedConversation = null;
          },
          error: (error) => {
            Swal.fire({
              title: 'Error!',
              text: 'Something went wrong, please try again.',
              icon: 'error',
              color: '#ffffff',
              background: '#000',
              confirmButtonColor: '#000',
              width: 300,
              heightAuto: true,
            });
            console.error('Error deleting conversation', error);
          },
        });
      }
    });
  }
}
