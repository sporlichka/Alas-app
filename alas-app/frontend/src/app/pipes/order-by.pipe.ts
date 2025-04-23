import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy',
  standalone: true,
})
export class OrderByPipe implements PipeTransform {
  transform(array: any[], field: string, descending: boolean = false): any[] {
    if (!Array.isArray(array) || array.length === 0) {
      return array;
    }

    return array.sort((a, b) => {
      const valueA = a[field];
      const valueB = b[field];

      if (valueA > valueB) {
        return descending ? -1 : 1;
      } else if (valueA < valueB) {
        return descending ? 1 : -1;
      } else {
        return 0;
      }
    });
  }
}
