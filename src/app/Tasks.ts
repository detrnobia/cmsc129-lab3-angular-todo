export interface Task {
    id?: number;
    text: string;
    day: string;
    reminder: boolean;
    date?: string;
    time?: string;
    priority: 'high' | 'mid' | 'low';
    dateAdded?: string;
    done?: boolean;
}