import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation, Message, NewMessage } from '../../types/types';
import { LoaderService } from '../loader/loader.service';
import { catchError } from 'rxjs';
import { finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  constructor(private http: HttpClient, private loaderService: LoaderService) {}

  getConversations(): Observable<Conversation[]> {
    this.loaderService.show();
    return this.http.get<Conversation[]>(`conversations/`).pipe(
      catchError((error) => {
        console.error('Error occurred while fetching conversations:', error);
        throw error;
      }),
      finalize(() => this.loaderService.hide())
    );
  }

  createConversation(conversation: { name: string }): Observable<Conversation> {
    this.loaderService.show();
    return this.http
      .post<Conversation>(`conversations/`, conversation)
      .pipe(
        catchError((error) => {
          console.error('Error occurred while creating conversation:', error);
          throw error;
        }),
        finalize(() => this.loaderService.hide())
      );
  }

  deleteConversation(id: number): Observable<void> {
    this.loaderService.show();
    return this.http.delete<void>(`conversations/${id}/`).pipe(
      catchError((error) => {
        console.error('Error occurred while deleting conversation:', error);
        throw error;
      }),
      finalize(() => this.loaderService.hide())
    );
  }
  closeConversation(id: number): Observable<Conversation> {
    this.loaderService.show();
    return this.http
      .post<Conversation>(`conversations/${id}/close/`, {})
      .pipe(
        catchError((error) => {
          console.error('Error occurred while closing conversation:', error);
          throw error;
        }),
        finalize(() => this.loaderService.hide())
      );
  }

  createMessage(message: NewMessage): Observable<Message> {
    this.loaderService.show();
    return this.http.post<Message>(`messages/`, message).pipe(
      catchError((error) => {
        console.error('Error occurred while sending message:', error);
        throw error;
      }),
      finalize(() => this.loaderService.hide())
    );
  }

  getMessages(conversationId: number): Observable<Message[]> {
    this.loaderService.show();
    return this.http
      .get<Message[]>(`messages/?conversation=${conversationId}`)
      .pipe(
        catchError((error) => {
          console.error('Error occurred while fetching messages:', error);
          throw error;
        }),
        finalize(() => this.loaderService.hide())
      );
  }
}
