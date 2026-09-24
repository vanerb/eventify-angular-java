import themesIcons from '../json/themes.json';



export function sleep(millis: number) {
  return new Promise(resolve => setTimeout(resolve, millis));
}


export function transformDate(dateISO: string): string {
  const date = new Date(dateISO);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function transformDateHour(dateISO: string) {
  const date = new Date(dateISO);
  return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}); // solo hora:minutos
}

export function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function formatToSqlTimestamp(date: Date): string {
  return date.toISOString().slice(0, 26);
}

export function getImage(img: string|null|undefined){
  if(!img){
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 420'%3E%3Crect width='640' height='420' fill='%23f1eaff'/%3E%3Ccircle cx='320' cy='210' r='112' fill='%23e3d9f8'/%3E%3Cpath d='M320 125l26 61 64 24-64 24-26 61-26-61-64-24 64-24z' fill='%237454d8'/%3E%3C/svg%3E";
  }
  else{
    return 'http://localhost:8080'+img
  }
}


export function getThemesIcon(platformId: number) {
  const p = themesIcons.find(p => p.id === platformId);
  return p ? p.icon : '';
}

export function getThemes() {
  return themesIcons;
}

export function cleanUrlImage(url?: string) {

  if(url){
    url = url.replace(/\\/g, '/');
  }



  return url
}


