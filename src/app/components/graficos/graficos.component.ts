import { Component, input, effect, viewChild, ElementRef, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
import { Seleccion } from '../../interface/seleccion';

Chart.register(...registerables);

@Component({
  selector: 'app-graficos',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './graficos.component.html',
  styleUrls: ['./graficos.component.scss']
})
export class GraficosComponent implements OnDestroy {

  selecciones = input<Seleccion[]>([]);

  private canvasDona = viewChild<ElementRef<HTMLCanvasElement>>('canvasDona');

  private charts = new Map<string, Chart>();

  constructor() {
    effect(() => {
      const data   = this.selecciones();
      const canvas = this.canvasDona();
      if (!canvas) return;
      this.renderDona(data, canvas.nativeElement);
    });
  }

  private destroyChart(key: string) {
    this.charts.get(key)?.destroy();
    this.charts.delete(key);
  }

  // Gráfico de donuts: goles totales anotados por cada grupo
  private renderDona(data: Seleccion[], canvas: HTMLCanvasElement) {
    this.destroyChart('dona');

    //Crea un nuevo Array con los grupos existentes
    const grupos = [...new Set(data.map(s => s.grupo))].sort();
    const totales = grupos.map(g =>
      data.filter(s => s.grupo === g).reduce((acc, s) => acc + s.goles, 0)
    );

    const colores = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948'];

    this.charts.set('dona', new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: grupos.map(g => `Grupo ${g}`),
        datasets: [{
          data: totales,
          backgroundColor: colores,
          borderColor: '#fff',
          borderWidth: 3,
          hoverOffset: 12
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#333', padding: 16, font: { size: 13 } }
          },
          title: {
            display: true,
            text: 'Goles totales por grupo — UEFA Euro 2024',
            font: { size: 15, weight: 'bold' },
            color: '#333',
            padding: { bottom: 14 }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed} goles`
            }
          }
        }
      }
    }));
  }

  ngOnDestroy() {
    this.charts.forEach(c => c.destroy());
    this.charts.clear();
  }
}
