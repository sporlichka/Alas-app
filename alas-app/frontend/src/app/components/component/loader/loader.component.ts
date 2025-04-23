import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../../../services/loader/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css',
})
export class LoaderComponent implements OnInit {
  isLoading = false;

  constructor(private loaderService: LoaderService) {}
  ngOnInit(): void {
    this.loaderService.loading$.subscribe((value) => {
      this.isLoading = value;
    });
  }
}
