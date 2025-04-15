const MONTHS = [
    "Januar",
    "Februar",
    "Marts",
    "April",
    "Maj",
    "Juni",
    "Juli",
    "August",
    "September",
    "October",
    "November",
    "December"
];


export function prettyDate(date: Date): string {
    date = new Date(date);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();
    return `${day}. ${MONTHS[month].toLowerCase()}${year !== currentYear ? ` ${year}` : ""}`;
}

export function dateToString(date: Date): string {
    date = new Date(date);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

export function dateToFullString(date: Date): string {
    date = new Date(date);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${day}.${month}.${year}, ${hours}:${minutes}`;
}

export function timeDifference(date1: Date, date2: Date){
    date1 = new Date(date1);
    date2 = new Date(date2);
    const difference = date1.getTime() - date2.getTime();
    const seconds = Math.floor(difference / 1000);
    if(seconds < 60) return `${seconds} sekund${seconds === 1 ? "" : "er"}`;
    const minutes = Math.floor(seconds / 60);
    if(minutes < 60) return `${minutes} minut${minutes === 1 ? "" : "ter"}`;
    const hours = Math.floor(minutes / 60);
    if(hours < 24) return `${hours} time${hours === 1 ? "" : "r"}`;
    const days = Math.floor(hours / 24);
    if(days < 30) return `${days} dag${days === 1 ? "" : "e"}`;
    const months = Math.floor(days / 30);
    if(months < 12) return `${months} måned${months === 1 ? "" : "er"}`;
    const years = Math.floor(days / 365);
    return `${years} år`;
}

export function timeDifferenceShort(date1: Date, date2: Date){
    date1 = new Date(date1);
    date2 = new Date(date2);
    const difference = date1.getTime() - date2.getTime();
    const seconds = Math.floor(difference / 1000);
    if(seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if(minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if(hours < 24) return `${hours}t`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

export function relativeTimeAgoShort(date: Date): string {
    return `${timeDifferenceShort(new Date(), date)} siden`;
}

export function relativeTimeAgo(date: Date): string {
    return `${timeDifference(new Date(), date)} siden`;
}