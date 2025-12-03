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

export function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function formatToSqlTimestamp(date: Date): string {
  return date.toISOString().slice(0, 26);
}



export function getLocalImage(name: string) {
  return 'http://localhost:8080/uploads/' + name
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


