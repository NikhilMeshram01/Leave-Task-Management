import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "dateFormat",
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return "";

    const date = new Date(value);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }
}
